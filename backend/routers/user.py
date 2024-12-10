from datetime import timedelta
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.orm import Session
from schemas.user import UserCreate, UserResponse, UserUpdate, Token
from crud.user import create_user, get_user_by_id, get_user_by_name, update_user, delete_user, authenticate_user, create_access_token, list_users, get_current_user
from models.user import User
from database import get_db
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/token")

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserResponse, status_code=201)
def create_user_endpoint(user: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_name(db, user.name):
        raise HTTPException(status_code=400, detail="Username already in use")
    return create_user(db, user)

@router.get("/list", response_model=List[UserResponse])
def list_users_endpoint(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    users = list_users(db, current_user.id)
    return users

@router.get("/salt")
def get_salt_endpoint(current_user: User = Depends(get_current_user)):
    return current_user.salt

@router.get("/priv_key")
def get_salt_endpoint(current_user: User = Depends(get_current_user)):
    return [current_user.encrypted_priv_key, current_user.priv_key_iv]

@router.get("/pubkey/{user_id}", response_model=str)
def get_user_endpoint(user_id: str, db: Session = Depends(get_db)):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.pub_key

@router.get("/{user_id}", response_model=UserResponse)
def get_user_endpoint(user_id: str, db: Session = Depends(get_db)):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserResponse)
def update_user_endpoint(user_id: str, user_data: UserUpdate, db: Session = Depends(get_db)):
    user = update_user(db, user_id, user_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user_endpoint(user_id: str, db: Session = Depends(get_db)):
    if not delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return




ACCESS_TOKEN_EXPIRE_MINUTES = 30


@router.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)
) -> Token:
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


# @router.get("/passwords/", response_model=UserResponse)
# async def read_users_me(
#     current_user: Annotated[UserResponse, Depends(get_current_user)],
# ):
#     return current_user
