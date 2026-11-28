import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import Application, Document, AuditLog
from app.core.config import settings
from app.core.dependencies import current_user, role_required
from app.schemas.schemas import InspectIn

router = APIRouter(prefix="/documents", tags=["Documents"])


def out(d):
    return {
        "id": d.id,
        "applicationId": d.application_id,
        "requirementId": d.requirement_id,
        "documentType": d.document_type,
        "title": d.title,
        "fileName": d.file_name,
        "fileSizeBytes": d.file_size_bytes,
        "mimeType": d.mime_type,
        "previewUrl": "",
        "uploadedAt": d.uploaded_at.isoformat(),
        "status": d.status,
        "aiConfidence": 0,
        "aiNotes": "Verification pending",
        "extractedFields": [],
        "officerComment": d.officer_comment,
    }


@router.post("/upload")
def upload(
    applicationId: str = Form(...),
    requirementId: str = Form(...),
    documentType: str = Form(...),
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(current_user),
):
    a = db.query(Application).filter(Application.id == applicationId).first()
    if not a:
        raise HTTPException(404, "Application not found")
    if user.role == "citizen" and a.citizen_id != user.id:
        raise HTTPException(403, "Not your application")
    if file.content_type not in ["application/pdf", "image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(400, "Unsupported file type")

    content = file.file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(413, "File exceeds 10 MB")

    os.makedirs(settings.upload_dir, exist_ok=True)
    ext = os.path.splitext(file.filename or "file")[1]
    name = f"{uuid.uuid4()}{ext}"
    path = os.path.join(settings.upload_dir, name)

    with open(path, "wb") as stored_file:
        stored_file.write(content)

    try:
        d = Document(
            application_id=a.id,
            requirement_id=requirementId,
            document_type=documentType,
            title=title,
            file_name=file.filename or name,
            file_path=path,
            file_size_bytes=len(content),
            mime_type=file.content_type,
            status="pending",
        )
        db.add(d)
        # Flush first so the document's generated ID is available to the audit record.
        db.flush()

        db.add(
            AuditLog(
                actor_id=user.id,
                action="DOCUMENT_UPLOADED",
                target_type="document",
                target_id=str(d.id),
                details=d.file_name,
            )
        )
        db.commit()
        db.refresh(d)
        return out(d)
    except Exception:
        db.rollback()
        # Avoid leaving an orphaned file if the database transaction fails.
        try:
            os.remove(path)
        except OSError:
            pass
        raise


@router.delete("/{did}")
def delete(did: str, db: Session = Depends(get_db), user=Depends(current_user)):
    d = db.query(Document).filter(Document.id == did).first()
    if not d:
        raise HTTPException(404, "Document not found")
    a = db.query(Application).filter(Application.id == d.application_id).first()
    if user.role == "citizen" and a.citizen_id != user.id:
        raise HTTPException(403, "Forbidden")
    try:
        os.remove(d.file_path)
    except OSError:
        pass
    db.delete(d)
    db.commit()
    return {"ok": True}


@router.patch("/{did}/inspect")
def inspect(
    did: str,
    data: InspectIn,
    db: Session = Depends(get_db),
    off=Depends(role_required("officer", "admin")),
):
    d = db.query(Document).filter(Document.id == did).first()
    if not d:
        raise HTTPException(404, "Document not found")
    d.status = data.status
    d.officer_comment = data.officerComment
    db.commit()
    db.refresh(d)
    return out(d)
