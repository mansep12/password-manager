from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime


class PasswordCreate(BaseModel):
    name: str
    url: Optional[HttpUrl] = None
    username: Optional[str] = None
    encrypted_password: str
    salt: str
    iv: str


class PasswordResponse(BaseModel):
    id: int
    name: str
    url: Optional[HttpUrl]
    username: Optional[str]
    encrypted_password: str
    created_at: datetime
    salt: str
    iv: str

    class Config:
        from_attributes = True


class PasswordUpdate(BaseModel):
    name: Optional[str]
    url: Optional[HttpUrl]
    username: Optional[str]
    encrypted_password: Optional[str]
    salt: Optional[str]
    iv: Optional[str]
