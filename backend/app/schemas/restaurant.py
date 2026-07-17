from pydantic import BaseModel, ConfigDict


class RestaurantBase(BaseModel):
    name: str
    location: str | None = None
    hours: str | None = None
    description: str | None = None
    cuisine: str | None = None
    phone: str | None = None
    logo_url: str | None = None
    banner_url: str | None = None


class RestaurantCreate(RestaurantBase):
    owner_id: int | None = None


class RestaurantUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    hours: str | None = None
    description: str | None = None
    cuisine: str | None = None
    phone: str | None = None
    logo_url: str | None = None
    banner_url: str | None = None


class RestaurantResponse(RestaurantBase):
    id: int
    owner_id: int | None = None
    status: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
