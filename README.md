# JanSahayak AI — Consolidated backend package

FastAPI + PostgreSQL + SQLAlchemy, JWT roles, services/applications/documents, officer/admin routes, configurable rules, persistent verification runs/checks/fields, OCR adapter and optional Gemini structured extraction.

## Windows PowerShell setup
1. Extract this package. Copy its `backend` folder into your project root (keep your frontend), and keep `docker-compose.backend.yml` at project root.
2. From project root run: `docker compose -f docker-compose.backend.yml up -d`
3. In `backend`: `python -m venv .venv`, activate `.venv`, then `pip install -r requirements.txt`.
4. Copy `.env.example` to `.env`; set a long JWT secret and optionally `GEMINI_API_KEY`.
5. Run `uvicorn app.main:app --reload` from backend.
6. In a second backend terminal with the venv active: `python -m scripts.seed_demo`.
7. Create an admin: PowerShell `$env:ADMIN_EMAIL='admin@jansahayak.local'; $env:ADMIN_PASSWORD='ReplaceMe123!'` then `python -m scripts.create_admin`.
8. Frontend `frontend/.env`: `VITE_API_BASE_URL=http://localhost:8000/api` and `VITE_USE_MOCK=false`; restart Vite.

API docs: http://localhost:8000/docs

## Verification
`POST /api/applications/{id}/verify` performs required-document completeness, configured-rule checks, attempts PDF text extraction with pypdf, and optional Gemini field extraction if configured. Image OCR requires optional PaddleOCR installation. Extraction is advisory; officer review is always required. OCR/AI outputs are not authentic government validation, fraud findings, or automated decisions.

Optional PaddleOCR install (if needed): install PaddlePaddle/PaddleOCR using their current platform-specific installation guidance, then rerun the verification endpoint. PDF text extraction dependency is included.

## Notes and limitations
- Starter uses `Base.metadata.create_all` for hackathon setup. Alembic migrations are not yet configured; back up the DB before model changes.
- The Celery worker scaffold exists but verification endpoint currently executes synchronously; background task integration is the next engineering task.
- Upload storage is local and intended for demo use. Do not expose this deployment to real sensitive documents without security review, secure storage, malware scanning, access controls and retention policies.
- This is an illustrative prototype. No live government system integrations.
