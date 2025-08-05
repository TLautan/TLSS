# backend/app/crud/crud_audit_log.py

from sqlalchemy.orm import Session, joinedload
from typing import List
from app import models, schemas

def create_log_entry(db: Session, log: schemas.audit_log.AuditLogCreate):
    """
    Creates a new audit log entry.
    """
    db_log = models.audit_log.AuditLog(**log.model_dump())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_logs(db: Session, skip: int = 0, limit: int = 100) -> List[models.audit_log.AuditLog]:
    """
    Retrieves a list of all audit logs, with the most recent first.
    """
    return (
        db.query(models.audit_log.AuditLog)
        .options(joinedload(models.audit_log.AuditLog.user))
        .order_by(models.audit_log.AuditLog.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )