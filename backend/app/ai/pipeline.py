from app.ai.ocr import extract_text
from app.ai.extraction import extract_structured
from app.ai.rules_engine import evaluate_rules

def run_document_pipeline(document, api_key=None, model='gemini-2.5-flash'):
    text, engine=extract_text(document.file_path,document.mime_type)
    extracted=extract_structured(text,document.document_type,api_key,model)
    return {'ocr_text':text,'ocr_engine':engine,'fields':extracted.get('fields',{}),'notes':extracted.get('notes','')}

def run_rules(form_data,rules): return evaluate_rules(form_data,rules)
