from sqlmodel import Session, select
from models.user import User
from schemas.user import UserCreate, UserUpdate
from typing import Optional

def create_user(db: Session, user: UserCreate) -> User:
    new_user = User(email=user.email, password=user.password, name=user.name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    statement = select(User).where(User.email == email)
    return db.exec(statement).first()

def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    statement = select(User).where(User.id == user_id)
    return db.exec(statement).first()

def update_user(db: Session, user_id: str, user_data: UserUpdate) -> Optional[User]:
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    for key, value in user_data.dict(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: str) -> bool:
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True
