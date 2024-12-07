from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Schema for user creation
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

# Schema for user response
class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    created_at: datetime

    class Config:
        from_attributes = True

# Schema for user update
class UserUpdate(BaseModel):
    email: Optional[EmailStr]
    name: Optional[str]
    password: Optional[str]
