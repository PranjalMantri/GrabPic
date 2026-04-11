from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from app.dependencies import get_ai_engine, get_vector_store
from app.schema.schemas import RegistrationResponse

router = APIRouter()

@router.post("/register", response_model=RegistrationResponse)
async def register_face(
    face_id: int = Form(...),
    file: UploadFile = File(...),
    ai_engine = Depends(get_ai_engine),
    vector_store = Depends(get_vector_store)
):
    # read the file
    contents = await file.read()

    # process the file
    results = ai_engine.process_media(contents)

    if results.face_count == 0:
        raise HTTPException(status_code=400, detail="No face detected. Please try again")
    
    if results.face_count > 1:
        raise HTTPException(status_code=400, detail="Multiple faces detected. Registration requires a solo image")
    
    # now we only have 1 face detected

    face_meta = results.faces[0]

    if face_meta.lighting_level < 50.0:
        raise HTTPException(status_code=400, detail="Image is too dark. Please move to brighter area")

    if face_meta.blur_score < 40.0:
        raise HTTPException(status_code=400, detail="Image is blurry. Please use a steady camera")
    
    target_embedding = results.embeddings[0]

    try:
        vector_store.add_to_index(
            vector_store.user_index,
            vector_store.user_index_path,
            target_embedding,
            face_id,
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to store face embedding")

    return {
        "face_id": face_id,
        "status": "success",
        "quality_score": face_meta.score,
        "message": "Face Registration successful"
    }


