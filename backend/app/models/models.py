import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, ForeignKey, JSON, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
def uid(): return str(uuid.uuid4())
def now(): return datetime.now(timezone.utc)
class User(Base):
    __tablename__="users"
    id: Mapped[str]=mapped_column(String,primary_key=True,default=uid)
    full_name: Mapped[str]=mapped_column(String(160))
    email: Mapped[str]=mapped_column(String(255),unique=True,index=True)
    phone: Mapped[str]=mapped_column(String(40),default="")
    password_hash: Mapped[str]=mapped_column(String(255))
    role: Mapped[str]=mapped_column(String(20),default="citizen")
    status: Mapped[str]=mapped_column(String(20),default="active")
    department: Mapped[str|None]=mapped_column(String(160),nullable=True)
    designation: Mapped[str|None]=mapped_column(String(160),nullable=True)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
    last_login_at: Mapped[datetime|None]=mapped_column(DateTime(timezone=True),nullable=True)
class Service(Base):
    __tablename__="services"
    id: Mapped[str]=mapped_column(String,primary_key=True,default=uid)
    code: Mapped[str]=mapped_column(String(40),unique=True)
    name: Mapped[str]=mapped_column(String(200))
    department: Mapped[str]=mapped_column(String(200),default="")
    category: Mapped[str]=mapped_column(String(100),default="Identity & Civil")
    short_description: Mapped[str]=mapped_column(Text,default="")
    full_description: Mapped[str]=mapped_column(Text,default="")
    processing_days: Mapped[int]=mapped_column(Integer,default=15)
    fee_inr: Mapped[int]=mapped_column(Integer,default=0)
    is_active: Mapped[bool]=mapped_column(Boolean,default=True)
    eligibility_summary: Mapped[list]=mapped_column(JSON,default=list)
    form_fields: Mapped[list]=mapped_column(JSON,default=list)
class Requirement(Base):
    __tablename__="document_requirements"
    id: Mapped[str]=mapped_column(String,primary_key=True,default=uid)
    service_id: Mapped[str]=mapped_column(ForeignKey("services.id",ondelete="CASCADE"),index=True)
    document_type: Mapped[str]=mapped_column(String(120))
    title: Mapped[str]=mapped_column(String(160))
    description: Mapped[str]=mapped_column(Text,default="")
    mandatory: Mapped[bool]=mapped_column(Boolean,default=True)
    accepted_formats: Mapped[list]=mapped_column(JSON,default=lambda:["pdf","jpg","png"])
    max_size_mb: Mapped[int]=mapped_column(Integer,default=5)
    ai_check_points: Mapped[list]=mapped_column(JSON,default=list)
class Rule(Base):
    __tablename__="eligibility_rules"
    id: Mapped[str]=mapped_column(String,primary_key=True,default=uid)
    service_id: Mapped[str]=mapped_column(ForeignKey("services.id",ondelete="CASCADE"),index=True)
    rule_name: Mapped[str]=mapped_column(String(160))
    field: Mapped[str]=mapped_column(String(120))
    operator: Mapped[str]=mapped_column(String(20))
    value: Mapped[str]=mapped_column(String(255))
    failure_message: Mapped[str]=mapped_column(Text,default="")
    severity: Mapped[str]=mapped_column(String(20),default="warning")
    is_active: Mapped[bool]=mapped_column(Boolean,default=True)
class Application(Base):
    __tablename__="applications"
    id: Mapped[str]=mapped_column(String,primary_key=True,default=uid)
    reference_number: Mapped[str]=mapped_column(String(40),unique=True,index=True)
    citizen_id: Mapped[str]=mapped_column(ForeignKey("users.id"),index=True)
    service_id: Mapped[str]=mapped_column(ForeignKey("services.id"))
    status: Mapped[str]=mapped_column(String(40),default="draft")
    form_data: Mapped[dict]=mapped_column(JSON,default=dict)
    officer_remarks: Mapped[str|None]=mapped_column(Text,nullable=True)
    assigned_officer_id: Mapped[str|None]=mapped_column(ForeignKey("users.id"),nullable=True)
    requested_documents: Mapped[list]=mapped_column(JSON,default=list)
    submitted_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
    updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now,onupdate=now)
class Document(Base):
    __tablename__="documents"
    id: Mapped[str]=mapped_column(String,primary_key=True,default=uid)
    application_id: Mapped[str]=mapped_column(ForeignKey("applications.id",ondelete="CASCADE"),index=True)
    requirement_id: Mapped[str]=mapped_column(String)
    document_type: Mapped[str]=mapped_column(String(120))
    title: Mapped[str]=mapped_column(String(160))
    file_name: Mapped[str]=mapped_column(String(255))
    file_path: Mapped[str]=mapped_column(String(500))
    file_size_bytes: Mapped[int]=mapped_column(Integer)
    mime_type: Mapped[str]=mapped_column(String(120))
    uploaded_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
    status: Mapped[str]=mapped_column(String(40),default="pending")
    officer_comment: Mapped[str|None]=mapped_column(Text,nullable=True)
class AuditLog(Base):
    __tablename__="audit_logs"
    id: Mapped[str]=mapped_column(String,primary_key=True,default=uid)
    actor_id: Mapped[str|None]=mapped_column(String,nullable=True)
    action: Mapped[str]=mapped_column(String(100))
    target_type: Mapped[str]=mapped_column(String(100))
    target_id: Mapped[str]=mapped_column(String(100))
    details: Mapped[str]=mapped_column(Text,default="")
    severity: Mapped[str]=mapped_column(String(20),default="info")
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
