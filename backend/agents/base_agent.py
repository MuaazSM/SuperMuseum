"""abstract base agent class and helpers."""
from typing import Any, Dict
from abc import ABC, abstractmethod


class BaseAgent(ABC):
    """abstract base class for all agents.

    implementers must provide an async `run` method that accepts a state dict
    and returns an updated state or result.
    """

    @abstractmethod
    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """run the agent logic and return updated state."""
        raise NotImplementedError()
