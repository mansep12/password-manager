from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.shared import SharedCreate, SharedResponse
from crud.shared import create_shared, get_shared_by_id, delete_shared, list_shared
from database import get_db
from models.user import User
from crud.user import get_user_by_id, get_current_user
from typing import List

router = APIRouter(prefix="/shared", tags=["Shared"])


@router.post("/", response_model=SharedResponse, status_code=201)
def create_shared_endpoint(
        shared: SharedCreate,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    shared.owner_username = current_user.name
    print(current_user.name)
    return create_shared(db, shared)

@router.get("/list", response_model=List[SharedResponse])
def get_shared_endpoint(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    return list_shared(db, current_user.id)

@router.get("/{shared_id}", response_model=SharedResponse)
def get_shared_endpoint(shared_id: str, db: Session = Depends(get_db)):
    shared = get_shared_by_id(db, shared_id)
    if not shared:
        raise HTTPException(status_code=404, detail="Shared record not found")
    return shared


@router.delete("/{shared_id}", status_code=204)
def delete_shared_endpoint(shared_id: str, db: Session = Depends(get_db)):
    if not delete_shared(db, shared_id):
        raise HTTPException(status_code=404, detail="Shared record not found")
    return
