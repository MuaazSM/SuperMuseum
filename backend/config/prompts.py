"""system prompts migrated from previous prompt library.

lowercase: this module exposes curated prompts used by agents.
"""
from typing import Dict
from enum import Enum


class PromptType(str, Enum):
    """types of prompt templates."""

    CONVERSATION = "conversation"
    MUSIC_ANALYSIS = "music_analysis"


class PromptTemplate:
    """simple container for a prompt template."""

    def __init__(self, template: str, description: str = ""):
        self.template = template.strip()
        self.description = description


PROMPTS: Dict[PromptType, PromptTemplate] = {
    PromptType.CONVERSATION: PromptTemplate(
        template=(
            "You are a culturally aware assistant specialized in Indian heritage."
            " Use provided context and answer concisely in the user's language and tone.\n\n"
            "CONTEXT:\n{context}\n\nUSER_MESSAGE: {message}\n\nRESPONSE:"
        ),
        description="primary conversational RAG prompt",
    ),
    PromptType.MUSIC_ANALYSIS: PromptTemplate(
        template=(
            "You are a musicologist with deep understanding of Indian classical and folk traditions."
            " Based on the story text below, extract mood, era, region, primary emotions, and recommend ragas, instruments, genres and short justification.\n\n"
            "STORY:\n{text}\n\nOUTPUT:" 
        ),
        description="music analysis for story-to-music mapping",
    ),
}
