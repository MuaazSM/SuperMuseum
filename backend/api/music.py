"""music API endpoints for analysis and generation."""
from fastapi import APIRouter, HTTPException
from models.schemas import MusicAnalyzeRequest, PlaylistResponse, TrackMetadata
from workflows.music_workflow import music_workflow
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/generate")
async def generate_playlist(req: MusicAnalyzeRequest) -> PlaylistResponse:
    """generate a playlist for a story text."""
    try:
        state = await music_workflow.run(req.text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    tracks = [TrackMetadata(id=str(i), title=f"placeholder {i}", artists=["Unknown"]) for i, _ in enumerate(state.get("playlist", []), start=1)]
    return PlaylistResponse(tracks=tracks, explanation="placeholder playlist")


@router.post("/analyze")
async def analyze_story(req: MusicAnalyzeRequest):
    """analyze story and return extracted musical features."""
    state = await music_workflow.run(req.text)
    return {"features": state.get("music_features")}


@router.get("/track/{track_id}")
async def get_track(track_id: str):
    """fetch track details from Saavn.

    note: placeholder until Saavn client is implemented.
    """
    return {"id": track_id, "title": "placeholder"}
