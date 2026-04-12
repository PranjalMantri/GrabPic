from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional

class FaceMetaData(BaseModel):
    # metrics provided by InsightFace
    box: List[float] = Field(..., description="Bouding box of detected face")
    score: float = Field(..., description="Detection confidence score")
    age: Optional[int] = None
    gender: Optional[str] = None

    # metrics that we calculate
    lighting_level: float = Field(..., description="Brightness of the image")
    blur_score: float = Field(..., description="Laplacian variance")

class AIProcessingResult(BaseModel):
    face_count: int
    faces: List[FaceMetaData]
    embeddings: List[List[float]] = Field(..., description="List of 512-D vectors")

class RegistrationResponse(BaseModel):
    face_id: int
    message: str 
    status: str 
    quality_score: float

class DetectedFace(BaseModel):
    face_id: Optional[int] = None
    distance: float
    box: List[float]
    matched: bool

class IndexRequest(BaseModel):
    image_url: HttpUrl
    event_id: str

class VideoIndexRequest(BaseModel):
    video_url: str
    event_id: str

class DetectionResult(BaseModel):
    detection_id: int
    box: List[float]

class IndexResponse(BaseModel):
    event_id: str
    image_url: str
    detections: List[DetectionResult]

class VideoIndexResponse(BaseModel):
    event_id: str
    video_url: str
    detections: List[DetectionResult]

class FindUserRequest(BaseModel):
    face_id: int
    event_id: str
    threshold: float = 0.8

class MatchResult(BaseModel):
    detection_id: int
    distance: float

class FindUserResponse(BaseModel):
    face_id: int
    event_id: str
    matches: List[MatchResult]