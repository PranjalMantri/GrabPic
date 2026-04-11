from app.services.ai_engine import AIEngine
from app.services.vector_store import VectorStore


ai_engine = AIEngine()
vector_store = VectorStore()

def get_ai_engine():
    return ai_engine

def vector_store():
    return vector_store