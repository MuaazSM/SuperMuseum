"""music API endpoints for analysis and generation."""
from fastapi import APIRouter, HTTPException, Query
from models.schemas import MusicAnalyzeRequest, PlaylistResponse, TrackMetadata
from workflows.music_workflow import music_workflow
from services.saavn_service import saavn_client
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
    items = state.get("playlist", [])
    expls = state.get("explanations", [])
    tracks = []
    for i, it in enumerate(items):
        tracks.append(
            TrackMetadata(
                id=str(it.get("id", i + 1)),
                title=it.get("title", ""),
                artists=it.get("artists", []) or ["Unknown"],
                album=it.get("album"),
                duration_ms=it.get("duration_ms"),
                stream_url=it.get("stream_url"),
                reason=(expls[i] if i < len(expls) else None),
            )
        )
    # brief top-level explanation
    features = state.get("music_features", {})
    top_expl = f"Playlist curated for mood '{features.get('mood','')}', region '{features.get('region','')}', genres {', '.join(features.get('genres', [])[:2])}."
    return PlaylistResponse(tracks=tracks, explanation=top_expl)


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
    try:
        item = await saavn_client.get_song_details(track_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    if not item:
        raise HTTPException(status_code=404, detail="track not found")
    return TrackMetadata(
        id=item.get("id", track_id),
        title=item.get("title", ""),
        artists=item.get("artists", []),
        album=item.get("album"),
        duration_ms=item.get("duration_ms"),
        stream_url=item.get("stream_url"),
    )


@router.get("/search")
async def search_tracks(q: str = Query(..., description="search query"), limit: int = 10):
    """search tracks on Saavn and return normalized results."""
    try:
        items = await saavn_client.search_songs(q, limit=limit)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    tracks = [
        TrackMetadata(
            id=i.get("id", ""),
            title=i.get("title", ""),
            artists=i.get("artists", []),
            album=i.get("album"),
            duration_ms=i.get("duration_ms"),
            stream_url=i.get("stream_url"),
        )
        for i in items
    ]
    return {"results": tracks}
