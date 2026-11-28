from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Service,Requirement,Rule
from app.core.dependencies import current_user
router=APIRouter(prefix="/services",tags=["Services"])
def service_out(s): return {"id":s.id,"code":s.code,"name":s.name,"department":s.department,"category":s.category,"shortDescription":s.short_description,"fullDescription":s.full_description,"processingDays":s.processing_days,"feeInr":s.fee_inr,"isActive":s.is_active,"eligibilitySummary":s.eligibility_summary,"formFields":s.form_fields}
def req_out(r): return {"id":r.id,"serviceId":r.service_id,"documentType":r.document_type,"title":r.title,"description":r.description,"mandatory":r.mandatory,"acceptedFormats":r.accepted_formats,"maxSizeMb":r.max_size_mb,"aiCheckPoints":r.ai_check_points}
def rule_out(r): return {"id":r.id,"serviceId":r.service_id,"ruleName":r.rule_name,"field":r.field,"operator":r.operator,"value":r.value,"failureMessage":r.failure_message,"severity":r.severity,"isActive":r.is_active}
@router.get("")
def list_services(db:Session=Depends(get_db),user=Depends(current_user)): return [service_out(s) for s in db.query(Service).all()]
@router.get("/{sid}")
def service_detail(sid:str,db:Session=Depends(get_db),user=Depends(current_user)):
    s=db.query(Service).filter(Service.id==sid).first()
    if not s: raise HTTPException(404,"Service not found")
    return {"service":service_out(s),"requirements":[req_out(r) for r in db.query(Requirement).filter(Requirement.service_id==sid).all()],"rules":[rule_out(r) for r in db.query(Rule).filter(Rule.service_id==sid,Rule.is_active==True).all()]}
