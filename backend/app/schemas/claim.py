from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ClaimCreate(BaseModel):
    user_id: int
    item_id: int


class ClaimResponse(BaseModel):
    id: int
    user_id: int
    item_id: int
    claimed_at: datetime

    model_config = ConfigDict(from_attributes=True)