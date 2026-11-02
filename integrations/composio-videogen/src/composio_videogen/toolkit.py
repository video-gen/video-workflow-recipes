"""Factory for the VideoGen Composio custom toolkit."""

from __future__ import annotations

from typing import Any, Iterable, Optional

from videogen import VideoGen

from .client import resolve_client
from .operations import Controls
from .tools import register_videogen_tools

DEFAULT_TOOLKIT_SLUG = "VIDEOGEN"
DEFAULT_TOOLKIT_NAME = "VideoGen"
DEFAULT_TOOLKIT_DESCRIPTION = (
    "Generate videos, images, voiceovers, sound effects, music, and talking-head "
    "avatars with the VideoGen API."
)


def _new_toolkit(
    composio: Optional[Any],
    *,
    slug: str,
    name: str,
    description: str,
    preload: Optional[bool],
) -> Any:
    """Construct an empty Composio custom toolkit.

    Uses ``composio.experimental.Toolkit`` when a client is provided, otherwise
    falls back to the toolkit class directly so the package is usable without
    first constructing a ``Composio`` client.
    """
    if composio is not None:
        return composio.experimental.Toolkit(
            slug=slug, name=name, description=description, preload=preload
        )

    from composio.core.models.custom_tool import ExperimentalToolkit

    return ExperimentalToolkit(slug=slug, name=name, description=description, preload=preload)


def create_videogen_toolkit(
    composio: Optional[Any] = None,
    *,
    client: Optional[VideoGen] = None,
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,
    wait: bool = True,
    poll_interval_ms: Optional[int] = None,
    timeout_ms: Optional[int] = None,
    include: Optional[Iterable[str]] = None,
    slug: str = DEFAULT_TOOLKIT_SLUG,
    name: str = DEFAULT_TOOLKIT_NAME,
    description: str = DEFAULT_TOOLKIT_DESCRIPTION,
    preload: Optional[bool] = None,
) -> Any:
    """Build a Composio custom toolkit exposing the full VideoGen tool set.

    Pass the returned toolkit to ``composio.create(experimental={"custom_toolkits": [toolkit]})``.
    ``session.tools()`` then includes every VideoGen tool alongside your other Composio tools.

    Args:
        composio: A ``Composio`` client. When provided, the toolkit is created via
            ``composio.experimental.Toolkit``; otherwise the toolkit class is used directly.
        client: A pre-configured ``VideoGen`` client. When omitted, one is built from
            ``api_key`` / ``base_url`` or the ``VIDEOGEN_API_KEY`` environment variable.
        wait: When True (default), tools block until the workflow run or tool execution
            finishes and return the completed result. Set False to return immediately
            with the run/execution id for the caller to poll.
        poll_interval_ms: Poll interval while waiting. Defaults to the SDK's default.
        timeout_ms: Maximum time to wait before giving up. Defaults to the SDK's default.
        include: Restrict the registered tools to these tool names. Defaults to all tools.
        slug: Toolkit slug (final tool slugs are ``LOCAL_<slug>_<TOOL>``).
        name: Human-readable toolkit name.
        description: Toolkit description shown to the agent.
        preload: When True, expose the toolkit's tools directly instead of via search.
    """
    resolved_client = resolve_client(client, api_key=api_key, base_url=base_url)
    controls = Controls(wait=wait, poll_interval_ms=poll_interval_ms, timeout_ms=timeout_ms)

    toolkit = _new_toolkit(
        composio, slug=slug, name=name, description=description, preload=preload
    )
    register_videogen_tools(toolkit, resolved_client, controls, include=include)

    return toolkit
