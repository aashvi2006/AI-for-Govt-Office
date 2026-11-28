# JanSahayak AI — Docker development stack

## Prerequisite
Install Docker Desktop and ensure its engine is running.

## Start
1. Extract this project folder.
2. In the project root, copy `.env.example` to `.env` and edit secrets (optional for local demo).
3. Run: `docker compose up --build`

Open:
- Frontend: http://localhost:5173
- API: http://localhost:8000
- Swagger: http://localhost:8000/docs

The backend Docker image creates a Python virtual environment at `/opt/venv` during image build and installs dependencies into it. No host Python installation or host venv is required.

## Seed demo data
In another terminal, run from the project root:
`docker compose exec backend python -m scripts.seed_demo`

## Create admin
PowerShell:
`$env:ADMIN_EMAIL='admin@jansahayak.local'; $env:ADMIN_PASSWORD='ReplaceWithStrongPassword'; docker compose exec backend python -m scripts.create_admin`

## Stop
`docker compose down`

Stop and delete the database volume (destructive, removes persisted DB data):
`docker compose down -v`

## Notes
- This is a development setup. Do not use real sensitive documents or production credentials.
- Frontend runs Vite development server in container, not a production build.
- Backend currently runs verification synchronously; Celery scaffold is not wired into application verification yet.
