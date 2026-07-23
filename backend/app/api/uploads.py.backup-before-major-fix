from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    UploadFile,
)
from sqlalchemy.orm import Session

from app.ai.clip_search import search_menu_by_image
from app.core.database import get_db

router = APIRouter(
    prefix="/image-search",
    tags=["image search"],
)

ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

MAX_FILE_SIZE = 5 * 1024 * 1024


@router.post("/")
async def image_search(
    file: UploadFile = File(...),
    limit: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Upload a JPEG, PNG, or WebP image."
            ),
        )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Image must be smaller than 5 MB.",
        )

    try:
        results = search_menu_by_image(
            db=db,
            image_bytes=image_bytes,
            limit=limit,
        )
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to process image: {error}",
        ) from error

    return [
        {
            "id": item.id,
            "restaurant_id": item.restaurant_id,
            "name": item.name,
            "description": item.description,
            "price": (
                float(item.price)
                if item.price is not None
                else None
            ),
            "tags": item.tags,
            "ingredients": item.ingredients,
        }
        for item in results
    ]