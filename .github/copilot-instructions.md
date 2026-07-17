# CampusEats AI Coding Instructions

- This repo is primarily a FastAPI backend in `backend/` with a PostgreSQL database powered by SQLAlchemy and Alembic.
- The app entrypoint is `backend/app/main.py`. It registers routers from `backend/app/api/` and creates tables via `Base.metadata.create_all(bind=engine)`.
- API routes live in `backend/app/api/`. The existing routes are `health.py` and `auth.py`, with `auth.py` exposing `/auth/register` and `/auth/login`.
- Database session injection is done through `backend/app/core/database.py` using `get_db()` and SQLAlchemy `SessionLocal`. Keep using `Depends(get_db)` for route handlers.
- Models are defined under `backend/app/models/` and are standard SQLAlchemy declarative classes. Key tables are `User`, `Restaurant`, `MenuItem`, and `Claim`.
- Pydantic request/response schemas are under `backend/app/schemas/`. `UserResponse` uses `Config.from_attributes = True` for ORM conversion.
- Authentication uses `app.auth.hashing` and JWT helpers in `backend/app/auth/jwt.py`. Tokens are created with `create_access_token(...)` and returned as bearer tokens.
- Environment config is loaded from `backend/.env` via `backend/app/core/config.py` using Pydantic `BaseSettings`.
- Local development uses Docker Compose from repo root: `docker compose up --build`. The `api` service builds from `backend/` and depends on `db`.
- The database container uses `pgvector/pgvector:pg16` and defaults to `campuseats/password/campuseats` credentials from `docker-compose.yml`.
- Alembic migrations are under `backend/alembic/`. When schema changes are needed, update models and add a new revision instead of only relying on `Base.metadata.create_all`.
- Main backend dependencies are in `backend/requirements.txt`: FastAPI, SQLAlchemy 2.x, Alembic, Pydantic 2.x, python-jose, passlib.
- Prefer editing backend code in `backend/app/` and avoid touching frontend files unless the user explicitly asks for full-stack changes.
- Do not assume there is an existing `.github` agent guide in this repo; use this file as the authoritative instruction set.

## Important files to inspect first
- `backend/app/main.py`
- `backend/app/api/auth.py`
- `backend/app/core/database.py`
- `backend/app/core/config.py`
- `backend/app/models/*.py`
- `backend/app/schemas/*.py`
- `backend/app/auth/jwt.py`
- `docker-compose.yml`
- `backend/Dockerfile`
- `backend/requirements.txt`

## What to avoid
- Avoid speculative refactors that change architecture without clear need.
- Avoid adding new routes outside `backend/app/api/` unless the feature clearly belongs there.
- Avoid changing the DB URL handling in `backend/app/core/database.py` or `backend/alembic.ini` unless environment config is part of the task.

## Feedback
If something is unclear or you need more detail about `backend/app/api/`, the auth flow, or how Alembic is expected to be used, ask before making larger changes.