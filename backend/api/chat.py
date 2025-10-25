"""chat API endpoints for text and voice interactions."""
from fastapi import APIRouter, UploadFile, File, HTTPException
from models.schemas import TextChatRequest, VoiceChatResponse
from workflows.chat_workflow import chat_workflow
from services.whisper_service import transcribe_audio
from services.sarvam_service import synthesize_text
import base64
import uuid
import shutil
from pathlib import Path
from config.settings import settings
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/text")
async def chat_text(req: TextChatRequest):
    """accept text input and return conversational response."""
    session_id = req.session_id or str(uuid.uuid4())
    # pass through desired language if provided
    lang = getattr(req.language, "value", None) if req.language else None
    state = await chat_workflow.run(session_id, req.message, is_voice=False, language=lang)
    return {"session_id": session_id, "response": state.get("final_response")}


@router.post("/voice")
async def chat_voice(file: UploadFile = File(...)) -> VoiceChatResponse:
    """accept audio file, transcribe, detect emotion and return synthesized audio."""
    # save to temp
    temp_dir = Path(settings.audio_temp_dir)
    temp_dir.mkdir(parents=True, exist_ok=True)
    file_path = temp_dir / f"{uuid.uuid4()}_{file.filename}"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        transcribed = await transcribe_audio(str(file_path))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    text = transcribed.get("text", "")
    session_id = str(uuid.uuid4())
    state = await chat_workflow.run(session_id, text, is_voice=True)

    # synthesize response using Sarvam (if configured)
    audio_b64 = None
    try:
        audio_bytes = await synthesize_text(
            state.get("final_response", ""),
            language=state.get("language", "english"),
        )
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
    except Exception as e:
        logger.debug(f"sarvam synthesis failed or not configured: {e}")

    return VoiceChatResponse(
        transcript=text,
        language=transcribed.get("language", "english"),
        emotion=state.get("emotion", {}).get("label", "curious"),
        tts_url=None,
        audio_base64=audio_b64,
        confidence=transcribed.get("confidence", 0.0),
    )


@router.get("/history/{session_id}")
async def get_history(session_id: str):
    """retrieve conversation history for a session (in-memory MVP)."""
    # TODO: implement conversation memory storage (redis)
    return {"session_id": session_id, "messages": []}


@router.delete("/history/{session_id}")
async def delete_history(session_id: str):
    """clear conversation history for a session."""
    # TODO: implement persistent store deletion
    return {"session_id": session_id, "deleted": True}
