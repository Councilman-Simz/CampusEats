from functools import lru_cache
from io import BytesIO

import torch
from PIL import Image
from sqlalchemy.orm import Session
from transformers import CLIPModel, CLIPProcessor

from app.models.menu_item import MenuItem

MODEL_NAME = "openai/clip-vit-base-patch32"


@lru_cache(maxsize=1)
def get_clip_model():
    model = CLIPModel.from_pretrained(MODEL_NAME)
    model.eval()
    return model


@lru_cache(maxsize=1)
def get_clip_processor():
    return CLIPProcessor.from_pretrained(MODEL_NAME)


def normalize_vector(vector: torch.Tensor) -> list[float]:
    vector = vector / vector.norm(
        p=2,
        dim=-1,
        keepdim=True,
    )

    return vector[0].detach().cpu().tolist()


def create_clip_text_embedding(text: str) -> list[float]:
    clean_text = text.strip()

    if not clean_text:
        raise ValueError("Text cannot be empty.")

    processor = get_clip_processor()
    model = get_clip_model()

    inputs = processor(
        text=[clean_text],
        return_tensors="pt",
        padding=True,
        truncation=True,
    )

    with torch.no_grad():
        features = model.get_text_features(**inputs)

    return normalize_vector(features)


def create_clip_image_embedding(
    image_bytes: bytes,
) -> list[float]:
    image = Image.open(BytesIO(image_bytes)).convert("RGB")

    processor = get_clip_processor()
    model = get_clip_model()

    inputs = processor(
        images=image,
        return_tensors="pt",
    )

    with torch.no_grad():
        features = model.get_image_features(**inputs)

    return normalize_vector(features)


def search_menu_by_image(
    db: Session,
    image_bytes: bytes,
    limit: int = 5,
) -> list[MenuItem]:
    image_embedding = create_clip_image_embedding(
        image_bytes
    )

    return (
        db.query(MenuItem)
        .filter(MenuItem.clip_embedding.is_not(None))
        .order_by(
            MenuItem.clip_embedding.cosine_distance(
                image_embedding
            )
        )
        .limit(limit)
        .all()
    )