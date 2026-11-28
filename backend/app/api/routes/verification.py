from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Application,Document,Requirement,Rule,User
from app.models.verification import VerificationRun,VerificationCheck,ExtractedField
from app.core.dependencies import current_user
from app.core.config import settings
from app.ai.pipeline import run_document_pipeline,run_rules
router=APIRouter(tags=['Verification'])

@router.post('/applications/{aid}/verify')
def verify(aid:str,db:Session=Depends(get_db),user=Depends(current_user)):
    a=db.query(Application).filter(Application.id==aid).first()
    if not a: raise HTTPException(404,'Application not found')
    if user.role=='citizen' and a.citizen_id!=user.id: raise HTTPException(403,'Forbidden')
    docs=db.query(Document).filter(Document.application_id==aid).all()
    reqs=db.query(Requirement).filter(Requirement.service_id==a.service_id).all()
    rules=db.query(Rule).filter(Rule.service_id==a.service_id,Rule.is_active==True).all()
    findings=[]; missing=[]; completeness=0
    for r in reqs:
        uploaded=any(d.requirement_id==r.id for d in docs)
        if r.mandatory and not uploaded: missing.append(r.title)
        findings.append({'type':'missing_document','severity':'high' if r.mandatory else 'low','title':r.title,'description':'Document uploaded' if uploaded else 'Required document missing','status':'PASS' if uploaded else 'WARNING','fieldAffected':r.document_type})
    total_req=sum(1 for r in reqs if r.mandatory); completeness=100 if total_req==0 else round(100*(total_req-len(missing))/total_req)
    extracted_records=[]; doc_reports=[]
    for d in docs:
        try:
            result=run_document_pipeline(d,settings.gemini_api_key,settings.gemini_model)
        except Exception as e:
            result={'ocr_text':'','ocr_engine':'error','fields':{},'notes':f'Processing error ({type(e).__name__}); manual review required.'}
        fields=result.get('fields',{})
        for key,val in fields.items():
            record=ExtractedField(document_id=d.id,field_name=str(key),field_value='' if val is None else str(val),confidence=0.0,source_text=result.get('ocr_text','')[:1000])
            db.add(record); extracted_records.append({'field':str(key),'extractedValue':'' if val is None else str(val),'confidence':0,'matches':None})
        d.status='ai_verified' if fields else 'pending'
        doc_reports.append({'documentId':d.id,'documentType':d.document_type,'ocrEngine':result.get('ocr_engine'),'ocrText':result.get('ocr_text','')[:5000],'fields':fields,'notes':result.get('notes','')})
    findings.extend(run_rules(a.form_data or {},rules))
    rule_warnings=sum(1 for x in findings if x.get('status')=='WARNING')
    consistency=0 # not assessed unless comparison data is available
    run=VerificationRun(application_id=a.id,status='completed',overall_outcome='review_required',report={})
    db.add(run);db.flush()
    for f in findings:
        db.add(VerificationCheck(run_id=run.id,category=f.get('type','check'),check_name=f.get('title','Check'),status=f.get('status','WARNING'),message=f.get('description',''),evidence={'fieldAffected':f.get('fieldAffected')}))
    score=max(0,min(100,completeness-rule_warnings*5))
    report={'generatedAt':run.created_at.isoformat(),'overallScore':score,'eligibilityPassed':False,'completenessScore':completeness,'consistencyScore':consistency,'summary':'Automated document intake and configured-rule screening only. This is not an official eligibility determination; officer review is required.','missingDocuments':missing,'findings':findings,'recommendedAction':'request_documents' if missing else 'manual_review','documents':doc_reports,'verificationRunId':run.id}
    run.report=report; a.status='action_required' if missing else 'under_officer_review'
    db.commit()
    return report

@router.get('/verification/{run_id}')
def get_run(run_id:str,db:Session=Depends(get_db),user=Depends(current_user)):
    run=db.query(VerificationRun).filter(VerificationRun.id==run_id).first()
    if not run: raise HTTPException(404,'Verification run not found')
    a=db.query(Application).filter(Application.id==run.application_id).first()
    if user.role=='citizen' and a.citizen_id!=user.id: raise HTTPException(403,'Forbidden')
    return run.report
