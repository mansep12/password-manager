from sqlmodel import Session, select
from models.group import Group
from schemas.group import GroupCreate, GroupUpdate
from typing import Optional

def create_group(db: Session, group: GroupCreate) -> Group:
    new_group = Group(name=group.name)
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    return new_group

def get_group_by_id(db: Session, group_id: str) -> Optional[Group]:
    statement = select(Group).where(Group.id == group_id)
    return db.exec(statement).first()

def update_group(db: Session, group_id: str, group_data: GroupUpdate) -> Optional[Group]:
    group = get_group_by_id(db, group_id)
    if not group:
        return None
    for key, value in group_data.dict(exclude_unset=True).items():
        setattr(group, key, value)
    db.commit()
    db.refresh(group)
    return group

def delete_group(db: Session, group_id: str) -> bool:
    group = get_group_by_id(db, group_id)
    if not group:
        return False
    db.delete(group)
    db.commit()
    return True
