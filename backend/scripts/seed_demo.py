"""Insert illustrative services so the frontend is not empty on first run."""
from app.db.database import SessionLocal, Base, engine
from app.models.models import Service, Requirement
Base.metadata.create_all(bind=engine)
db=SessionLocal()
services=[
 dict(code="INCOME_CERT",name="Income Certificate",department="Revenue Department",category="Income & Revenue",short_description="Apply for an income certificate.",full_description="Illustrative income certificate workflow.",processing_days=10,fee_inr=0,is_active=True,eligibility_summary=["Resident applicant","Income details provided"],form_fields=[{"name":"applicantName","label":"Applicant Name","type":"text","required":True},{"name":"annualIncome","label":"Annual Income","type":"number","required":True},{"name":"address","label":"Address","type":"textarea","required":True}]),
 dict(code="CASTE_CERT",name="Caste Certificate",department="Social Welfare Department",category="Identity & Civil",short_description="Apply for a caste certificate.",full_description="Illustrative caste certificate workflow.",processing_days=15,fee_inr=0,is_active=True,eligibility_summary=["Applicant details supplied","Supporting documents provided"],form_fields=[{"name":"applicantName","label":"Applicant Name","type":"text","required":True},{"name":"category","label":"Category","type":"select","required":True,"options":["SC","ST","OBC"]},{"name":"address","label":"Address","type":"textarea","required":True}]),
 dict(code="SCHOLARSHIP",name="Student Scholarship",department="Education Department",category="Education & Scholarship",short_description="Submit a scholarship application.",full_description="Illustrative scholarship application workflow.",processing_days=30,fee_inr=0,is_active=True,eligibility_summary=["Student details provided","Academic and income information supplied"],form_fields=[{"name":"applicantName","label":"Student Name","type":"text","required":True},{"name":"institution","label":"Institution","type":"text","required":True},{"name":"annualIncome","label":"Annual Household Income","type":"number","required":True}]),
]
for s in services:
 obj=db.query(Service).filter_by(code=s['code']).first()
 if not obj: obj=Service(**s);db.add(obj);db.flush()
 reqs=[("identity","Identity Proof","Identity proof document"),("address","Address Proof","Address proof document")]
 if s['code']=="SCHOLARSHIP":reqs=[("identity","Identity Proof","Identity proof document"),("marksheet","Academic Marksheet","Latest marksheet"),("income","Income Proof","Income proof document")]
 for typ,title,desc in reqs:
  if not db.query(Requirement).filter_by(service_id=obj.id,title=title).first():db.add(Requirement(service_id=obj.id,document_type=typ,title=title,description=desc,mandatory=True,accepted_formats=["pdf","jpg","png"],max_size_mb=5,ai_check_points=[]))
db.commit();db.close();print("Seeded demo services")
