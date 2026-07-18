from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    dietary_preferences: str | None = None
    campus: str | None = None
    role: str = "student"


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    dietary_preferences: str | None = None
    campus: str | None = None
    role: str

    class Config:
        from_attributes = True
