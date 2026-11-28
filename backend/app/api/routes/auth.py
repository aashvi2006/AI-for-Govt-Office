from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from datetime import datetime,timezone
from app.db.database import get_db
from app.models.models import User,AuditLog
from app.schemas.schemas import RegisterIn,LoginIn
from app.core.security import hash_password,verify_password,create_token
router=APIRouter(prefix="/auth",tags=["Authentication"])
def out_user(u): return {"id":u.id,"fullName":u.full_name,"email":u.email,"phone":u.phone,"role":u.role,"status":u.status,"createdAt":u.created_at.isoformat(),"lastLoginAt":u.last_login_at.isoformat() if u.last_login_at else None,"department":u.department,"designation":u.designation}
@router.post("/register")
def register(data:RegisterIn,db:Session=Depends(get_db)):
    if data.role!="citizen": raise HTTPException(400,"Public registration is citizen-only")
    if db.query(User).filter(User.email==data.email.lower()).first(): raise HTTPException(409,"Email already registered")
    u=User(full_name=data.fullName,email=data.email.lower(),phone=data.phone,password_hash=hash_password(data.password),role="citizen")
    db.add(u);db.flush();db.add(AuditLog(actor_id=u.id,action="USER_REGISTERED",target_type="user",target_id=u.id,details="Citizen account registered"));db.commit();db.refresh(u)
    return {"token":create_token(u.id),"user":out_user(u)}
@router.post("/login")
def login(data:LoginIn,db:Session=Depends(get_db)):
    u=db.query(User).filter(User.email==data.email.lower()).first()
    if not u or not verify_password(data.password,u.password_hash): raise HTTPException(401,"Invalid email or password")
    if u.status!="active": raise HTTPException(403,"Account inactive")
    u.last_login_at=datetime.now(timezone.utc);db.add(AuditLog(actor_id=u.id,action="USER_LOGIN",target_type="auth",target_id=u.id,details="Login"));db.commit()
    return {"token":create_token(u.id),"user":out_user(u)}
