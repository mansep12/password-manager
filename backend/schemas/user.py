from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    password: str
    name: str
    salt: str
    pub_key: str
    encrypted_priv_key: str
    priv_key_iv: str


class UserResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    salt: str
    pub_key: str
    encrypted_priv_key: str
    priv_key_iv: str

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str]
    password: Optional[str]
    salt: Optional[str]
    pub_key: Optional[str]
    encrypted_priv_key: Optional[str]
    priv_key_iv: Optional[str]


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: int | None = None
