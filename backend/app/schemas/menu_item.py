from datetime import datetime

from pydantic import BaseModel


class MenuItemBase(BaseModel):
    restaurant_id: int
    name: str
    description: str | None = None
    price: float
    tags: str | None = None
    ingredients: str | None = None
    expires_at: datetime | None = None
    stock_quantity: int = 0
    low_stock_threshold: int = 5
    is_available: bool = True


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemUpdate(BaseModel):
    restaurant_id: int | None = None
    name: str | None = None
    description: str | None = None
    price: float | None = None
    tags: str | None = None
    ingredients: str | None = None
    expires_at: datetime | None = None
    stock_quantity: int | None = None
    low_stock_threshold: int | None = None
    is_available: bool | None = None


class MenuItemResponse(MenuItemBase):
    id: int

    class Config:
        from_attributes = True
