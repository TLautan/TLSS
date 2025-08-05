# backend/app/routers/audit_logs.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app import models, security
from app.crud import crud_audit_log
from app.schemas import audit_log
from app.database import get_db

router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"]
)

@router.get("/", response_model=List[audit_log.AuditLog])
def read_audit_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user)
):
    """
    Retrieve a list of audit logs.
    """
    return crud_audit_log.get_logs(db, skip=skip, limit=limit)