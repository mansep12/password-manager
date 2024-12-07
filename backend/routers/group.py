from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.group import GroupCreate, GroupResponse, GroupUpdate
from crud.group import create_group, get_group_by_id, update_group, delete_group
from database import get_db

router = APIRouter(prefix="/groups", tags=["Groups"])

@router.post("/", response_model=GroupResponse, status_code=201)
def create_group_endpoint(group: GroupCreate, db: Session = Depends(get_db)):
    return create_group(db, group)

@router.get("/{group_id}", response_model=GroupResponse)
def get_group_endpoint(group_id: str, db: Session = Depends(get_db)):
    group = get_group_by_id(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

@router.patch("/{group_id}", response_model=GroupResponse)
def update_group_endpoint(group_id: str, group_data: GroupUpdate, db: Session = Depends(get_db)):
    group = update_group(db, group_id, group_data)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

@router.delete("/{group_id}", status_code=204)
def delete_group_endpoint(group_id: str, db: Session = Depends(get_db)):
    if not delete_group(db, group_id):
        raise HTTPException(status_code=404, detail="Group not found")
    return
