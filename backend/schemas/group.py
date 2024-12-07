from pydantic import BaseModel
from typing import List
from datetime import datetime

# Schema for group creation
class GroupCreate(BaseModel):
    name: str

# Schema for group response
class GroupResponse(BaseModel):
    id: str
    name: str
    created_at: datetime

    class Config:
        orm_mode = True

# Schema for group update
class GroupUpdate(BaseModel):
    name: Optional[str]
