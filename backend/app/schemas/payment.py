from pydantic import BaseModel


class CheckoutSessionCreate(BaseModel):
    order_id: int


class CheckoutSessionResponse(BaseModel):
    checkout_url: str
    session_id: str
