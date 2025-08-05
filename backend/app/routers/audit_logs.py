# backend/app/routers/audit_logs.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app import crud, models, schemas, security
from app.database import get_db

router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"]
)

@router.get("/", response_model=List[schemas.audit_log.AuditLog])
def read_audit_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.user.User = Depends(security.get_current_user)
):
    """
    Retrieve a list of audit logs.
    """
    return crud.audit_log.get_logs(db, skip=skip, limit=limit)