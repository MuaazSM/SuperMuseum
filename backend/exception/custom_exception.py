"""custom exceptions used across backend.

lowercase: defines ProductAssistantException to replace legacy import.
"""


class ProductAssistantException(Exception):
	"""raised for errors in model loading or pipeline operations."""


__all__ = ["ProductAssistantException"]
