from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Schema for sharing a password
class SharedCreate(BaseModel):
    password_id: str
    shared_with_user_id: Optional[str] = None  # Share with a specific user
    shared_with_group_id: Optional[str] = None  # Share with a group

# Schema for shared response
class SharedResponse(BaseModel):
    id: str
    password_id: str
    shared_with_user_id: Optional[str]
    shared_with_group_id: Optional[str]
    shared_at: datetime

    class Config:
        orm_mode = True
