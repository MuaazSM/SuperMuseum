"""model loader for embeddings and llm based on environment config.

lowercase: this reimplements the legacy ModelLoader with simpler logging and
compatibility for google genai and groq providers.
"""
from __future__ import annotations

import os
import json
import asyncio
import logging
from typing import Any

from utils.config_loader import load_config

logger = logging.getLogger(__name__)


class ProductAssistantException(Exception):
    """custom exception for model loading failures."""


class ApiKeyManager:
    REQUIRED_KEYS = ["GROQ_API_KEY", "GOOGLE_API_KEY"]

    def __init__(self) -> None:
        self.api_keys: dict[str, str] = {}
        raw = os.getenv("API_KEYS")

        if raw:
            try:
                parsed = json.loads(raw)
                if not isinstance(parsed, dict):
                    raise ValueError("API_KEYS is not a valid JSON object")
                self.api_keys = {k: str(v) for k, v in parsed.items()}
                logger.info("loaded API_KEYS from env secret")
            except Exception as e:  # pragma: no cover - best-effort parsing
                logger.warning("failed to parse API_KEYS as JSON: %s", e)

        for key in self.REQUIRED_KEYS:
            if key not in self.api_keys and os.getenv(key):
                self.api_keys[key] = str(os.getenv(key))

        missing = [k for k in self.REQUIRED_KEYS if not self.api_keys.get(k)]
        if missing:
            # in practice we only require the provider we use; log warning, not error
            logger.info("missing some api keys; ensure provider you use is configured: %s", missing)

    def get(self, key: str) -> str:
        val = self.api_keys.get(key) or os.getenv(key)
        if not val:
            raise KeyError(f"API key for {key} is missing")
        return val


class ModelLoader:
    """load embedding models and llms based on YAML config and env."""

    def __init__(self) -> None:
        from dotenv import load_dotenv

        if os.getenv("ENV", "local").lower() != "production":
            load_dotenv()
            logger.info("running in LOCAL mode: .env loaded")
        else:
            logger.info("running in PRODUCTION mode")

        self.api_key_mgr = ApiKeyManager()
        self.config = load_config()
        logger.info("yaml config loaded: %s", list(self.config.keys()))

    def load_embeddings(self):
        """load embedding model (google text-embedding-004)."""
        try:
            model_name = self.config["embedding_model"]["model_name"]
            logger.info("loading embedding model: %s", model_name)

            # ensure event loop exists for grpc aio when used
            try:
                asyncio.get_running_loop()
            except RuntimeError:
                asyncio.set_event_loop(asyncio.new_event_loop())

            from langchain_google_genai import GoogleGenerativeAIEmbeddings

            return GoogleGenerativeAIEmbeddings(
                model=model_name,
                google_api_key=self.api_key_mgr.get("GOOGLE_API_KEY"),
            )
        except Exception as e:  # pragma: no cover - external deps
            logger.error("failed to load embedding model: %s", e)
            raise ProductAssistantException("failed to load embedding model") from e

    def load_llm(self):
        """load configured LLM provider (google genai or groq)."""
        llm_block = self.config["llm"]
        provider_key = os.getenv("LLM_PROVIDER", "google")
        if provider_key not in llm_block:
            raise ValueError(f"LLM provider '{provider_key}' not found in config")

        llm_config = llm_block[provider_key]
        provider = llm_config.get("provider")
        model_name = llm_config.get("model_name")
        temperature = llm_config.get("temperature", 0.2)
        max_tokens = llm_config.get("max_output_tokens", 2048)

        logger.info("loading LLM: provider=%s model=%s", provider, model_name)

        if provider == "google":
            from langchain_google_genai import ChatGoogleGenerativeAI

            return ChatGoogleGenerativeAI(
                model=model_name,
                google_api_key=self.api_key_mgr.get("GOOGLE_API_KEY"),
                temperature=temperature,
                max_output_tokens=max_tokens,
            )
        elif provider == "groq":
            from langchain_groq import ChatGroq

            return ChatGroq(
                model=model_name,
                api_key=self.api_key_mgr.get("GROQ_API_KEY"),
                temperature=temperature,
            )
        else:
            raise ValueError(f"unsupported LLM provider: {provider}")
