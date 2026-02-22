## mentoro AI Backend (FastAPI)

This directory contains the FastAPI backend service for mentoro AI. It provides:

- **Auth** (`/api/auth/*`) with JWT cookies and PostgreSQL via SQLAlchemy (async)
- **AI Chat** (`/api/ai/chat`) that proxies to the Groq API (OpenAI-compatible)
- **Quizzes** (`/api/quizzes/*`) for document upload, quiz generation, and document-aware chat
- **Health check** at `/health`

The Next.js frontend talks only to its own API routes, which in turn proxy requests to this backend.

---

### Running with Docker Compose (recommended)

From the project root (`mentoroAI`):

```bash
docker compose up --build
```

This will start:

- `postgres` on port `5432`
- `backend` (FastAPI) on port `8000`

The backend container uses the following environment variables (see `docker-compose.yml`):

- `DATABASE_URL=postgresql+asyncpg://mentoro:mentoro123@postgres:5432/mentoro`
- `JWT_SECRET=dev-secret-key`
- `GROQ_API_KEY=<your Groq API key>`

After the containers are up, apply migrations inside the `backend` container:

```bash
docker compose exec backend bash
cd /app

```

---

### Running Locally without Docker

#### 1. Start PostgreSQL

Ensure you have a local PostgreSQL instance running and create a database, for example:

- Database: `mentoro`
- User: `mentoro`
- Password: `mentoro123`

Example connection string:

```text
postgresql+asyncpg://mentoro:mentoro123@localhost:5432/mentoro
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
DATABASE_URL=postgresql+asyncpg://mentoro:mentoro123@localhost:5432/mentoro
JWT_SECRET=dev-secret-key
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_ORIGIN=http://localhost:3000
```


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
    - On success: sets `auth_token` HttpOnly cookie and returns `{ "message": "Login successful", "token": "<jwt>" }`. Use the cookie in the browser, or use the `token` in the `Authorization: Bearer <token>` header for API clients (e.g. Postman).
  - `GET /api/auth/me`
    - Auth: `auth_token` cookie **or** header `Authorization: Bearer <token>`. Returns `{ "user": { ... } }` on success.
  - `PATCH /api/auth/me`
    - Auth: same as above. Body: `{ "name"?, "major"?, "group"?, "gpa"? }`. Returns updated user.

- **AI Chat**
  - `POST /api/ai/chat`
    - Body: `{ "messages": [{ "role": "user" | "assistant" | "system", "content": string }, ...] }`
    - Streams back plain text from the Groq API.

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
  - `postgresql+asyncpg://mentoro:mentoro123@localhost:5432/mentoro`
- **JWT_SECRET**: Secret key for signing JWTs.
- **GROQ_API_KEY**: API key for the Groq API (get one at [console.groq.com](https://console.groq.com)). Used for AI chat and quiz generation.
- **FRONTEND_ORIGIN**: Allowed CORS origin for the Next.js app (default: `http://localhost:3000`).

---

### Testing auth with Postman

1. **Register**  
   `POST http://localhost:8000/api/auth/register`  
   Body (raw JSON): `{ "name": "Test User", "email": "test@example.com", "password": "yourpassword" }`

2. **Login**  
   `POST http://localhost:8000/api/auth/login`  
   Body (raw JSON): `{ "email": "test@example.com", "password": "yourpassword" }`  
   In the response you get `"token": "<long-jwt-string>"`. Copy that token.

3. **Call protected endpoints**  
   For `GET /api/auth/me`, `PATCH /api/auth/me`, or any `/api/assignments` route, add a header:  
   `Authorization: Bearer <paste-the-token-here>`  
   (No need to rely on cookies; the backend accepts either the cookie or the Bearer token.)

If login returns **401 Invalid credentials**, double-check the email and password. The user must have been created with `POST /api/auth/register` (so the password is stored as bcrypt hash). Using the same email/password in the login body should work.

