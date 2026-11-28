from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Application,User,Service,AuditLog
from app.schemas.schemas import DecisionIn
from app.core.dependencies import role_required
from app.api.routes.applications import app_out
router=APIRouter(prefix="/officer",tags=["Officer"])
@router.get("/applications")
def all_apps(db:Session=Depends(get_db),off=Depends(role_required("officer","admin"))): return [app_out(a,db) for a in db.query(Application).order_by(Application.updated_at.desc()).all()]
@router.post("/applications/{aid}/decision")
def decision(aid:str,data:DecisionIn,db:Session=Depends(get_db),off=Depends(role_required("officer","admin"))):
 a=db.query(Application).filter(Application.id==aid).first()
 if not a: raise HTTPException(404,"Application not found")
 if data.decision not in ["approved","rejected","action_required"]: raise HTTPException(400,"Invalid decision")
 a.status=data.decision;a.officer_remarks=data.remarks;a.assigned_officer_id=off.id;a.requested_documents=data.requestedDocuments if data.decision=="action_required" else []
 db.add(AuditLog(actor_id=off.id,action="APPLICATION_DECISION",target_type="application",target_id=a.id,details=data.decision+": "+data.remarks));db.commit();db.refresh(a);return app_out(a,db)
