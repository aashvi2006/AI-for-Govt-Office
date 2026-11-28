from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Application,Service,User,AuditLog,Document
from app.schemas.schemas import ApplicationIn
from app.core.dependencies import current_user
router=APIRouter(prefix="/applications",tags=["Applications"])
def app_out(a,db):
 u=db.query(User).filter(User.id==a.citizen_id).first();s=db.query(Service).filter(Service.id==a.service_id).first()
 return {"id":a.id,"referenceNumber":a.reference_number,"citizenId":a.citizen_id,"citizenName":u.full_name if u else "","citizenEmail":u.email if u else "","serviceId":a.service_id,"serviceName":s.name if s else "","department":s.department if s else "","status":a.status,"submittedAt":a.submitted_at.isoformat(),"updatedAt":a.updated_at.isoformat(),"assignedOfficerId":a.assigned_officer_id,"formData":a.form_data,"documents":[{"id":d.id,"applicationId":d.application_id,"requirementId":d.requirement_id,"documentType":d.document_type,"title":d.title,"fileName":d.file_name,"fileSizeBytes":d.file_size_bytes,"mimeType":d.mime_type,"previewUrl":"","uploadedAt":d.uploaded_at.isoformat(),"status":d.status,"aiConfidence":0,"aiNotes":"Verification is advisory; see report","extractedFields":[],"officerComment":d.officer_comment} for d in db.query(Document).filter(Document.application_id==a.id).all()],"officerRemarks":a.officer_remarks,"requestedDocuments":a.requested_documents,"timeline":[{"id":"created","timestamp":a.submitted_at.isoformat(),"stage":"Application Created","actor":"Citizen","description":"Application created","state":"completed"}]}
@router.get("/my")
def mine(db:Session=Depends(get_db),user=Depends(current_user)): return [app_out(a,db) for a in db.query(Application).filter(Application.citizen_id==user.id).order_by(Application.updated_at.desc()).all()]
@router.get("/{aid}")
def detail(aid:str,db:Session=Depends(get_db),user=Depends(current_user)):
 a=db.query(Application).filter(Application.id==aid).first()
 if not a: raise HTTPException(404,"Application not found")
 if user.role=="citizen" and a.citizen_id!=user.id: raise HTTPException(403,"Not your application")
 return app_out(a,db)
@router.post("")
def create(data:ApplicationIn,db:Session=Depends(get_db),user=Depends(current_user)):
 s=db.query(Service).filter(Service.id==data.serviceId).first()
 if not s: raise HTTPException(404,"Service not found")
 import secrets
 ref=f"JS-{__import__('datetime').datetime.now().year}-{secrets.randbelow(900000)+100000}"
 a=Application(reference_number=ref,citizen_id=user.id,service_id=s.id,status="documents_pending",form_data=data.formData)
 db.add(a);db.flush();db.add(AuditLog(actor_id=user.id,action="APPLICATION_CREATED",target_type="application",target_id=a.id,details=ref));db.commit();db.refresh(a);return app_out(a,db)
