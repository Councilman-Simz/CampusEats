from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int = Field(default=1, ge=1, le=20)


class OrderCreate(BaseModel):
    restaurant_id: int
    items: list[OrderItemCreate]


class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    price: float

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: int
    user_id: int
    restaurant_id: int
    total: float
    status: str
    payment_status: str = "unpaid"
    payment_method: str | None = None
    stripe_session_id: str | None = None
    stripe_payment_intent_id: str | None = None
    created_at: datetime | None = None
    items: list[OrderItemResponse] = []

    model_config = ConfigDict(from_attributes=True)


class OrderStatusUpdate(BaseModel):
    status: str
