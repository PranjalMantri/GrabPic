from pydantic import BaseModel, Field
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
