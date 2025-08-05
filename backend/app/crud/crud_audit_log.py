# backend/app/crud/crud_audit_log.py

from sqlalchemy.orm import Session, joinedload
from typing import List
from app.models import audit_log as audit_log_models
from app.schemas import audit_log as audit_log_schemas

def create_log_entry(db: Session, log: audit_log_schemas.AuditLogCreate):
    """
    Creates a new audit log entry.
    """
    db_log = audit_log_models.AuditLog(**log.model_dump())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_logs(db: Session, skip: int = 0, limit: int = 100) -> List[audit_log_models.AuditLog]:
    """
    Retrieves a list of all audit logs, with the most recent first.
    """
    return (
        db.query(audit_log_models.AuditLog)
        .options(joinedload(audit_log_models.AuditLog.user))
        .order_by(audit_log_models.AuditLog.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )