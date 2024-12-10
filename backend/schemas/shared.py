from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Schema for sharing a password
class SharedCreate(BaseModel):
    owner_username: Optional[str] = None
    name: str
    url: str
    username: str
    encrypted_password: str
    shared_with_user_id: Optional[int]
    shared_with_group_id: Optional[int] = None  # Share with a group

# Schema for shared response
class SharedResponse(BaseModel):
    id: int
    name: str
    url: str
    username: str
    owner_username: str
    encrypted_password: str
    shared_with_user_id: Optional[int]
    shared_with_group_id: Optional[int]
    shared_at: datetime

    class Config:
        from_attributes = True
