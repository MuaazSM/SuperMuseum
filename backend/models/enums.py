"""enumerations for languages, emotions and tones."""
from enum import Enum


class Language(str, Enum):
    """supported languages and dialect labels."""

    EN = "english"
    HI = "hindi"
    HINGLISH = "hinglish"
    TA = "tamil"
    TA_EN = "tamil-english"
    REGIONAL = "regional"


class Emotion(str, Enum):
    """emotion labels used across the system."""

    HAPPY = "happy"
    SAD = "sad"
    CURIOUS = "curious"
    BORED = "bored"
    EXCITED = "excited"


class Tone(str, Enum):
    """tones for tone adapter agent."""

    MYTHIC = "mythic_narrator"
    FOLK = "folk_storyteller"
    TEACHER = "teacher"
    FRIEND = "friend"
