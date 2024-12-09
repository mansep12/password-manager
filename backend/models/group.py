from sqlmodel import SQLModel, Field, Relationship
from typing import List
from datetime import datetime


class Group(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str  # Group name
    created_at: datetime = Field(default_factory=datetime.utcnow)

    members: List["GroupUser"] = Relationship(back_populates="group")
    shared_with: List["Shared"] = Relationship(back_populates="group")
