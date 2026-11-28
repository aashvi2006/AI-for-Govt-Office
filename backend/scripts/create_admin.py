import os
from app.db.database import Base,engine,SessionLocal
from app.models.models import User
from app.core.security import hash_password
Base.metadata.create_all(bind=engine)
db=SessionLocal()
email=os.getenv('ADMIN_EMAIL','admin@jansahayak.local').lower()
password=os.getenv('ADMIN_PASSWORD')
if not password:
 raise SystemExit('Set ADMIN_PASSWORD before running this script.')
if db.query(User).filter_by(email=email).first(): print('Admin already exists.')
else:
 u=User(full_name=os.getenv('ADMIN_NAME','JanSahayak Admin'),email=email,phone='',password_hash=hash_password(password),role='admin',status='active')
 db.add(u);db.commit();print('Admin account created:',email)
db.close()
