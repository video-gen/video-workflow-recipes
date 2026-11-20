import httpx2
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client
from mcp.types import PaginatedRequestParams


async def request(api_key: str, action: str, tool_name: str, arguments: dict) -> dict:
    if not api_key.strip():
        raise ValueError("Configure your own VideoGen API key first.")
    async with httpx2.AsyncClient(
        headers={"Authorization": f"Bearer {api_key.strip()}"},
        timeout=httpx2.Timeout(60.0, read=120.0),
        follow_redirects=False,
    ) as client:
        async with streamable_http_client(
            "https://mcp.videogen.io/mcp?vg_client=dify", http_client=client
        ) as streams:
            async with ClientSession(*streams, read_timeout_seconds=120) as session:
                await session.initialize()
                if action == "call":
                    result = await session.call_tool(tool_name, arguments)
                    return result.model_dump(mode="json", by_alias=True, exclude_none=True)
                if action != "discover":
                    raise ValueError("Action must be discover or call.")
                tools = []
                cursor = None
                visited = set()
                while True:
                    page = await session.list_tools(
                        params=PaginatedRequestParams(cursor=cursor) if cursor else None
                    )
                    for tool in page.tools:
                        if tool_name and tool.name == tool_name:
                            return tool.model_dump(mode="json", by_alias=True, exclude_none=True)
                        tools.append(tool.model_dump(
                            mode="json", by_alias=True, exclude_none=True,
                            include={"name", "title", "description", "annotations"},
                        ))
                    cursor = page.nextCursor
                    if not cursor:
                        break
                    if cursor in visited:
                        raise RuntimeError("Repeated MCP tools cursor.")
                    visited.add(cursor)
                if tool_name:
                    raise ValueError("Tool not found. Discover the current tool inventory first.")
                return {"website": "https://videogen.io/videogen-mcp", "tools": tools}
