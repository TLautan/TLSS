# backend/app/crud/crud_note.py

from sqlalchemy.orm import Session, joinedload
from typing import List
from app.models import note as note_model
from app.schemas import note as note_schema

def create_note(db: Session, note: note_schema.NoteCreate, user_id: int) -> note_model.Note:
    db_note = note_model.Note(
        **note.model_dump(),
        user_id=user_id
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

def get_notes_for_item(db: Session, related_to: str, related_id: int) -> List[note_model.Note]:
    return (
        db.query(note_model.Note)
        .options(joinedload(note_model.Note.owner))
        .filter_by(related_to=related_to, related_id=related_id)
        .order_by(note_model.Note.created_at.desc())
        .all()
    )