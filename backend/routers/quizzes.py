import io
import os
import uuid
from typing import AsyncGenerator

import httpx
import pdfplumber
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse

from schemas import QuizChatRequest, QuizGenerateRequest

router = APIRouter()


GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
MAX_CONTEXT_CHARS = 6000


def truncate_for_context(text: str) -> str:
    if len(text) <= MAX_CONTEXT_CHARS:
        return text
    return text[:MAX_CONTEXT_CHARS] + (
        "\n\n[... документ обрезан из-за ограничения контекста модели ...]"
    )


@router.post("/upload")
async def upload_quiz_file(file: UploadFile = File(...)):
    if not file:
        return JSONResponse({"error": "No file provided"}, status_code=400)

    filename = file.filename or "document"
    ext = (filename.split(".")[-1] if "." in filename else "").lower()

    try:
        if ext in {"txt", "md"}:
            content_bytes = await file.read()
            text = content_bytes.decode("utf-8", errors="ignore")
        elif ext == "pdf":
            content_bytes = await file.read()
            with pdfplumber.open(io.BytesIO(content_bytes)) as pdf:
                pages_text = [page.extract_text() or "" for page in pdf.pages]
            text = "\n".join(pages_text)
        elif ext in {"doc", "docx", "xlsx"}:
            raise HTTPException(
                status_code=400,
                detail=f"File type .{ext} is not fully supported. Please use .txt, .md, or .pdf for best results.",
            )
        else:
            content_bytes = await file.read()
            text = content_bytes.decode("utf-8", errors="ignore")
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        return JSONResponse(
            {"error": "Failed to process document", "details": str(exc)}, status_code=500
        )

    cleaned_text = (text or "").strip() or "No readable content found in the document."

    session_id = f"session-{uuid.uuid4()}"

    return JSONResponse(
        {
            "success": True,
            "sessionId": session_id,
            "extractedText": cleaned_text,
            "message": "Document processed successfully",
        }
    )


@router.post("/generate")
async def generate_from_document(body: QuizGenerateRequest):
    if body.type not in {"explain", "quiz"}:
        return JSONResponse({"error": "Invalid generation type"}, status_code=400)

    context_text = (body.documentText or "").strip()
    if not context_text:
        return JSONResponse(
            {
                "error": "No document content available. Please upload a document first.",
            },
            status_code=400,
        )

    context_text = truncate_for_context(context_text)

    if body.type == "explain":
        system_prompt = (
            "You are a study assistant. Your task is to explain and help people learn. "
            "Study the received data and explain what it is about. Also answer follow-up "
            "questions from the user. Use Markdown formatting for readability."
        )
        user_prompt = f"Study the following document and explain what it is about:\n\n{context_text}"
    else:
        system_prompt = (
            "You are a strict output generator. You must generate a JSON array of 10 "
            "multiple choice questions.\n\n"
            "IMPORTANT: Questions must be about the SUBJECT MATTER and LEARNING CONTENT inside "
            "the document - test the student's understanding of the concepts, definitions, "
            "facts, and ideas presented in the text. Do NOT ask meta-questions about the "
            "document itself (e.g. \"What format is this document?\" or \"How many sections "
            "does this have?\").\n\n"
            "The output must be a valid JSON array of objects. NO markdown, NO code blocks, "
            "just raw JSON.\n"
            "Each object must have:\n"
            '- "question": string (tests knowledge from the content)\n'
            '- "options": array of 4 strings\n'
            '- "correctAnswer": string (must match one of the options exactly)\n'
            '- "explanation": string (brief explanation referring to the document content)\n'
        )
        user_prompt = (
            "Generate exactly 10 multiple choice questions that test understanding of the material "
            f"in this document:\n\n{context_text}"
        )

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": True,
    }

    headers = {"Authorization": f"Bearer {GROQ_API_KEY}"} if GROQ_API_KEY else {}

    async def stream_completion() -> AsyncGenerator[bytes, None]:
        groq_url = f"{GROQ_BASE_URL}/chat/completions"
        async with httpx.AsyncClient(timeout=None) as client:
            try:
                async with client.stream("POST", groq_url, json=payload, headers=headers) as resp:
                    resp.raise_for_status()
                    async for chunk in resp.aiter_bytes():
                        if chunk:
                            yield chunk
            except httpx.HTTPError as exc:
                msg = "Failed to generate content"
                raise HTTPException(status_code=500, detail=msg) from exc

    return StreamingResponse(stream_completion(), media_type="text/plain; charset=utf-8")


@router.post("/chat")
async def quiz_chat(body: QuizChatRequest):
    if not body.messages:
        return JSONResponse({"error": "Messages array is required"}, status_code=400)

    context_text = (body.documentText or "").strip()
    if not context_text:
        return JSONResponse(
            {
                "error": "No document context. Please upload and process a document first.",
            },
            status_code=400,
        )

    context_text = truncate_for_context(context_text)

    system_prompt = {
        "role": "system",
        "content": (
            "You are a helpful academic tutor assisting a student with a document.\n"
            "Use the following context to answer the student's questions.\n"
            "If the answer is not in the context, say you don't find it in the document "
            "but try to answer from general knowledge if relevant (and mark it as general "
            "knowledge).\n\n"
            "CONTEXT:\n"
            f"{context_text}\n\n"
            "RULES:\n"
            "1. Be concise and clear.\n"
            "2. Use Markdown formatting.\n"
            "3. Maintain a professional, encouraging tone."
        ),
    }

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [system_prompt, *[m.model_dump() for m in body.messages]],
        "stream": True,
    }

    headers = {"Authorization": f"Bearer {GROQ_API_KEY}"} if GROQ_API_KEY else {}

    async def stream_completion() -> AsyncGenerator[bytes, None]:
        groq_url = f"{GROQ_BASE_URL}/chat/completions"
        async with httpx.AsyncClient(timeout=None) as client:
            try:
                async with client.stream("POST", groq_url, json=payload, headers=headers) as resp:
                    resp.raise_for_status()
                    async for chunk in resp.aiter_bytes():
                        if chunk:
                            yield chunk
            except httpx.HTTPError as exc:
                msg = "Failed to process chat"
                raise HTTPException(status_code=500, detail=msg) from exc

    return StreamingResponse(stream_completion(), media_type="text/plain; charset=utf-8")

