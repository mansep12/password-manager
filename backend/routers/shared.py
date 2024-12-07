from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.shared import SharedCreate, SharedResponse
from crud.shared import create_shared, get_shared_by_id, delete_shared
from dependencies import get_db

router = APIRouter(prefix="/shared", tags=["Shared"])

@router.post("/", response_model=SharedResponse, status_code=201)
def create_shared_endpoint(shared: SharedCreate, db: Session = Depends(get_db)):
    if not (shared.shared_with_user_id or shared.shared_with_group_id):
        raise HTTPException(status_code=400, detail="Must share with either a user or a group")
    if shared.shared_with_user_id and shared.shared_with_group_id:
        raise HTTPException(status_code=400, detail="Cannot share with both a user and a group")
    return create_shared(db, shared)

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
