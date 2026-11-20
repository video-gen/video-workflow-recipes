import asyncio
import json
from collections.abc import Generator
from typing import Any

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage

from mcp_client import request


class VideoGenTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage, None, None]:
        key = self.runtime.credentials.get("videogen_api_key")
        if not isinstance(key, str) or not key.strip():
            raise ValueError("Configure your VideoGen API key in the provider credentials.")
        action = tool_parameters.get("action", "discover")
        tool_name = tool_parameters.get("tool_name", "") or ""
        raw_arguments = tool_parameters.get("arguments_json", "{}") or "{}"
        if action not in ("discover", "call"):
            raise ValueError("Action must be discover or call.")
        if not isinstance(tool_name, str) or not isinstance(raw_arguments, str):
            raise ValueError("Tool name and arguments_json must be strings.")
        arguments = json.loads(raw_arguments)
        if not isinstance(arguments, dict):
            raise ValueError("arguments_json must contain a JSON object.")
        if action == "call" and not tool_name:
            raise ValueError("Choose a discovered VideoGen tool name before calling.")
        try:
            result = asyncio.run(request(key, action, tool_name, arguments))
        except Exception:
            raise RuntimeError(
                "VideoGen MCP request failed. Check account/run status before retrying a write."
            ) from None
        # Preserve MCP error flags; a failed execution must remain a failed Dify node.
        if result.get("isError"):
            yield self.create_json_message(result)
            raise RuntimeError("VideoGen reported a tool execution error. Review the returned error details.")
        yield self.create_json_message(result)
