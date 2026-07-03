# DOMinators - Smart Event Management Portal

A premium, production-ready event management platform built with React, Vite, Tailwind CSS, FastAPI, SQLAlchemy, and PostgreSQL-ready architecture.

## Structure

- frontend/: React + Vite + Tailwind UI
- backend/: FastAPI API with JWT auth and SQLAlchemy models
- database/: SQL / migration helpers
- docs/: product notes and deployment guidance

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL
