# backend/app/crud/crud_attachment.py

from sqlalchemy.orm import Session, joinedload
from typing import List
from app.models import attachment as attachment_model
import os
import shutil
from fastapi import UploadFile

# Define the base directory for uploads inside the container
UPLOAD_DIRECTORY = "/code/uploads"

def save_attachment(
    db: Session, 
    file: UploadFile, 
    related_to: str, 
    related_id: int, 
    user_id: int
) -> attachment_model.Attachment:
    
    # Create a unique path for the file to avoid name collisions
    # e.g., /code/uploads/deal_123/original_filename.pdf
    item_upload_dir = os.path.join(UPLOAD_DIRECTORY, f"{related_to}_{related_id}")
    os.makedirs(item_upload_dir, exist_ok=True)
    
    file_path = os.path.join(item_upload_dir, file.filename)
    
    # Save the file to the filesystem
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_size = os.path.getsize(file_path)

    db_attachment = attachment_model.Attachment(
        related_to=related_to,
        related_id=related_id,
        user_id=user_id,
        file_name=file.filename,
        file_path=file_path,
        file_type=file.content_type,
        file_size=file_size
    )
    
    db.add(db_attachment)
    db.commit()
    db.refresh(db_attachment)
    return db_attachment

def get_attachments_for_item(db: Session, related_to: str, related_id: int) -> List[attachment_model.Attachment]:
    return (
        db.query(attachment_model.Attachment)
        .options(joinedload(attachment_model.Attachment.uploader))
        .filter_by(related_to=related_to, related_id=related_id)
        .order_by(attachment_model.Attachment.created_at.desc())
        .all()
    )

def get_attachment(db: Session, attachment_id: int) -> attachment_model.Attachment:
    return db.query(attachment_model.Attachment).filter_by(id=attachment_id).first()