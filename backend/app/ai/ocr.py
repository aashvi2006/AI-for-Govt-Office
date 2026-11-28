"""Optional OCR adapters. PaddleOCR is loaded lazily; PDF text extraction uses pypdf."""
from pathlib import Path

def extract_text(path, mime_type=''):
    p=Path(path)
    if mime_type=='application/pdf' or p.suffix.lower()=='.pdf':
        try:
            from pypdf import PdfReader
            return '\n'.join((page.extract_text() or '') for page in PdfReader(str(p)).pages), 'pdf_text'
        except Exception as e:
            return '', f'pdf_error: {e}'
    try:
        from paddleocr import PaddleOCR
        ocr=PaddleOCR(use_angle_cls=True, lang='en')
        result=ocr.ocr(str(p), cls=True)
        lines=[]
        for page in result or []:
            for row in page or []:
                if row and len(row)>1: lines.append(str(row[1][0]))
        return '\n'.join(lines), 'paddleocr'
    except Exception as e:
        return '', f'ocr_unavailable: {e}'
