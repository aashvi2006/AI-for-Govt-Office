from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings
_pwd=CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM="HS256"
def hash_password(p): return _pwd.hash(p)
def verify_password(p,h): return _pwd.verify(p,h)
def create_token(user_id):
    exp=datetime.now(timezone.utc)+timedelta(minutes=settings.jwt_expire_minutes)
    return jwt.encode({"sub":str(user_id),"exp":exp},settings.jwt_secret,algorithm=ALGORITHM)
def decode_token(token):
    try: return jwt.decode(token,settings.jwt_secret,algorithms=[ALGORITHM]).get("sub")
    except JWTError: return None
