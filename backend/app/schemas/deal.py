from datetime import datetime

from pydantic import BaseModel


class OwnerDealCreate(BaseModel):
    price: float | None = None
    expires_at: datetime


class OwnerDealUpdate(BaseModel):
    price: float | None = None
    expires_at: datetime | None = None
