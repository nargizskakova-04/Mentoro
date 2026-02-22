# Mentoro

Учебный AI-ассистент для студентов: генерация квизов по материалам, чат с ИИ, задания, история прохождений и персональные рекомендации по обучению.

## Стек

| Часть      | Технологии |
|-----------|------------|
| Frontend  | Next.js 16, React 19, TypeScript |
| Backend   | FastAPI, Python 3.11, SQLAlchemy 2 (async), asyncpg |
| БД        | PostgreSQL 16 |
| AI        | Groq API (Llama 3.3 70B) |
| Инфра     | Docker, Docker Compose |

## Быстрый старт (Docker)

1. **Клонируйте репозиторий и перейдите в каталог проекта**

   ```bash
   cd Mentoro
   ```

2. **Создайте файл `.env` в корне проекта** (рядом с `docker-compose.yml`):

   ```env
   POSTGRES_DB=mentoro
   POSTGRES_USER=mentoro
   POSTGRES_PASSWORD=mentoro123
   JWT_SECRET=ваш-секретный-ключ-для-jwt
   GROQ_API_KEY=ваш_ключ_groq
   FRONTEND_ORIGIN=http://localhost:3000
   ```

   Ключ Groq можно получить на [console.groq.com](https://console.groq.com).

3. **Запуск всех сервисов**

   ```bash
   docker compose up --build
   ```

   После запуска:

   - **Frontend:** http://localhost:3000  
   - **Backend API:** http://localhost:8000  
   - **PostgreSQL:** порт `5433` на хосте (внутри сети контейнеров — `5432`)

4. **Проверка бэкенда**

   ```bash
   curl http://localhost:8000/health
   # {"status":"ok"}
   ```

Таблицы в БД создаются автоматически при старте бэкенда (через `Base.metadata.create_all`).

## Запуск без Docker

### Backend

1. Установите PostgreSQL и создайте БД и пользователя (например: БД `mentoro`, пользователь `mentoro`, пароль `mentoro123`).
2. В каталоге `backend/`:

   ```bash
   python -m venv .venv
   source .venv/bin/activate   # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Создайте `backend/.env`:

   ```env
   DATABASE_URL=postgresql+asyncpg://mentoro:mentoro123@localhost:5432/mentoro
   JWT_SECRET=ваш-секретный-ключ
   GROQ_API_KEY=ваш_ключ_groq
   FRONTEND_ORIGIN=http://localhost:3000
   ```

4. Запуск:

   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend

1. В каталоге `frontend/`:

   ```bash
   npm install
   ```

2. Создайте `frontend/.env.local` (или `.env`):

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

   Для прокси через Next.js API routes к бэкенду в Docker можно задать:

   ```env
   BACKEND_URL=http://localhost:8000
   ```

3. Запуск:

   ```bash
   npm run dev
   ```

   Приложение откроется на http://localhost:3000.

## Структура проекта

```
Mentoro/
├── backend/                 # FastAPI-приложение
│   ├── main.py              # Точка входа, CORS, роутеры
│   ├── database.py         # Async SQLAlchemy, get_db
│   ├── models.py           # User, QuizHistory, Assignment
│   ├── schemas.py          # Pydantic-модели, JWT
│   ├── routers/
│   │   ├── auth.py         # Регистрация, логин, /me
│   │   ├── chat.py         # AI-чат (Groq)
│   │   ├── quizzes.py      # Загрузка документов, генерация квизов, чат по документу
│   │   ├── history.py      # Сохранение и получение истории квизов
│   │   ├── recommendations.py  # Рекомендации и план обучения
│   │   └── assignments.py  # CRUD заданий
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README_BACKEND.md   # Подробное описание API и запуска бэкенда
├── frontend/                # Next.js
│   ├── src/
│   │   ├── app/            # Страницы, API routes (прокси к бэкенду)
│   │   ├── components/     # UI и виджеты (квизы, чат, задания)
│   │   └── lib/            # api-urls, proxy-utils
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml      # postgres, backend, frontend
└── README.md               # этот файл
```

## Основные возможности

- **Авторизация:** регистрация, вход по email/паролю, JWT в cookie и по заголовку `Authorization: Bearer <token>`, обновление профиля.
- **AI-чат:** общий чат с ИИ (Groq), строго учебная тематика.
- **Квизы:** загрузка документов (TXT, MD, PDF), генерация квизов и объяснений, чат в контексте документа.
- **История квизов:** сохранение результатов, просмотр истории по пользователю.
- **Рекомендации:** персональный план обучения на основе целей, слабых тем и истории квизов.
- **Задания:** CRUD заданий (название, курс, статус, оценка), привязанных к пользователю.

Подробное описание эндпоинтов бэкенда — в [backend/README_BACKEND.md](backend/README_BACKEND.md).

## Переменные окружения

### Корень (Docker Compose)

| Переменная           | Описание |
|----------------------|----------|
| `POSTGRES_DB`        | Имя БД PostgreSQL |
| `POSTGRES_USER`      | Пользователь PostgreSQL |
| `POSTGRES_PASSWORD`  | Пароль PostgreSQL |
| `JWT_SECRET`         | Секрет для подписи JWT |
| `GROQ_API_KEY`       | Ключ API Groq |
| `FRONTEND_ORIGIN`    | Разрешённый CORS-оригин (например `http://localhost:3000`) |

### Backend

| Переменная       | Описание |
|------------------|----------|
| `DATABASE_URL`   | URL БД, например `postgresql+asyncpg://user:pass@host:5432/dbname` |
| `JWT_SECRET`     | Секрет для JWT |
| `GROQ_API_KEY`   | Ключ Groq API |
| `FRONTEND_ORIGIN`| CORS-оригин |

### Frontend

| Переменная             | Описание |
|------------------------|----------|
| `NEXT_PUBLIC_API_URL`  | Публичный URL бэкенда (для браузера), например `http://localhost:8000` |
| `BACKEND_URL`          | URL бэкенда для серверных запросов (API routes), в Docker — `http://backend:8000` |

## Лицензия

Проект учебный. Использование — на усмотрение авторов.
