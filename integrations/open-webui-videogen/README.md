# VideoGen for Open WebUI

Create editable videos and product ads using [VideoGen](https://videogen.io/videogen-mcp) from an Open WebUI chat. This Python Tool connects to the existing hosted MCP; it discovers current schemas instead of embedding a stale inventory.

## Install and connect

Import `videogen.py` as a Tool in your Open WebUI installation. The tool declares the official `mcp==2.3.0` dependency. Enable it for your chat, then set **VIDEOGEN_API_KEY** in your own User Valves using a key from [VideoGen](https://app.videogen.io/api). The key is per user and is not a model-visible argument. A password input masks it; storage security is managed by your Open WebUI administrator.

The model first lists VideoGen tools, requests the exact schema for the selected tool, and calls it with a JSON argument object. Outputs retain MCP content, structured output and error flags. Generation starts return run identifiers; follow the discovered status/export tools to obtain the completed project and download link.

Try: “Create a short vertical product ad from these product details. Show me the storyboard before generating.”

Generation and exports can consume your [account credits](https://videogen.io/pricing). Follow the chat host's confirmation controls for writes and paid actions. This wrapper does not add per-key permissions or replace existing VideoGen resource and billing checks. It does not automatically retry writes.

## Data and network

The wrapper connects only to `https://mcp.videogen.io/mcp`, using your own API key. It does not log credentials, fetch arbitrary URLs, read local files, download media or proxy video bytes. Prompts, selected resource identifiers and operation arguments reach VideoGen when you call a tool. Tool results return to the chat. See [privacy](https://videogen.io/privacy-policy), [terms](https://videogen.io/terms-of-service) and [MCP documentation](https://docs.videogen.io/libraries/mcp).

## Validation and publication

Prepared for Community Library submission. Static SDK imports and syntax are checked locally. A real Open WebUI installation, user-key isolation and end-to-end generation still require host validation before a compatibility claim or public submission. No community listing has been published yet.
