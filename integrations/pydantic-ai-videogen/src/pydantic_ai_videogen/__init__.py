"""Official Pydantic AI tools for the VideoGen API."""

from importlib.metadata import PackageNotFoundError, version

from .client import resolve_client
from .factory import create_videogen_tools
from .operations import Controls

__all__ = [
    "Controls",
    "create_videogen_tools",
    "resolve_client",
]

try:
    __version__ = version("pydantic-ai-videogen")
except PackageNotFoundError:
    __version__ = "0.0.0"
