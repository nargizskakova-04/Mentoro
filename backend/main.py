import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, chat, quizzes


app = FastAPI(title="CampusMate AI Backend")

frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api/ai", tags=["ai"])
app.include_router(quizzes.router, prefix="/api/quizzes", tags=["quizzes"])

