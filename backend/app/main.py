from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import Base,engine
from app.models import models
from app.models.verification import VerificationRun, VerificationCheck, ExtractedField
from app.api.routes import auth,services,applications,documents,officer,admin,verification
Base.metadata.create_all(bind=engine)
app=FastAPI(title="JanSahayak AI API",version="0.1.0")
origins=[x.strip() for x in settings.cors_origins.split(",") if x.strip()]
app.add_middleware(CORSMiddleware,allow_origins=origins,allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
app.include_router(auth.router,prefix="/api")
app.include_router(services.router,prefix="/api")
app.include_router(applications.router,prefix="/api")
app.include_router(documents.router,prefix="/api")
app.include_router(officer.router,prefix="/api")
app.include_router(admin.router,prefix="/api")
app.include_router(verification.router,prefix="/api")
@app.get("/api/health")
def health(): return {"status":"ok","service":"JanSahayak AI API"}
@app.get("/")
def root(): return {"message":"JanSahayak AI API","docs":"/docs"}
