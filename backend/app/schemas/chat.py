from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=500,
    )
    user_id: int = Field(default=1, ge=1)
    limit: int = Field(default=5, ge=1, le=10)
