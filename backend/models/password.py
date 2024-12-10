from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import List

class Password(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str  # Descriptive name
    url: str = None  # Associated URL (optional, e.g., "https://gmail.com")
    username: str = None  # Username associated with this password
    encrypted_password: str  # Reversibly encrypted password
    salt: str
    iv: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: int = Field(default=None, foreign_key="user.id")

    user: "User" = Relationship(back_populates="passwords")
