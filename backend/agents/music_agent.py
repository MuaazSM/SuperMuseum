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
        logger.debug("music_agent: extracting musical features via LLM")

        # 1) analyze story → features
        features = await self._analyze_story(text)

        # 2) derive search queries
        queries = self._build_queries(features)

        # 3) query saavn and rank
        results = await self._search_and_rank(queries, features, max_items=30)

        # 4) pick top N distinct tracks and explain
        playlist, explanations = self._select_and_explain(results, features, top_n=10)

        state["music_features"] = features
        state["playlist"] = playlist
        state["explanations"] = explanations
        return state

    async def _analyze_story(self, text: str) -> Dict[str, Any]:
        """use LLM to extract structured music features from story text."""
        data: Dict[str, Any] = {}
        if os.getenv("LLM_OFFLINE") == "1":
            logger.info("LLM_OFFLINE=1: skipping LLM for music analysis")
        else:
            try:
                llm = ModelLoader().load_llm()
                prompt_t = PROMPTS[PromptType.MUSIC_ANALYSIS].template
                prompt = ChatPromptTemplate.from_template(prompt_t)
                chain = prompt | llm | StrOutputParser()
                raw = await chain.ainvoke({"text": text})
                data = self._extract_json(raw)
            except Exception as e:  # pragma: no cover - external LLM
                logger.warning("music analysis LLM failed (%s), using heuristic fallback", e)
                data = {}

        # heuristic defaults
        def_val = lambda v, d: v if v else d
        features = {
            "mood": def_val(data.get("mood"), "serene"),
            "era": def_val(data.get("era"), "classical"),
            "region": def_val(data.get("region"), "north"),
            "emotions": data.get("emotions") or ["devotional"],
            "themes": data.get("themes") or ["mythology"],
            "ragas": data.get("ragas") or ["Yaman"],
            "instruments": data.get("instruments") or ["sitar", "tabla"],
            "genres": data.get("genres") or ["classical", "devotional"],
        }
        return features

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """extract first JSON object from text; return empty dict if parse fails."""
        try:
            # try direct parse
            return json.loads(text)
        except Exception:
            pass
        # fallback: regex for first {...}
        m = re.search(r"\{[\s\S]*\}", text)
        if not m:
            return {}
        try:
            return json.loads(m.group(0))
        except Exception:
            return {}

    def _build_queries(self, f: Dict[str, Any]) -> List[str]:
        """compose multiple search queries to cover features space."""
        region = f.get("region", "")
        genres = f.get("genres", [])
        instruments = f.get("instruments", [])
        themes = f.get("themes", [])
        ragas = f.get("ragas", [])

        queries = set()
        # region + genre
        for g in genres[:2]:
            if region:
                queries.add(f"{region} {g}")
            queries.add(g)
        # instruments
        for inst in instruments[:2]:
            if region:
                queries.add(f"{region} {inst}")
            queries.add(inst)
        # themes
        for th in themes[:2]:
            queries.add(f"{th} song")
            if region:
                queries.add(f"{region} {th}")
        # raga names may not map directly, but include anyway
        for r in ragas[:2]:
            queries.add(f"{r} classical")
        # mood keyword
        mood = f.get("mood")
        if mood:
            queries.add(f"{mood} instrumental")
        return [q for q in queries if q]

    async def _search_and_rank(self, queries: List[str], f: Dict[str, Any], max_items: int = 30) -> List[Dict[str, Any]]:
        """search saavn for each query and score results by cultural relevance."""
        seen = {}
        all_items: List[Dict[str, Any]] = []
        for q in queries:
            try:
                items = await saavn_client.search_songs(q, limit=8)
            except Exception as e:
                logger.debug("saavn search failed for '%s': %s", q, e)
                continue
            for it in items:
                key = it.get("id") or f"{it.get('title')}|{'/'.join(it.get('artists') or [])}"
                if key in seen:
                    continue
                score = self._score_item(it, f)
                it["_score"] = score
                seen[key] = True
                all_items.append(it)

        all_items.sort(key=lambda x: x.get("_score", 0), reverse=True)
        return all_items[:max_items]

    def _score_item(self, it: Dict[str, Any], f: Dict[str, Any]) -> float:
        """simple heuristic scoring based on keyword overlaps."""
        score = 0.0
        title = (it.get("title") or "").lower()
        album = (it.get("album") or "").lower()
        hay = f"{title} {album}"
        region = (f.get("region") or "").lower()
        if region and region in hay:
            score += 2.0
        for g in (f.get("genres") or [])[:3]:
            if g.lower() in hay:
                score += 1.0
        for th in (f.get("themes") or [])[:2]:
            if th.lower() in hay:
                score += 0.8
        for inst in (f.get("instruments") or [])[:2]:
            if inst.lower() in hay:
                score += 0.6
        # prefer longer duration (proxy for full track), if available
        if it.get("duration_ms") and it["duration_ms"] >= 120000:
            score += 0.4
        return score

    def _select_and_explain(self, ranked: List[Dict[str, Any]], f: Dict[str, Any], top_n: int = 10) -> Tuple[List[Dict[str, Any]], List[str]]:
        """dedupe and select top tracks; generate cultural explanation for each."""
        picked: List[Dict[str, Any]] = []
        seen_titles = set()
        for it in ranked:
            title_key = (it.get("title") or "").strip().lower()
            if not title_key or title_key in seen_titles:
                continue
            seen_titles.add(title_key)
            picked.append(it)
            if len(picked) >= top_n:
                break

        explanations: List[str] = []
        for it in picked:
            explanations.append(self._explain_track(it, f))

        return picked, explanations

    def _explain_track(self, it: Dict[str, Any], f: Dict[str, Any]) -> str:
        """generate a short human-friendly cultural justification for a track."""
        parts = []
        mood = f.get("mood")
        region = f.get("region")
        genres = ", ".join(f.get("genres", [])[:2])
        inst = ", ".join(f.get("instruments", [])[:2])
        raga = ", ".join(f.get("ragas", [])[:1])
        if mood:
            parts.append(f"matches the {mood} mood")
        if region:
            parts.append(f"reflects {region} traditions")
        if genres:
            parts.append(f"genre: {genres}")
        if inst:
            parts.append(f"instruments: {inst}")
        if raga:
            parts.append(f"suggested raga: {raga}")
        artists = ", ".join(it.get("artists", [])[:2])
        if artists:
            parts.append(f"artists: {artists}")
        return "; ".join(parts)
