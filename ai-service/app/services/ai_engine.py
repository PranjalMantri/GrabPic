import cv2
import numpy as np
from insightface.app import FaceAnalysis
from app.schema.schemas import AIProcessingResult, FaceMetaData

class AIEngine:
    def __init__(self):
        self.app = FaceAnalysis("buffalo_l", providers=["CPUExecutionProvider"])
        self.app.prepare(ctx_id=0, det_size=(640, 640))

    def _get_lighting_level(self, img_gray):
        return np.mean(img_gray)
    
    def _get_blur_score(self, img_gray):
        return cv2.Laplacian(img_gray, cv2.CV_64F).var()
    

    
    def process_media(self, image_bytes: bytes) -> AIProcessingResult:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return AIProcessingResult(face_count=0, faces=[], embeddings=[])
        
        img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        lighting = self._get_lighting_level(img_gray)
        blur = self._get_blur_score(img_gray)

        faces = self.app.get(img)

        results = []
        embeddings = []

        for face in faces:
            # create meta data for each face found in the image
            meta = FaceMetaData(
                box=face.bbox.tolist(),
                score=float(face.det_score),
                age=int(face.age) if hasattr(face, "age") else None,
                gender="M" if face.gender == 1 else "F",
                lighting_level=float(lighting),
                blur_score=float(blur)
            )

            results.append(meta)
            embeddings.append(face.normed_embedding.tolist())

        return AIProcessingResult(
            face_count=len(faces), 
            faces=results, 
            embeddings=embeddings
        )
