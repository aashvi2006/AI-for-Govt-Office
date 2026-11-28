"""Gemini extraction. If API is unavailable, return OCR text without fabricated fields."""
import json

def extract_structured(text, document_type, api_key=None, model='gemini-2.5-flash'):
    if not text.strip(): return {'fields':{},'notes':'No OCR text was available.'}
    if not api_key: return {'fields':{},'notes':'Gemini API key not configured; OCR text retained for manual review.'}
    try:
        from google import genai
        client=genai.Client(api_key=api_key)
        prompt=('Extract factual fields from the document text. Do not infer missing values. '
                'Return JSON object fields mapping field names to values or null. Document type: '+document_type+'\nText:\n'+text)
        response=client.models.generate_content(model=model,contents=prompt,config={'response_mime_type':'application/json'})
        parsed=json.loads(response.text or '{}')
        return {'fields':parsed if isinstance(parsed,dict) else {},'notes':'Gemini extraction; confirm manually.'}
    except Exception as e:
        return {'fields':{},'notes':f'AI extraction failed; manual review required ({type(e).__name__}).'}
