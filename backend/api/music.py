"""music API endpoints for analysis and generation."""
from fastapi import APIRouter, HTTPException, Query
from models.schemas import MusicAnalyzeRequest, PlaylistResponse, TrackMetadata
from workflows.music_workflow import music_workflow
from services.saavn_service import saavn_client
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/generate")
async def generate_playlist(req: MusicAnalyzeRequest, include_stream: bool = Query(False)) -> PlaylistResponse:
    """generate a playlist for a story text.
    
    args:
        req: music analysis request with text
        include_stream: if True, includes playable stream URLs (default: False for security)
    """
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
                stream_url=(it.get("stream_url") if include_stream else None),
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
async def get_track(track_id: str, include_stream: bool = Query(False)):
    """fetch track details from Saavn.

    args:
        track_id: Saavn track identifier
        include_stream: if True, includes playable stream URL (default: False for security)
    """
    try:
        logger.info(f"Fetching track details for ID: {track_id}, include_stream: {include_stream}")
        item = await saavn_client.get_song_details(track_id)
    except Exception as exc:
        logger.error(f"Error fetching track {track_id}: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
    if not item:
        logger.warning(f"Track not found: {track_id}")
        raise HTTPException(status_code=404, detail=f"track not found: {track_id}")
    
    stream = item.get("stream_url") if include_stream else None
    logger.info(f"Track {track_id} found. Stream URL included: {include_stream}, Has stream: {bool(item.get('stream_url'))}")
    return TrackMetadata(
        id=item.get("id", track_id),
        title=item.get("title", ""),
        artists=item.get("artists", []),
        album=item.get("album"),
        duration_ms=item.get("duration_ms"),
        stream_url=stream,
    )


@router.get("/search")
async def search_tracks(q: str = Query(..., description="search query"), limit: int = 10, include_stream: bool = Query(False)):
    """search tracks on Saavn and return normalized results.
    
    Uses LLM to intelligently expand cultural music queries into better Saavn search terms.
    
    args:
        q: search query string (can be natural language like "folk songs with harmonium")
        limit: maximum number of results (default: 10)
        include_stream: if True, includes playable stream URLs (default: False for security)
    """
    try:
        # Use LLM to enhance the query for Indian cultural music
        enhanced_query = await _enhance_music_query(q)
        logger.info(f"Original query: '{q}' -> Enhanced: '{enhanced_query}'")
        
        items = await saavn_client.search_songs(enhanced_query, limit=limit)
        
        # If no results, try with original query as fallback
        if not items:
            logger.info(f"No results with enhanced query, trying original: '{q}'")
            items = await saavn_client.search_songs(q, limit=limit)
        
        # If still no results, try generic Indian folk/classical terms
        if not items:
            fallback_terms = _get_fallback_terms(q)
            logger.info(f"Trying fallback terms: {fallback_terms}")
            for term in fallback_terms:
                items = await saavn_client.search_songs(term, limit=limit)
                if items:
                    break
                    
    except Exception as exc:
        logger.error(f"Search failed: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
    
    tracks = [
        TrackMetadata(
            id=i.get("id", ""),
            title=i.get("title", ""),
            artists=i.get("artists", []),
            album=i.get("album"),
            duration_ms=i.get("duration_ms"),
            stream_url=(i.get("stream_url") if include_stream else None),
        )
        for i in items
    ]
    return {"results": tracks}


def _get_fallback_terms(query: str) -> list[str]:
    """Generate fallback search terms based on query keywords."""
    query_lower = query.lower()
    fallback = []
    
    if "folk" in query_lower:
        fallback.extend(["indian folk songs", "lok geet", "rajasthani folk"])
    if "harmonium" in query_lower:
        fallback.extend(["harmonium instrumental", "bhajan harmonium"])
    if "classical" in query_lower:
        fallback.extend(["hindustani classical", "carnatic music"])
    if "devotional" in query_lower or "bhajan" in query_lower:
        fallback.extend(["bhajan", "devotional songs", "anup jalota"])
    if "flute" in query_lower or "bansuri" in query_lower:
        fallback.extend(["bansuri instrumental", "flute classical"])
    
    # Default fallback
    if not fallback:
        fallback = ["indian classical music", "indian folk songs"]
    
    return fallback[:3]  # Max 3 fallback attempts


async def _enhance_music_query(user_query: str) -> str:
    """Use LLM to convert natural language queries into better Saavn search terms."""
    from utils.model_loader import ModelLoader
    
    model_loader = ModelLoader()
    llm = model_loader.load_llm()
    
    prompt = f"""You are an expert in Indian music and culture. Convert the user's music search query into the best possible search terms for JioSaavn (Indian music streaming service).

User Query: "{user_query}"

Rules:
1. If the query mentions instruments (harmonium, sitar, tabla, flute, etc.), include specific Indian genres/artists known for those instruments
2. For cultural/regional requests, suggest specific genres, artists, or song types
3. For folk music, specify regional styles (Rajasthani folk, Bengali folk, Punjabi folk, etc.)
4. For devotional music, suggest bhajans, kirtans, aartis, or specific deity names
5. For classical, specify Hindustani or Carnatic styles
6. Keep it concise - 3-5 keywords maximum
7. Use terms that would work well on JioSaavn

Return ONLY the enhanced search query, nothing else. No explanations.

Enhanced Query:"""

    response = await llm.ainvoke(prompt)
    enhanced = response.content.strip().strip('"').strip("'")
    
    # Fallback to original if LLM returns empty or too long
    if not enhanced or len(enhanced) > 100:
        return user_query
    
    return enhanced
