from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import base64
from utils.tts import synthesize_audio

from services.llm_agent import chat_with_gemini

router = APIRouter()

class ChatRequest(BaseModel):
    user_input: str
    history: Optional[List[str]] = []
    voice: Optional[bool] = False

class ChatResponse(BaseModel):
    reply: str
    history: List[str]
    audio: Optional[str] = None

@router.post("/reply", response_model=ChatResponse)
async def reply(request: ChatRequest):
    try:
        reply_text, updated_history = chat_with_gemini(
            user_input=request.user_input,
            history=request.history
        )
        audio_data = None
        if request.voice:
            audio_bytes = synthesize_audio(reply_text)
            if audio_bytes:
                audio_data = base64.b64encode(audio_bytes).decode("utf-8")
            else:
                print("⚠️ synthesize_audio returned None")

        return ChatResponse(reply=reply_text, history=updated_history, audio=audio_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))