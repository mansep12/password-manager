from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class Shared(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    password_id: int = Field(default=None, foreign_key="password.id")
    shared_with_user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    shared_with_group_id: Optional[int] = Field(default=None, foreign_key="group.id")
    shared_at: datetime = Field(default_factory=datetime.utcnow)

    password: "Password" = Relationship(back_populates="shared_with")
    user: Optional["User"] = Relationship(back_populates="shared_with")
    group: Optional["Group"] = Relationship(back_populates="shared_with")
