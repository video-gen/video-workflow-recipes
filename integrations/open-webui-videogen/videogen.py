"""
title: VideoGen
author: VideoGen
author_url: https://videogen.io/videogen-mcp
description: Create editable videos and product ads through VideoGen's hosted MCP.
version: 0.1.0
license: MIT
requirements: mcp==2.3.0
"""

import json
from contextlib import asynccontextmanager

import httpx2
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client
from mcp.types import PaginatedRequestParams
from pydantic import BaseModel, Field


@asynccontextmanager
async def _session(api_key: str):
    async with httpx2.AsyncClient(
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=httpx2.Timeout(60.0, read=120.0),
        follow_redirects=False,
    ) as client:
        async with streamable_http_client(
            "https://mcp.videogen.io/mcp?vg_client=openwebui",
            http_client=client,
        ) as streams:
            async with ClientSession(*streams, read_timeout_seconds=120) as session:
                await session.initialize()
                yield session


class Tools:
    class UserValves(BaseModel):
        VIDEOGEN_API_KEY: str = Field(
            default="",
            description="Your own VideoGen API key from https://app.videogen.io/api",
            json_schema_extra={"input": {"type": "password"}},
        )

    def __init__(self):
        self.citation = False

    def _api_key(self, user: dict | None) -> str:
        valves = (user or {}).get("valves")
        if isinstance(valves, dict):
            key = self.UserValves.model_validate(valves).VIDEOGEN_API_KEY
        else:
            key = getattr(valves, "VIDEOGEN_API_KEY", "")
        if not isinstance(key, str) or not key.strip():
            raise ValueError("Set your VideoGen API key in this tool's User Valves.")
        return key.strip()

    async def list_videogen_tools(
        self, tool_name: str = "", __user__: dict | None = None
    ) -> dict:
        """Discover current VideoGen tools, then retrieve a selected tool's schema.

        :param tool_name: Empty for tool names/descriptions/annotations; exact tool name for its complete input/output schemas. Discover before calling.
        """
        key = self._api_key(__user__)
        try:
            async with _session(key) as session:
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
                        tools.append(
                            tool.model_dump(
                                mode="json", by_alias=True, exclude_none=True,
                                include={"name", "title", "description", "annotations"},
                            )
                        )
                    cursor = page.nextCursor
                    if not cursor:
                        break
                    if cursor in visited:
                        raise RuntimeError("VideoGen returned a repeated tools cursor.")
                    visited.add(cursor)
                if tool_name:
                    raise ValueError("Tool not found. Discover current VideoGen tool names first.")
                return {"website": "https://videogen.io/videogen-mcp", "tools": tools}
        except Exception:
            raise RuntimeError(
                "VideoGen tool discovery failed. Check your key, account access and server connectivity."
            ) from None

    async def call_videogen_tool(
        self, tool_name: str, arguments_json: str, __user__: dict | None = None
    ) -> dict:
        """Call a discovered VideoGen MCP tool with its current input schema.

        Follow the user's requested scope and budget. Generation and exports can
        consume credits; edits and deletions change account resources. Obtain the
        user's approval when required by the host before these actions. Treat MCP
        isError as failure. For asynchronous starts, retain the returned run id and
        check status; a start acknowledgement is not a finished video. Never retry
        a write automatically after a timeout. Return project/download links.

        :param tool_name: Exact name returned by list_videogen_tools.
        :param arguments_json: JSON object conforming to that tool's discovered inputSchema. Never put credentials here.
        """
        key = self._api_key(__user__)
        arguments = json.loads(arguments_json)
        if not isinstance(arguments, dict):
            raise ValueError("arguments_json must contain a JSON object.")
        try:
            async with _session(key) as session:
                result = await session.call_tool(tool_name, arguments)
                return result.model_dump(mode="json", by_alias=True, exclude_none=True)
        except Exception:
            raise RuntimeError(
                "VideoGen tool call failed. Check account/run status before retrying any generation or edit."
            ) from None
