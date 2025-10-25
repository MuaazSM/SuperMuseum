"""shim to preserve legacy import path `exception`.

lowercase: re-exports ProductAssistantException from conversational_bot.exception.custom_exception.
"""
from conversational_bot.exception.custom_exception import ProductAssistantException  # type: ignore

__all__ = ["ProductAssistantException"]
