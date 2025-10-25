"""lightweight logger factory to avoid legacy dependency."""
import logging


def get_logger(name: str = __name__):
	logger = logging.getLogger(name)
	if not logger.handlers:
		handler = logging.StreamHandler()
		formatter = logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")
		handler.setFormatter(formatter)
		logger.addHandler(handler)
		logger.setLevel(logging.INFO)
	return logger


# provide a global logger compatible name
GLOBAL_LOGGER = get_logger("logger")

__all__ = ["GLOBAL_LOGGER", "get_logger"]
