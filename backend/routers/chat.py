from typing import AsyncGenerator

import os
import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from schemas import ChatRequest

router = APIRouter()


LM_STUDIO_BASE_URL = os.getenv("LM_STUDIO_URL", "http://localhost:1234/v1")

@router.post("/chat")
async def ai_chat(request_body: ChatRequest):
    if not request_body.messages:
        raise HTTPException(status_code=400, detail="Messages array is required")

    system_prompt = {
        "role": "system",
        "content": (
            "You are a strict academic assistant for students.\n"
            "RULES:\n"
            "1. ONLY answer questions related to studies, assignments, exams, or academic materials.\n"
            "2. If a user asks about anything else (movies, games, jokes, general chat), "
            "politely decline and steer them back to studying.\n"
            "3. Be encouraging but focused.\n"
            "4. Use Markdown for clear formatting."
        ),
    }

    payload = {
        "model": "local-model",
        "messages": [system_prompt, *[m.model_dump() for m in request_body.messages]],
        "stream": True,
    }

    async def stream_completion() -> AsyncGenerator[bytes, None]:
        lm_url = f"{LM_STUDIO_BASE_URL}/chat/completions"
        async with httpx.AsyncClient(timeout=None) as client:
            try:
                async with client.stream("POST", lm_url, json=payload) as resp:
                    resp.raise_for_status()
                    async for chunk in resp.aiter_bytes():
                        if chunk:
                            yield chunk
            except httpx.HTTPError as exc:
                err_msg = (
                    "Failed to connect to AI service. Ensure LM Studio is running."
                )
                raise HTTPException(status_code=500, detail=err_msg) from exc

    return StreamingResponse(stream_completion(), media_type="text/plain; charset=utf-8")

