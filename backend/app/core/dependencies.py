from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import decode_token
from app.models.models import User
security=HTTPBearer(auto_error=False)
def current_user(creds:HTTPAuthorizationCredentials=Depends(security),db:Session=Depends(get_db)):
    if not creds: raise HTTPException(401,"Authentication required")
    uid=decode_token(creds.credentials)
    user=db.query(User).filter(User.id==uid).first() if uid else None
    if not user or user.status!="active": raise HTTPException(401,"Invalid or inactive account")
    return user
def role_required(*roles):
    def check(user=Depends(current_user)):
        if user.role not in roles: raise HTTPException(403,"Insufficient permissions")
        return user
    return check
