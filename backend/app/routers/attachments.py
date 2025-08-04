# backend/app/routers/attachments.py

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from app.schemas import attachment as attachment_schemas
from app.crud import crud_attachment
from app import models, security
from app.database import get_db

router = APIRouter(
    prefix="/attachments",
    tags=["Attachments"]
)

@router.post("/upload", response_model=attachment_schemas.Attachment)
def upload_attachment(
    related_to: str = Form(...),
    related_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user)
):
    """
    Upload a file and associate it with a deal or company.
    """
    if related_to not in ["deal", "company"]:
        raise HTTPException(status_code=400, detail="Invalid 'related_to' type.")
    
    return crud_attachment.save_attachment(
        db=db, file=file, related_to=related_to, related_id=related_id, user_id=current_user.id
    )

@router.get("/{related_to}/{related_id}", response_model=List[attachment_schemas.Attachment])
def read_attachments_for_item(
    related_to: str,
    related_id: int,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user)
):
    """
    Get all attachments for a specific item.
    """
    return crud_attachment.get_attachments_for_item(db=db, related_to=related_to, related_id=related_id)

@router.get("/download/{attachment_id}")
def download_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user)
):
    """
    Download a specific attachment file.
    """
    attachment = crud_attachment.get_attachment(db, attachment_id=attachment_id)
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
        
    return FileResponse(path=attachment.file_path, filename=attachment.file_name, media_type=attachment.file_type)