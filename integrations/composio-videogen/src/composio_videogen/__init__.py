"""Official Composio custom toolkit for the VideoGen API."""

from importlib.metadata import PackageNotFoundError, version

from .client import resolve_client
from .operations import Controls
from .toolkit import create_videogen_toolkit
from .tools import register_videogen_tools

__all__ = [
    "Controls",
    "create_videogen_toolkit",
    "register_videogen_tools",
    "resolve_client",
]

try:
    __version__ = version("composio-videogen")
except PackageNotFoundError:
    __version__ = "0.0.0"
