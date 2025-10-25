"""load YAML configuration regardless of working directory.

lowercase: resolves config path via explicit arg, env var, or default path.
"""
from pathlib import Path
import os
from typing import Optional
import yaml


def _project_root() -> Path:
	# utils/config_loader.py -> parents[1] == backend root
	return Path(__file__).resolve().parents[1]


def load_config(config_path: Optional[str] = None) -> dict:
	"""load YAML config with robust path resolution.

	priority: explicit arg > CONFIG_PATH env > <project_root>/config/config.yaml
	"""
	env_path = os.getenv("CONFIG_PATH")
	if config_path is None:
		# default to the new config location
		config_path = env_path or str(_project_root() / "config" / "config.yaml")

	path = Path(config_path)
	if not path.is_absolute():
		path = _project_root() / path

	if not path.exists():
		raise FileNotFoundError(f"config file not found: {path}")

	with open(path, "r", encoding="utf-8") as f:
		return yaml.safe_load(f) or {}


__all__ = ["load_config"]
