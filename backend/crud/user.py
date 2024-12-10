from typing import Annotated
from datetime import datetime, timedelta, timezone
from sqlmodel import Session, select
from models.user import User
from schemas.user import UserCreate, UserUpdate, Token, TokenData
from typing import Optional
from database import get_db

from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
import jwt

SECRET_KEY = "d19033e439ca02d1c5f2df831414e887ef2c04aa9c918c1f6c8e264635bbc3f8"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/token")


def create_user(db: Session, user: UserCreate) -> User:
    hashed_password = pwd_context.hash(user.password)

    new_user = User(
        password=hashed_password,
        name=user.name,
        salt=user.salt,
        pub_key=user.pub_key,
        enctypted_priv_key=user.encrypted_priv_key
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    statement = select(User).where(User.id == user_id)
    result = db.execute(statement)
    return result.scalars().first()


def get_user_by_name(db: Session, user_name: int) -> Optional[User]:
    statement = select(User).where(User.name == user_name)
    result = db.execute(statement)
    return result.scalars().first()


def update_user(db: Session, user_id: int, user_data: UserUpdate) -> Optional[User]:
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    for key, value in user_data.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> bool:
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    user = get_user_by_name(db, username)
    if not user:
        return None
    if not pwd_context.verify(password, user.password):
        return None
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Decoded payload: {payload}")
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        user_id = int(user_id)
        token_data = TokenData(user_id=user_id)
    except InvalidTokenError:
        raise credentials_exception
    user = get_user_by_id(db, token_data.user_id)
    if user is None:
        raise credentials_exception
    return user
