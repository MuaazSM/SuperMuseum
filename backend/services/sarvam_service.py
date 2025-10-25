"""integration with Sarvam AI for Indian-accent TTS.

lowercase: wrapper that calls external Sarvam API and returns audio URLs.
"""
from typing import Optional, Dict, Any
import logging
import base64
import tempfile
from pathlib import Path
from sarvamai import SarvamAI
from config.settings import settings

logger = logging.getLogger(__name__)

# language code mapping for Sarvam API
LANGUAGE_CODE_MAP = {
    "hindi": "hi-IN",
    "bengali": "bn-IN",
    "kannada": "kn-IN",
    "malayalam": "ml-IN",
    "marathi": "mr-IN",
    "odia": "or-IN",
    "punjabi": "pa-IN",
    "tamil": "ta-IN",
    "telugu": "te-IN",
    "gujarati": "gu-IN",
    "english": "en-IN",
}

# available speakers (from current API validation error)
AVAILABLE_SPEAKERS = [
    "anushka", "abhilash", "manisha", "vidya", "arya", "karun", "hitesh",
    "aditya", "isha", "ritu", "chirag", "harsh", "sakshi", "priya",
    "neha", "rahul", "pooja", "rohan", "simran", "kavya", "anjali",
    "sneha", "kiran", "vikram", "rajesh", "sunita", "tara", "anirudh",
    "kriti", "ishaan"
]

# alias map to keep older names working
SPEAKER_ALIASES = {
    "meera": "anushka",
    "arvind": "rahul",
}


class SarvamTTSService:
    """service class for Sarvam AI text-to-speech operations."""
    
    def __init__(self):
        """initialize Sarvam client with API key from settings."""
        if not settings.sarvam_api_key:
            logger.warning("sarvam_api_key not configured - TTS will fail")
            self._client = None
        else:
            self._client = SarvamAI(api_subscription_key=settings.sarvam_api_key)
    
    def synthesize_text(
        self,
        text: str,
        language: str = "hindi",
    speaker: str = "anushka",
        pitch: float = 0.0,
        pace: float = 1.0,
        loudness: float = 1.0,
        enable_preprocessing: bool = True,
        model: str = "bulbul:v2"
    ) -> bytes:
        """synthesize text to speech using Sarvam API.
        
        args:
            text: text to synthesize
            language: language name (hindi, bengali, tamil, etc.)
            speaker: voice to use (anushka, meera, arvind)
            pitch: pitch adjustment (-1.0 to 1.0)
            pace: speech pace (0.5 to 2.0)
            loudness: volume (0.5 to 2.0)
            enable_preprocessing: whether to normalize text
            model: model version (bulbul:v2 is latest)
        
        returns: audio bytes (WAV format)
        
        raises: RuntimeError if API key not configured or request fails
        """
        if not self._client:
            raise RuntimeError("sarvam api key is not configured")
        
        # map language name to code
        language_code = LANGUAGE_CODE_MAP.get(language.lower())
        if not language_code:
            logger.warning(f"unknown language '{language}', defaulting to hi-IN")
            language_code = "hi-IN"
        
        # normalize/validate speaker
        if speaker in SPEAKER_ALIASES:
            logger.info(f"mapping speaker alias '{speaker}' -> '{SPEAKER_ALIASES[speaker]}'")
            speaker = SPEAKER_ALIASES[speaker]
        if speaker not in AVAILABLE_SPEAKERS:
            logger.warning(f"unknown speaker '{speaker}', defaulting to anushka")
            speaker = "anushka"
        
        try:
            logger.info(f"synthesizing text: language={language_code}, speaker={speaker}")
            
            response = self._client.text_to_speech.convert(
                text=text,
                target_language_code=language_code,
                speaker=speaker,
                pitch=pitch,
                pace=pace,
                loudness=loudness,
                speech_sample_rate=22050,
                enable_preprocessing=enable_preprocessing,
                model=model
            )
            
            # response contains base64-encoded audio in 'audios' field
            if hasattr(response, 'audios') and response.audios:
                # decode base64 audio
                audio_base64 = response.audios[0]
                audio_bytes = base64.b64decode(audio_base64)
                logger.info(f"synthesized {len(audio_bytes)} bytes of audio")
                return audio_bytes
            else:
                raise RuntimeError("no audio returned from Sarvam API")
                
        except Exception as e:
            logger.error(f"sarvam TTS failed: {e}")
            raise RuntimeError(f"text-to-speech synthesis failed: {e}")
    
    def synthesize_to_file(
        self,
        text: str,
        output_path: str,
        language: str = "hindi",
        speaker: str = "meera",
        **kwargs
    ) -> str:
        """synthesize text and save to file.
        
        args:
            text: text to synthesize
            output_path: path to save audio file
            language: language name
            speaker: voice to use
            **kwargs: additional parameters for synthesize_text
        
        returns: path to saved audio file
        """
        audio_bytes = self.synthesize_text(
            text=text,
            language=language,
            speaker=speaker,
            **kwargs
        )
        
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, "wb") as f:
            f.write(audio_bytes)
        
        logger.info(f"saved audio to {output_file}")
        return str(output_file)


# singleton instance
_sarvam_service: Optional[SarvamTTSService] = None


def get_sarvam_service() -> SarvamTTSService:
    """get or create the singleton Sarvam TTS service."""
    global _sarvam_service
    if _sarvam_service is None:
        _sarvam_service = SarvamTTSService()
    return _sarvam_service


# convenience functions for backward compatibility
async def synthesize_text(
    text: str,
    language: str = "hindi",
    speaker: Optional[str] = None
) -> bytes:
    """async wrapper for text-to-speech synthesis.
    
    returns: audio bytes (WAV format)
    """
    service = get_sarvam_service()
    return service.synthesize_text(
        text=text,
        language=language,
        speaker=(SPEAKER_ALIASES.get(speaker, speaker) if speaker else "anushka")
    )
