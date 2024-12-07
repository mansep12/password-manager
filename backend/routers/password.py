from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.password import PasswordCreate, PasswordResponse, PasswordUpdate
from crud.password import create_password, get_password_by_id, update_password, delete_password
from database import get_db

router = APIRouter(prefix="/passwords", tags=["Passwords"])

@router.post("/", response_model=PasswordResponse, status_code=201)
def create_password_endpoint(password: PasswordCreate, db: Session = Depends(get_db)):
    return create_password(db, password)

@router.get("/{password_id}", response_model=PasswordResponse)
def get_password_endpoint(password_id: str, db: Session = Depends(get_db)):
    password = get_password_by_id(db, password_id)
    if not password:
        raise HTTPException(status_code=404, detail="Password not found")
    return password

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
