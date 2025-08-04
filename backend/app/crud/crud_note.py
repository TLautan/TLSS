# backend/app/crud/crud_note.py

from sqlalchemy.orm import Session, joinedload
from typing import List
from app import models, schemas

def create_note(db: Session, note: schemas.note.NoteCreate, user_id: int) -> models.note.Note:
    db_note = models.note.Note(
        **note.model_dump(),
        user_id=user_id
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

def get_notes_for_item(db: Session, related_to: str, related_id: int) -> List[models.note.Note]:
    return (
        db.query(models.note.Note)
        .options(joinedload(models.note.Note.owner))
        .filter_by(related_to=related_to, related_id=related_id)
        .order_by(models.note.Note.created_at.desc())
        .all()
    )