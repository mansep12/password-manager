from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.password import PasswordCreate, PasswordResponse, PasswordUpdate
from crud.password import create_password, get_password_by_id, update_password, delete_password, list_passwords
from crud.user import get_current_user
from models.user import User
from database import get_db
from typing import Annotated, List

router = APIRouter(prefix="/passwords", tags=["Passwords"])


@router.post("/", response_model=PasswordResponse, status_code=201)
def create_password_endpoint(
    password: PasswordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_password(db, password, current_user.id)


@router.patch("/{password_id}", response_model=PasswordResponse)
def update_password_endpoint(password_id: str, password_data: PasswordUpdate, db: Session = Depends(get_db)):
    password = update_password(db, password_id, password_data)
    if not password:
        raise HTTPException(status_code=404, detail="Password not found")
    return password


@router.delete("/{password_id}", status_code=204)
def delete_password_endpoint(password_id: str, db: Session = Depends(get_db)):
    if not delete_password(db, password_id):
        raise HTTPException(status_code=404, detail="Password not found")
    return


@router.get("/list")
def list_passwords_endpoint(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    passwords = list_passwords(db, current_user.id)
    return passwords


@router.get("/{password_id}", response_model=PasswordResponse)
def get_password_endpoint(password_id: str, db: Session = Depends(get_db)):
    password = get_password_by_id(db, password_id)
    if not password:
        raise HTTPException(status_code=404, detail="Password not found")
    return password
