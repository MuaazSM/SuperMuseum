"""load environment-based settings for the application.

lowercase: this module centralizes environment variables and configuration choices.
"""
from pathlib import Path
from typing import Optional

try:
    from pydantic_settings import BaseSettings
    from pydantic import Field
except ImportError:
    from pydantic import BaseSettings, Field  # fallback for pydantic v1


class Settings(BaseSettings):
    """application settings loaded from environment or .env file."""

    env: str = Field(default="development")
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    sarvam_api_key: Optional[str] = Field(default=None, env="SARVAM_API_KEY")
    saavn_api_key: Optional[str] = Field(default=None, env="SAAVN_API_KEY")
    saavn_api_base: Optional[str] = Field(default="https://saavn.sumit.co/api", env="SAAVN_API_BASE")
    vectorstore: str = Field(default="chroma")  # chroma | qdrant
    redis_url: Optional[str] = Field(default=None, env="REDIS_URL")
    audio_temp_dir: str = Field(default=str(Path.cwd() / "tmp"))

    class Config:
        env_file = ".env"
        extra = "ignore"  # allow extra fields from .env without validation errors


settings = Settings()
