from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

# Schema for password creation
class PasswordCreate(BaseModel):
    name: str
    url: Optional[HttpUrl] = None  # Optional URL for the password's related service
    username: Optional[str] = None  # Username associated with this password
    encrypted_password: str  # Encrypted password

# Schema for password response
class PasswordResponse(BaseModel):
    id: str
    name: str
    url: Optional[HttpUrl]
    username: Optional[str]
    encrypted_password: str
    created_at: datetime

    class Config:
        orm_mode = True

# Schema for password update
class PasswordUpdate(BaseModel):
    name: Optional[str]
    url: Optional[HttpUrl]
    username: Optional[str]
    encrypted_password: Optional[str]

