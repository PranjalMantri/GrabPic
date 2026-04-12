from fastapi import APIRouter, Depends, HTTPException
import time
import logging

from app.utils.helpers import download_image, get_optimized_url
from app.dependencies import get_ai_engine, get_vector_store
from app.schema.schemas import IndexRequest, IndexResponse, VideoIndexRequest, VideoIndexResponse, DetectionResult, FindUserRequest, FindUserResponse, MatchResult

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/index-event-photo", response_model=IndexResponse)
async def index_event_photo(
    request: IndexRequest,
    ai_engine = Depends(get_ai_engine),
    store = Depends(get_vector_store)
):
    """
    HEAVY ROUTE: Downloads image, detects all faces, and saves them to an event-specific index.
    Does not check for user identity yet.
    """
    # 1. Optimize and Download
    optimized_url = get_optimized_url(request.image_url)
    try:
        image_bytes = await download_image(optimized_url)
    except Exception as e:
        logger.error(f"Download failed for {request.image_url}: {e}")
        raise HTTPException(status_code=400, detail="Failed to download image.")

    result = ai_engine.process_media(image_bytes)
    
    if result.face_count == 0:
        return {
            "event_id": request.event_id,
            "image_url": str(request.image_url),
            "detections": []
        }

    # create event specific index
    event_idx, event_path = store.get_event_index(request.event_id)
    
    # saving embeddings with unique id
    base_id = int(time.time() * 1000)
    detections = []
    
    for i in range(result.face_count):
        det_id = base_id + i
        embedding = result.embeddings[i]
        
        store.add_to_index(event_idx, event_path, embedding, det_id)
        
        detections.append(DetectionResult(
            detection_id=det_id,
            box=result.faces[i].box
        ))

    return {
        "event_id": request.event_id,
        "image_url": str(request.image_url),
        "detections": detections
    }


@router.post("/index-event-video", response_model=VideoIndexResponse)
async def index_event_video(
    request: VideoIndexRequest,
    ai_engine = Depends(get_ai_engine),
    store = Depends(get_vector_store)
):
    """
    HEAVY ROUTE: Downloads a video, samples frames, detects faces, and saves them to an event-specific index.
    Does not check for user identity yet.
    """
    optimized_url = get_optimized_url(request.video_url)
    try:
        video_bytes = await download_image(optimized_url)
    except Exception as e:
        logger.error(f"Download failed for {request.video_url}: {e}")
        raise HTTPException(status_code=400, detail="Failed to download video.")

    result = ai_engine.process_video(video_bytes)

    if result.face_count == 0:
        return {
            "event_id": request.event_id,
            "video_url": str(request.video_url),
            "detections": []
        }

    event_idx, event_path = store.get_event_index(request.event_id)

    base_id = int(time.time() * 1000)
    detections = []

    for i in range(result.face_count):
        det_id = base_id + i
        embedding = result.embeddings[i]

        store.add_to_index(event_idx, event_path, embedding, det_id)

        detections.append(DetectionResult(
            detection_id=det_id,
            box=result.faces[i].box
        ))

    return {
        "event_id": request.event_id,
        "video_url": str(request.video_url),
        "detections": detections
    }


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