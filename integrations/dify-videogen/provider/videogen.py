import asyncio
from typing import Any

from dify_plugin import ToolProvider
from dify_plugin.errors.tool import ToolProviderCredentialValidationError

from mcp_client import request


class VideoGenProvider(ToolProvider):
    def _validate_credentials(self, credentials: dict[str, Any]) -> None:
        key = credentials.get("videogen_api_key")
        if not isinstance(key, str) or not key.strip():
            raise ToolProviderCredentialValidationError("Enter your VideoGen API key.")
        try:
            result = asyncio.run(request(key, "call", "get_me", {}))
            if result.get("isError"):
                raise ToolProviderCredentialValidationError("VideoGen rejected the account check.")
        except Exception:
            raise ToolProviderCredentialValidationError(
                "VideoGen account validation failed. Check your key, API access and connectivity."
            ) from None
