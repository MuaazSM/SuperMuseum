"""direct text-to-speech API endpoint using Sarvam AI."""
from fastapi import APIRouter, HTTPException
from models.schemas import TTSRequest, TTSResponse
from services.sarvam_service import get_sarvam_service
import base64
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/convert", response_model=TTSResponse)
async def tts_convert(req: TTSRequest) -> TTSResponse:
    """convert input text to speech and return base64-encoded audio.

    uses Sarvam AI under the hood.
    """
    try:
        service = get_sarvam_service()
        audio_bytes = service.synthesize_text(
            text=req.text,
            language=req.language or "english",
            speaker=req.speaker or "anushka",
            pitch=req.pitch or 0.0,
            pace=req.pace or 1.0,
            loudness=req.loudness or 1.0,
            enable_preprocessing=req.enable_preprocessing if req.enable_preprocessing is not None else True,
            model=req.model or "bulbul:v2",
        )
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
        return TTSResponse(audio_base64=audio_b64, language=req.language or "english", speaker=req.speaker or "anushka")
    except Exception as exc:
        logger.exception("tts conversion failed")
        raise HTTPException(status_code=500, detail=str(exc))
