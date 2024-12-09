from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Schema for group creation
class GroupCreate(BaseModel):
    name: str

# Schema for group response
class GroupResponse(BaseModel):
    id: int
    name: str
    created_at: datetime

    class Config:
        from_attributes = True

# Schema for group update
class GroupUpdate(BaseModel):
    name: Optional[str]
