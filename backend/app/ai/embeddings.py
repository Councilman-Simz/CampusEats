from functools import lru_cache

from sentence_transformers import SentenceTransformer


@lru_cache(maxsize=1)
def get_model():
    return SentenceTransformer("all-MiniLM-L6-v2")


def create_embedding(text: str):
    model = get_model()
    return model.encode(text).tolist()
