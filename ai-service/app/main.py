from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from app.routes.registration import router as registration_router
from app.routes.processing import (
    router as processing_router,
    start_processing_worker,
    stop_processing_worker,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    await start_processing_worker()
    try:
        yield
    finally:
        await stop_processing_worker()


app = FastAPI(title="GrabPic AI Service", lifespan=lifespan)

app.add_middleware(CORSMiddleware, 
                    allow_origins=["http://localhost:3000"], 
                    allow_headers=["*"], 
                    allow_credentials=True, 
                    allow_methods=["*"]
                )

@app.get("/health")
async def health() -> dict:
    return {"ok": True, "status": 200}

app.include_router(registration_router)
app.include_router(processing_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)