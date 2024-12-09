from sqlmodel import SQLModel, Field, Relationship


class GroupUser(SQLModel, table=True):
    user_id: int = Field(default=None, foreign_key="user.id", primary_key=True)
    group_id: int = Field(default=None, foreign_key="group.id", primary_key=True)

    user: "User" = Relationship(back_populates="groups")
    group: "Group" = Relationship(back_populates="members")

