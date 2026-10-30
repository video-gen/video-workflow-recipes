"""Factory for the VideoGen OpenAI Agents SDK integration."""

from __future__ import annotations

from typing import Iterable, List, Optional

from agents import FunctionTool
from videogen import VideoGen

from .client import resolve_client
from .operations import Controls
from .tools import build_videogen_tools


def create_videogen_tools(
    client: Optional[VideoGen] = None,
    *,
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,
    wait: bool = True,
    poll_interval_ms: Optional[int] = None,
    timeout_ms: Optional[int] = None,
    include: Optional[Iterable[str]] = None,
) -> List[FunctionTool]:
    """Build VideoGen tools in OpenAI Agents SDK format, ready to pass to an ``Agent``.

    Args:
        client: A pre-configured ``VideoGen`` client. When omitted, one is built
            from ``api_key`` / ``base_url`` or the ``VIDEOGEN_API_KEY`` environment variable.
        wait: When True (default), tools block until the workflow run or tool execution
            finishes and return the completed result. Set False to return immediately
            with the run/execution id for the caller to poll.
        poll_interval_ms: Poll interval while waiting. Defaults to the SDK's default.
        timeout_ms: Maximum time to wait before giving up. Defaults to the SDK's default.
        include: Restrict the returned tool set to these tool names. Defaults to all tools.
    """
    resolved_client = resolve_client(client, api_key=api_key, base_url=base_url)
    controls = Controls(wait=wait, poll_interval_ms=poll_interval_ms, timeout_ms=timeout_ms)

    tools = build_videogen_tools(resolved_client, controls)

    if include is None:
        return tools

    included = set(include)
    return [tool for tool in tools if tool.name in included]
