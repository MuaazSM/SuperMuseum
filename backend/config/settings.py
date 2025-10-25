"""load environment-based settings for the application.

lowercase: this module centralizes environment variables and configuration choices.
"""
from pathlib import Path
from pydantic import BaseSettings, Field
from typing import Optional


class Settings(BaseSettings):
    """application settings loaded from environment or .env file."""

    env: str = Field(default="development")
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    sarvam_api_key: Optional[str] = Field(default=None, env="SARVAM_API_KEY")
    saavn_api_key: Optional[str] = Field(default=None, env="SAAVN_API_KEY")
    vectorstore: str = Field(default="chroma")  # chroma | qdrant
    redis_url: Optional[str] = Field(default=None, env="REDIS_URL")
    audio_temp_dir: str = Field(default=str(Path.cwd() / "tmp"))

    class Config:
        env_file = ".env"


settings = Settings()
