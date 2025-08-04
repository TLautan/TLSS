# backend/app/routers/notes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.schemas import note as note_schema
from app.crud import crud_note
from app import models, security
from app.database import get_db

router = APIRouter(
    prefix="/notes",
    tags=["Notes"]
)

@router.post("/", response_model=note_schema.Note, status_code=status.HTTP_201_CREATED)
def create_new_note(
    note: note_schema.NoteCreate,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user)
):
    """
    Create a new note for a related item (deal or company).
    """
    return crud_note.create_note(db=db, note=note, user_id=current_user.id)


@router.get("/{related_to}/{related_id}", response_model=List[note_schema.Note])
def read_notes_for_item(
    related_to: str,
    related_id: int,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user)
):
    """
    Get all notes for a specific item (e.g., /notes/deal/123).
    """
    if related_to not in ["deal", "company"]:
        raise HTTPException(status_code=400, detail="Invalid 'related_to' type. Must be 'deal' or 'company'.")
    
    return crud_note.get_notes_for_item(db=db, related_to=related_to, related_id=related_id)