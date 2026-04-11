from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="GrabPic AI Service")

app.add_middleware(CORSMiddleware, 
                    allow_origins=["http://localhost:3000"], 
                    allow_headers=["*"], 
                    allow_credentials=True, 
                    allow_methods=["*"]
                )

@app.get("/health")
async def health() -> dict:
    return {"ok": True, "status": 200}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)