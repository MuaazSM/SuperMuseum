"""pydantic request/response schemas for chat and music APIs."""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from models.enums import Language, Emotion, Tone


class TextChatRequest(BaseModel):
    """request body for text chat."""

    session_id: Optional[str] = None
    message: str
    language: Optional[Language] = None


class VoiceChatResponse(BaseModel):
    """response for voice chat including transcript and tts url."""

    transcript: str
    language: str
    emotion: Emotion
    tts_url: Optional[str] = None
    confidence: Optional[float] = None


class MusicAnalyzeRequest(BaseModel):
    """request payload for music analysis."""

    text: str
    preferred_region: Optional[str] = None


class TrackMetadata(BaseModel):
    """metadata for a music track result."""

    id: str
    title: str
    artists: List[str]
    album: Optional[str] = None
    duration_ms: Optional[int] = None
    stream_url: Optional[str] = None
    reason: Optional[str] = None


class PlaylistResponse(BaseModel):
    """playlist response returned by music generation."""

    tracks: List[TrackMetadata]
    explanation: Optional[str] = None
