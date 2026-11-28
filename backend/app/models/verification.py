import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, JSON, Text, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base

def uid(): return str(uuid.uuid4())
def now(): return datetime.now(timezone.utc)

class VerificationRun(Base):
    __tablename__ = 'verification_runs'
    id: Mapped[str] = mapped_column(String, primary_key=True, default=uid)
    application_id: Mapped[str] = mapped_column(ForeignKey('applications.id', ondelete='CASCADE'), index=True)
    status: Mapped[str] = mapped_column(String(30), default='completed')
    overall_outcome: Mapped[str] = mapped_column(String(30), default='review_required')
    report: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class ExtractedField(Base):
    __tablename__ = 'extracted_fields'
    id: Mapped[str] = mapped_column(String, primary_key=True, default=uid)
    document_id: Mapped[str] = mapped_column(ForeignKey('documents.id', ondelete='CASCADE'), index=True)
    field_name: Mapped[str] = mapped_column(String(120))
    field_value: Mapped[str] = mapped_column(Text, default='')
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    source_text: Mapped[str] = mapped_column(Text, default='')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class VerificationCheck(Base):
    __tablename__ = 'verification_checks'
    id: Mapped[str] = mapped_column(String, primary_key=True, default=uid)
    run_id: Mapped[str] = mapped_column(ForeignKey('verification_runs.id', ondelete='CASCADE'), index=True)
    category: Mapped[str] = mapped_column(String(80))
    check_name: Mapped[str] = mapped_column(String(160))
    status: Mapped[str] = mapped_column(String(30))
    message: Mapped[str] = mapped_column(Text, default='')
    evidence: Mapped[dict] = mapped_column(JSON, default=dict)
