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
        self.index_path = os.path.join(index_dir, "grabpic_faces.index")
        self.index = None

        if not os.path.exists(self.index_dir):
            os.makedirs(self.index_dir)

        self._load_or_create_index()

    def _load_or_create_index(self):
        if os.path.exists(self.index_path):
            try:
                self.index = faiss.read_index(self.index_path)
                logger.info(f"Successfully read existing Index")
            except Exception as e:
                logger.error("Something went wrong while reading the index. Creating a new one")
                self._create_new_index()
        else:
            self._create_new_index()

    def _create_new_index(self):
        sub_index = faiss.IndexFlatL2(self.dimension)
        self.index = faiss.IndexIDMap(sub_index)
        logger.info("Created a new FAISS Index")

    def add_vector(self, embedding: list, face_id: int):
        try:
            vector = np.array([embedding]).astype("float32")
            ids = np.array([face_id]).astype("int64")

            self.index.add_with_ids(vector, ids)
            self.save_index()
            logger.info(f"Added vector with ID {face_id}. Total: {self.index.ntotal}")
        except Exception as e:
            logger.error("Something went wrong wile adding vector to index: ", e)
            raise e
        
    def delete_vector(self, face_id: int):
        ids_to_remove = np.array([face_id]).astype("int64")
        self.index.remove_ids(ids_to_remove)
        self.save_index()
        logger.info(f"Deleted vector ID {face_id}.")

    def search(self, query_embedding: list, top_k: int = 5):
        """Finds the closest match to a given face"""
        if self.index.ntotal == 0:
            return [], []
        
        vector = np.array([query_embedding]).astype("float32")
        distances, indices = self.index.search(vector, top_k)

        return distances[0].tolist(), indices[0].tolist()
    
    def get_vector_by_id(self, face_id: int):
        """Retreives the embedding vector by taking in the unique face id"""
        try:
            return self.index.reconstruct(face_id)
        except Exception as e:
            logger.error(f"ID {face_id} not found in FAISS index: {e}")
            return None

    def save_index(self):
        try:
            faiss.write_index(self.index, self.index_path)
        except Exception as e:
            logger.error("Could not save index")

vector_store = VectorStore()