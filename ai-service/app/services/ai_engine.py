import cv2
import numpy as np
import os
import logging
import tempfile
from insightface.app import FaceAnalysis
from app.schema.schemas import AIProcessingResult, FaceMetaData

logger = logging.getLogger(__name__)

class AIEngine:
    def __init__(self):
        model_name = os.getenv("MODEL_NAME", "buffalo_l")
        
        # Try GPU first, fall back to CPU
        providers = ["CUDAExecutionProvider", "CPUExecutionProvider"]
        
        self.app = FaceAnalysis(name=model_name, providers=providers)
        self.app.prepare(ctx_id=0, det_size=(640, 640))
        
        logger.info("AIEngine initialized: model=%s", model_name)

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

    def process_video(
        self,
        video_bytes: bytes,
        max_frames: int = 30,
    ) -> AIProcessingResult:
        temp_path = None
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
                tmp.write(video_bytes)
                temp_path = tmp.name

            cap = cv2.VideoCapture(temp_path)
            if not cap.isOpened():
                return AIProcessingResult(face_count=0, faces=[], embeddings=[])

            # Sample one frame per second based on the source video's FPS.
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_interval = max(1, int(round(fps))) if fps and fps > 0 else 1

            frame_count = 0
            sampled_count = 0
            all_faces = []
            all_embeddings = []

            while sampled_count < max_frames:
                ok, frame = cap.read()
                if not ok:
                    break

                if frame_count % frame_interval != 0:
                    frame_count += 1
                    continue

                img_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                lighting = self._get_lighting_level(img_gray)
                blur = self._get_blur_score(img_gray)

                faces = self.app.get(frame)
                for face in faces:
                    all_faces.append(
                        FaceMetaData(
                            box=face.bbox.tolist(),
                            score=float(face.det_score),
                            age=int(face.age) if hasattr(face, "age") else None,
                            gender="M" if face.gender == 1 else "F",
                            lighting_level=float(lighting),
                            blur_score=float(blur),
                        )
                    )
                    all_embeddings.append(face.normed_embedding.tolist())

                sampled_count += 1
                frame_count += 1

            cap.release()

            return AIProcessingResult(
                face_count=len(all_faces),
                faces=all_faces,
                embeddings=all_embeddings,
            )
        finally:
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)
