from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Schema for sharing a password
class SharedCreate(BaseModel):
    password_id: int
    shared_with_user_id: Optional[int] = None  # Share with a specific user
    shared_with_group_id: Optional[int] = None  # Share with a group

# Schema for shared response
class SharedResponse(BaseModel):
    id: int
    password_id: int
    shared_with_user_id: Optional[int]
    shared_with_group_id: Optional[int]
    shared_at: datetime

    class Config:
        from_attributes = True
