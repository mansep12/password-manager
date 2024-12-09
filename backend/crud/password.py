from sqlmodel import Session, select
from models.password import Password
from schemas.password import PasswordCreate, PasswordUpdate
from typing import Optional, List


def create_password(db: Session, password: PasswordCreate, user_id: int) -> Password:
    new_password = Password(
        name=password.name,
        url=str(password.url) if password.url else None,  # Convertir HttpUrl a str
        username=password.username,
        encrypted_password=password.encrypted_password,
        user_id=user_id,
        salt=password.salt,
        iv=password.iv,
    )
    db.add(new_password)
    db.commit()
    db.refresh(new_password)
    return new_password


def get_password_by_id(db: Session, password_id: int) -> Optional[Password]:
    statement = select(Password).where(Password.id == password_id)
    result = db.execute(statement)  # Cambiar exec por execute
    return result.scalars().first()  # Obtener el primer resultado de manera segura


def update_password(db: Session, password_id: int, password_data: PasswordUpdate) -> Optional[Password]:
    password = get_password_by_id(db, password_id)
    if not password:
        return None
    for key, value in password_data.dict(exclude_unset=True).items():
        setattr(password, key, value)
    db.commit()
    db.refresh(password)
    return password


def delete_password(db: Session, password_id: int) -> bool:
    password = get_password_by_id(db, password_id)
    if not password:
        return False
    db.delete(password)
    db.commit()
    return True


def list_passwords(db: Session, user_id: int) -> List[Password]:
    statement = select(Password).where(Password.user_id == user_id)
    result = db.execute(statement)
    return result.scalars().all()
