# JanSahayak AI Backend Starter

This starter implements the API contract used by the AIFGO React frontend for auth, services, applications, file uploads, officer decisions, admin management and a placeholder completeness verification report. AI/OCR is intentionally not wired in yet.

## Setup (local)
1. Install PostgreSQL and create database/user, or use Docker Compose at repository root.
2. `cd backend`
3. Create venv: `python -m venv .venv` then activate it.
4. Install: `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and adjust database URL / JWT secret.
6. Run: `uvicorn app.main:app --reload`
7. API docs: http://localhost:8000/docs; health: http://localhost:8000/api/health

Tables are created on startup for this prototype. Before production, replace this with Alembic migrations, add comprehensive tests, hardened file storage, rate limiting and secret management.

## Frontend integration
In frontend `.env`, set `VITE_API_BASE_URL=http://localhost:8000/api` and `VITE_USE_MOCK=false`, restart Vite.

## Important prototype limitations
- Verification endpoint currently checks required document presence only; it does not OCR, Gemini, authenticate certificates or determine official eligibility.
- Uploads stored locally in `uploads/`; protect this directory and do not expose it as static files.
- Public registration is citizen-only. Admin can provision staff accounts.
- Admin provisioned users receive a temporary default password (`Temporary123!`) if no password is supplied; change this implementation before deployment.
