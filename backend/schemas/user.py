from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    password: str
    name: str
    salt: str


class UserResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    salt: str

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str]
    password: Optional[str]
    salt: Optional[str]


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: int | None = None
