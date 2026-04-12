import asyncio
import time
import logging
import uuid
import os

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, HttpUrl
from redis.asyncio import Redis

from app.utils.helpers import download_image, get_optimized_url
from app.dependencies import get_ai_engine, get_vector_store
from app.schema.schemas import (
    IndexRequest,
    IndexResponse,
    VideoIndexRequest,
    VideoIndexResponse,
    DetectionResult,
    FindUserRequest,
    FindUserResponse,
    MatchResult,
    ProcessingCallbackPayload,
)

logger = logging.getLogger(__name__)

router = APIRouter()

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
QUEUE_KEY = os.getenv("MEDIA_QUEUE_KEY", "grabpic:media:queue")


class QueueJob(BaseModel):
    job_id: str
    media_type: str
    event_id: str
    source_url: HttpUrl
    callback_url: HttpUrl


redis_client: Redis | None = None
worker_task: asyncio.Task | None = None


async def _post_callback(callback_url: str, payload: ProcessingCallbackPayload) -> None:
    max_retries = 3
    for attempt in range(1, max_retries + 1):
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(callback_url, json=payload.model_dump())
            response.raise_for_status()
            return
        except Exception as exc:
            logger.warning(
                "Callback attempt %s/%s failed for job %s: %s",
                attempt,
                max_retries,
                payload.job_id,
                exc,
            )
            if attempt < max_retries:
                await asyncio.sleep(2 * attempt)


async def _process_single_job(job: QueueJob) -> ProcessingCallbackPayload:
    ai_engine = get_ai_engine()
    store = get_vector_store()

    optimized_url = get_optimized_url(str(job.source_url))
    media_bytes = await download_image(optimized_url)

    if job.media_type == "image":
        result = await asyncio.to_thread(ai_engine.process_media, media_bytes)
    else:
        result = await asyncio.to_thread(ai_engine.process_video, media_bytes)

    detections: list[DetectionResult] = []

    if result.face_count > 0:
        event_idx, event_path = await asyncio.to_thread(store.get_event_index, job.event_id)
        base_id = int(time.time_ns() / 1000)

        for i in range(result.face_count):
            det_id = base_id + i
            embedding = result.embeddings[i]
            await asyncio.to_thread(store.add_to_index, event_idx, event_path, embedding, det_id)
            detections.append(
                DetectionResult(
                    detection_id=det_id,
                    box=result.faces[i].box,
                )
            )

    return ProcessingCallbackPayload(
        job_id=job.job_id,
        event_id=job.event_id,
        media_type=job.media_type,
        source_url=str(job.source_url),
        status="completed",
        detections=detections,
    )


async def _queue_worker() -> None:
    logger.info("Media queue worker started")
    while True:
        try:
            if redis_client is None:
                await asyncio.sleep(1)
                continue

            queue_item = await redis_client.blpop(QUEUE_KEY, timeout=5)
            if queue_item is None:
                continue

            _, raw_job = queue_item
            job = QueueJob.model_validate_json(raw_job)

            try:
                payload = await _process_single_job(job)
            except Exception as exc:
                logger.exception("Queue job failed for %s", job.job_id)
                payload = ProcessingCallbackPayload(
                    job_id=job.job_id,
                    event_id=job.event_id,
                    media_type=job.media_type,
                    source_url=str(job.source_url),
                    status="failed",
                    detections=[],
                    error=str(exc),
                )

            await _post_callback(str(job.callback_url), payload)
        except asyncio.CancelledError:
            break
        except Exception as exc:
            logger.exception("Queue worker loop failed: %s", exc)
            await asyncio.sleep(1)


async def start_processing_worker() -> None:
    global redis_client
    global worker_task
    redis_client = Redis.from_url(REDIS_URL, decode_responses=True)
    await redis_client.ping()

    if worker_task is None or worker_task.done():
        worker_task = asyncio.create_task(_queue_worker())


async def stop_processing_worker() -> None:
    global redis_client
    global worker_task
    if worker_task is None:
        if redis_client is not None:
            await redis_client.aclose()
            redis_client = None
        return

    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass
    finally:
        worker_task = None
        if redis_client is not None:
            await redis_client.aclose()
            redis_client = None


async def _enqueue_job(media_type: str, event_id: str, source_url: HttpUrl, callback_url: HttpUrl) -> dict:
    if redis_client is None:
        raise RuntimeError("Redis client is not initialized.")

    job = QueueJob(
        job_id=str(uuid.uuid4()),
        media_type=media_type,
        event_id=event_id,
        source_url=source_url,
        callback_url=callback_url,
    )
    queue_size = await redis_client.rpush(QUEUE_KEY, job.model_dump_json())
    return {
        "job_id": job.job_id,
        "event_id": event_id,
        "media_type": media_type,
        "status": "queued",
        "message": "Media accepted for async processing.",
        "queue_size": int(queue_size),
    }


@router.post("/index-event-photo", response_model=IndexResponse, status_code=202)
async def index_event_photo(
    request: IndexRequest,
):
    try:
        return await _enqueue_job(
            media_type="image",
            event_id=request.event_id,
            source_url=request.image_url,
            callback_url=request.callback_url,
        )
    except Exception as exc:
        logger.error("Failed to enqueue image job for %s: %s", request.image_url, exc)
        raise HTTPException(status_code=500, detail="Failed to enqueue image for processing.")


@router.post("/index-event-video", response_model=VideoIndexResponse, status_code=202)
async def index_event_video(
    request: VideoIndexRequest,
):
    try:
        return await _enqueue_job(
            media_type="video",
            event_id=request.event_id,
            source_url=request.video_url,
            callback_url=request.callback_url,
        )
    except Exception as exc:
        logger.error("Failed to enqueue video job for %s: %s", request.video_url, exc)
        raise HTTPException(status_code=500, detail="Failed to enqueue video for processing.")


@router.post("/find-user-matches", response_model=FindUserResponse)
async def find_user_matches(
    request: FindUserRequest,
    store = Depends(get_vector_store)
):
    """
    Takes a registered face_id and searches an event index.
    Works instantly even for late-registering users.
    """
    # Retrieve the Master Embedding for the user
    user_embedding = store.get_user_embedding(request.face_id)
    if user_embedding is None:
        raise HTTPException(status_code=404, detail="User face_id not found in master index.")

    event_idx, _ = store.get_event_index(request.event_id)
    
    if event_idx.ntotal == 0:
        return {
            "face_id": request.face_id,
            "event_id": request.event_id,
            "matches": []
        }

    distances, indices = store.search_index(event_idx, user_embedding.tolist(), top_k=100)

    # 4. Filter and return matches within threshold
    matches = []
    for dist, idx in zip(distances, indices):
        if dist <= request.threshold:
            matches.append(MatchResult(
                detection_id=int(idx),
                distance=float(dist)
            ))

    return {
        "face_id": request.face_id,
        "event_id": request.event_id,
        "matches": matches
    }