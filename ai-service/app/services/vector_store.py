import faiss
import numpy as np
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self, dimension: int = 512, index_dir: str = "models"):
        self.dimension = dimension
        self.index_dir = index_dir

        if not os.path.exists(self.index_dir):
            os.makedirs(self.index_dir)

        self.user_index_path = os.path.join(index_dir, "users_master.index")
        self.user_index = self._load_or_create(self.user_index_path)
    
    def _load_or_create(self, path):
        if os.path.exists(path):
            try:
                index = faiss.read_index(path)
                logger.info(f"Loaded existing index: {path}")
                return index
            except Exception as e:
                logger.error(f"Failed to read index {path}: {e}")
        
        # Create new IDMap index
        sub_index = faiss.IndexFlatL2(self.dimension)
        logger.info(f"Created new FAISS index for: {path}")
        return faiss.IndexIDMap(sub_index)
    
    def get_event_index(self, event_id: str):
        event_path = os.path.join(self.index_dir, f"event_{event_id}.index")
        return self._load_or_create(event_path), event_path

    def add_to_index(self, index, path, embedding: list, internal_id: int):
        """Generic add function for any index"""
        try:
            vector = np.array([embedding]).astype("float32")
            ids = np.array([internal_id]).astype("int64")
            index.add_with_ids(vector, ids)
            faiss.write_index(index, path)
            logger.info(f"Added ID {internal_id} to {path}. Total: {index.ntotal}")
        except Exception as e:
            logger.error(f"Error adding to index {path}: {e}")
            raise e
    
    def search_index(self, index, query_embedding: list, top_k: int = 10):
        """Generic search function for any index"""
        if index.ntotal == 0:
            return [], []
        vector = np.array([query_embedding]).astype("float32")
        distances, indices = index.search(vector, top_k)
        return distances[0].tolist(), indices[0].tolist()
    
    def get_user_embedding(self, face_id: int):
        """Get the master embedding for a registered user"""
        try:
            # Fast path for index types that support reconstruct by external ID.
            try:
                return self.user_index.reconstruct(face_id)
            except Exception:
                pass

            # Fallback for IndexIDMap: resolve external ID -> internal position.
            if not hasattr(self.user_index, "id_map"):
                return None

            id_map = faiss.vector_to_array(self.user_index.id_map)
            positions = np.where(id_map == int(face_id))[0]
            if positions.size == 0:
                return None

            # If duplicate face_id entries exist, use the most recently added one.
            pos = int(positions[-1])
            return self.user_index.index.reconstruct(pos)
        except Exception as e:
            logger.error(f"User ID {face_id} not found: {e}")
            return None