from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User,Service,Requirement,Rule,AuditLog
from app.schemas.schemas import ServiceIn,RequirementIn,RuleIn
from app.core.dependencies import role_required
from app.api.routes.auth import out_user
from app.api.routes.services import service_out,req_out,rule_out
router=APIRouter(prefix="/admin",tags=["Admin"]);admin=role_required("admin")
@router.get("/users")
def users(db:Session=Depends(get_db),u=Depends(admin)): return [out_user(x) for x in db.query(User).all()]
@router.patch("/users/{uid}")
def update_user(uid:str,data:dict,db:Session=Depends(get_db),u=Depends(admin)):
 x=db.query(User).filter(User.id==uid).first()
 if not x: raise HTTPException(404,"User not found")
 if data.get("role") in ["citizen","officer","admin"]: x.role=data["role"]
 if data.get("status") in ["active","inactive","suspended"]: x.status=data["status"]
 db.commit();db.refresh(x);return out_user(x)
@router.post("/users")
def create_user(data:dict,db:Session=Depends(get_db),u=Depends(admin)):
 from app.core.security import hash_password
 if db.query(User).filter(User.email==data.get("email","").lower()).first(): raise HTTPException(409,"Email exists")
 x=User(full_name=data["fullName"],email=data["email"].lower(),phone=data.get("phone",""),password_hash=hash_password(data.get("password","Temporary123!")),role=data.get("role","officer"),department=data.get("department"),designation=data.get("designation"));db.add(x);db.commit();db.refresh(x);return out_user(x)
@router.put("/services/{sid}")
def save_service(sid:str,data:ServiceIn,db:Session=Depends(get_db),u=Depends(admin)):
 x=db.query(Service).filter(Service.id==sid).first()
 if not x: x=Service(id=sid);db.add(x)
 for k,v in data.model_dump().items(): setattr(x, {"shortDescription":"short_description","fullDescription":"full_description","processingDays":"processing_days","feeInr":"fee_inr","isActive":"is_active","eligibilitySummary":"eligibility_summary","formFields":"form_fields"}.get(k,k),v)
 db.commit();db.refresh(x);return service_out(x)
@router.get("/document-requirements")
def requirements(db:Session=Depends(get_db),u=Depends(admin)): return [req_out(x) for x in db.query(Requirement).all()]
@router.put("/document-requirements/{rid}")
def save_req(rid:str,data:RequirementIn,db:Session=Depends(get_db),u=Depends(admin)):
 x=db.query(Requirement).filter(Requirement.id==rid).first()
 if not x: x=Requirement(id=rid);db.add(x)
 for k,v in data.model_dump().items(): setattr(x,{"serviceId":"service_id","documentType":"document_type","acceptedFormats":"accepted_formats","maxSizeMb":"max_size_mb","aiCheckPoints":"ai_check_points"}.get(k,k),v)
 db.commit();db.refresh(x);return req_out(x)
@router.delete("/document-requirements/{rid}")
def del_req(rid:str,db:Session=Depends(get_db),u=Depends(admin)):
 x=db.query(Requirement).filter(Requirement.id==rid).first()
 if x: db.delete(x);db.commit()
 return {"ok":True}
@router.get("/rules")
def rules(db:Session=Depends(get_db),u=Depends(admin)): return [rule_out(x) for x in db.query(Rule).all()]
@router.put("/rules/{rid}")
def save_rule(rid:str,data:RuleIn,db:Session=Depends(get_db),u=Depends(admin)):
 x=db.query(Rule).filter(Rule.id==rid).first()
 if not x: x=Rule(id=rid);db.add(x)
 for k,v in data.model_dump().items(): setattr(x,{"serviceId":"service_id","ruleName":"rule_name","failureMessage":"failure_message","isActive":"is_active"}.get(k,k),v)
 db.commit();db.refresh(x);return rule_out(x)
@router.delete("/rules/{rid}")
def del_rule(rid:str,db:Session=Depends(get_db),u=Depends(admin)):
 x=db.query(Rule).filter(Rule.id==rid).first()
 if x:db.delete(x);db.commit()
 return {"ok":True}
@router.get("/audit-logs")
def logs(db:Session=Depends(get_db),u=Depends(admin)): return [{"id":x.id,"timestamp":x.created_at.isoformat(),"actorId":x.actor_id,"actorName":"","actorRole":"admin","action":x.action,"targetType":x.target_type,"targetId":x.target_id,"details":x.details,"ipAddress":"","severity":x.severity} for x in db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(500).all()]
