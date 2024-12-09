from pydantic import BaseModel

# Schema for adding a user to a group
class GroupUserCreate(BaseModel):
    user_id: int
    group_id: int
