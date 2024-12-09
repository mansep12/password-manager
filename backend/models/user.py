from sqlmodel import SQLModel, Field, Relationship
from typing import List
from datetime import datetime

class User(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True) #indez=True is used to speed up queries
    password: str  # Hashed password (bcrypt)
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    passwords: List["Password"] = Relationship(back_populates="user")
    groups: List["GroupUser"] = Relationship(back_populates="user")
    shared_with: List["Shared"] = Relationship(back_populates="user")

