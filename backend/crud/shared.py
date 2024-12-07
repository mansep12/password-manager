from sqlmodel import Session, select
from models.shared import Shared
from schemas.shared import SharedCreate
from typing import Optional

def create_shared(db: Session, shared: SharedCreate) -> Shared:
    new_shared = Shared(
        password_id=shared.password_id,
        shared_with_user_id=shared.shared_with_user_id,
        shared_with_group_id=shared.shared_with_group_id,
    )
    db.add(new_shared)
    db.commit()
    db.refresh(new_shared)
    return new_shared

def get_shared_by_id(db: Session, shared_id: str) -> Optional[Shared]:
    statement = select(Shared).where(Shared.id == shared_id)
    return db.exec(statement).first()

def delete_shared(db: Session, shared_id: str) -> bool:
    shared = get_shared_by_id(db, shared_id)
    if not shared:
        return False
    db.delete(shared)
    db.commit()
    return True
