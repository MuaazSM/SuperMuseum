"""music synthesis agent: converts story text into a playlist.

lowercase: uses LLM analysis, maps features to musical elements and queries Saavn.
"""
from typing import Dict, Any, List, Tuple
import os
from agents.base_agent import BaseAgent
from config.prompts import PROMPTS, PromptType
from services.saavn_service import saavn_client
from utils.model_loader import ModelLoader
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import json
import re
import logging

logger = logging.getLogger(__name__)


class MusicAgent(BaseAgent):
    """generate a playlist and cultural explanations from a story."""

    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        text = state.get("text") or state.get("story") or ""
        logger.debug("music_agent: generating queries and searching Saavn")

        # Optionally use LLM to generate queries, or just use the text directly
        queries = [text]
        # If you want to use LLM for query generation, uncomment below:
        # features = await self._analyze_story(text)
        # queries = self._build_queries(features)

        # Query Saavn for each query and collect tracks
        playlist = []
        for q in queries:
            try:
                items = await saavn_client.search_songs(q, limit=10)
                playlist.extend(items)
            except Exception as e:
                logger.debug(f"saavn search failed for '{q}': {e}")
                continue

        # Deduplicate tracks by id
        seen = set()
        unique_playlist = []
        for it in playlist:
            track_id = it.get("id")
            if track_id and track_id not in seen:
                seen.add(track_id)
                unique_playlist.append(it)
            if len(unique_playlist) >= 10:
                break

        state["playlist"] = unique_playlist
        return state

    # RAG/LLM analysis removed for music workflow. Only Saavn API is used.

    # ...existing code...

    # ...existing code...

    # ...existing code...

    # ...existing code...

    # ...existing code...

    # ...existing code...
