## CampusMate AI Backend (FastAPI)

This directory contains the FastAPI backend service for CampusMate AI. It provides:

- **Auth** (`/api/auth/*`) with JWT cookies and PostgreSQL via SQLAlchemy (async)
- **AI Chat** (`/api/ai/chat`) that proxies to a local LM Studio instance
- **Quizzes** (`/api/quizzes/*`) for document upload, quiz generation, and document-aware chat
- **Health check** at `/health`

The Next.js frontend talks only to its own API routes, which in turn proxy requests to this backend.

---

### Running with Docker Compose (recommended)

From the project root (`CampusMateAI`):

```bash
docker compose up --build
```

This will start:

- `postgres` on port `5432`
- `backend` (FastAPI) on port `8000`

The backend container uses the following environment variables (see `docker-compose.yml`):

- `DATABASE_URL=postgresql+asyncpg://campusmate:campusmate123@postgres:5432/campusmate`
- `JWT_SECRET=dev-secret-key`
- `LM_STUDIO_URL=http://host.docker.internal:1234/v1`

After the containers are up, apply migrations inside the `backend` container:

```bash
docker compose exec backend bash
cd /app
alembic upgrade head
```

---

### Running Locally without Docker

#### 1. Start PostgreSQL

Ensure you have a local PostgreSQL instance running and create a database, for example:

- Database: `campusmate`
- User: `campusmate`
- Password: `campusmate123`

Example connection string:

```text
postgresql+asyncpg://campusmate:campusmate123@localhost:5432/campusmate
```

#### 2. Create a virtual environment and install dependencies

From `backend/`:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

#### 3. Configure environment variables

Create a `.env` file in `backend/` (or export env vars in your shell) with at least:

```env
DATABASE_URL=postgresql+asyncpg://campusmate:campusmate123@localhost:5432/campusmate
JWT_SECRET=dev-secret-key
LM_STUDIO_URL=http://localhost:1234/v1
FRONTEND_ORIGIN=http://localhost:3000
```

#### 4. Run Alembic migrations

Still in `backend/`:

```bash
alembic upgrade head
```

This creates the `users` table.

#### 5. Start the FastAPI server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`.

---

### Endpoints Overview

- **Health**
  - `GET /health` → `{ "status": "ok" }`

- **Auth**
  - `POST /api/auth/register`
    - Body: `{ "name": string, "email": string, "password": string }`
    - Returns: `{ "message": string, "user": { ... } }` (no password field)
  - `POST /api/auth/login`
    - Body: `{ "email": string, "password": string }`
    - On success: sets `auth_token` HttpOnly cookie and returns `{ "message": "Login successful" }`
  - `GET /api/auth/me`
    - Reads `auth_token` cookie, returns `{ "user": { ... } }` on success

- **AI Chat**
  - `POST /api/ai/chat`
    - Body: `{ "messages": [{ "role": "user" | "assistant" | "system", "content": string }, ...] }`
    - Streams back plain text from LM Studio.

- **Quizzes**
  - `POST /api/quizzes/upload`
    - Multipart form-data with `file`
    - Supports: `.txt`, `.md`, `.pdf` (basic), other text-like files as best effort
    - Returns: `{ success, sessionId, extractedText, message }`
  - `POST /api/quizzes/generate`
    - Body: `{ "type": "explain" | "quiz", "documentText": string }`
    - Streams back plain text (Markdown for `explain`, raw JSON for `quiz`).
  - `POST /api/quizzes/chat`
    - Body: `{ "messages": [...], "documentText": string }`
    - Streams back plain text answers using the document as context.

---

### Environment Variables Reference

- **DATABASE_URL**: Async SQLAlchemy URL for PostgreSQL using `asyncpg`, e.g.
  - `postgresql+asyncpg://campusmate:campusmate123@localhost:5432/campusmate`
- **JWT_SECRET**: Secret key for signing JWTs.
- **LM_STUDIO_URL**: Base URL for the LM Studio API (usually `http://localhost:1234/v1` or `http://host.docker.internal:1234/v1` in Docker).
- **FRONTEND_ORIGIN**: Allowed CORS origin for the Next.js app (default: `http://localhost:3000`).

