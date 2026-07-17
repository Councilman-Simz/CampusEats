from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.chat import ChatRequest
from app.services.chat_service import chat_with_menu

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
)


@router.post("/")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
):
    result = chat_with_menu(
        db=db,
        message=request.message,
        limit=request.limit,
    )

    return {
        "reply": result["reply"],
        "items": [
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
            for item in result["items"]
        ],
    }
