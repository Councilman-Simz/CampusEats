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


class MenuItemResponse(MenuItemBase):
    id: int

    class Config:
        from_attributes = True