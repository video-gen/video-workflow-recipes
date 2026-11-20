# VideoGen for Dify

Create editable videos, product ads and media using [VideoGen](https://videogen.io/videogen-mcp) from Dify agents and workflows. This plugin wraps the official hosted MCP using the official Python SDK.

Configure your own API key from [VideoGen account settings](https://app.videogen.io/api) in the provider's secret credential field. Account validation calls the read-only `get_me` tool. No shared credential is shipped.

The plugin's **VideoGen MCP** tool supports two actions:

1. **discover** with an empty tool name returns current tool names, descriptions and annotations. Supply an exact tool name to retrieve its complete input/output schema.
2. **call** forwards a JSON argument object to that tool. Retain asynchronous run identifiers, check the run's status and use export tools to obtain the final download link.

Ask the user to approve the requested generation, editing or deletion operation as appropriate before invoking it. Generation and exports may consume [account credits](https://videogen.io/pricing). Existing VideoGen account/team authorization and billing checks apply. Writes are not automatically retried.

Example request: “Prepare a short product ad from my product details. Show me the storyboard before generating.”

## Network and privacy

Requests go to `https://mcp.videogen.io/mcp`. The plugin sends only the configured key and requested tool arguments, returns results to Dify, and does not log credentials, read local media, download exports or proxy large media bodies. The `vg_client=dify` parameter identifies this integration without identifying a user. Review [privacy.md](privacy.md), [VideoGen privacy](https://videogen.io/privacy-policy), [terms](https://videogen.io/terms-of-service) and [MCP docs](https://docs.videogen.io/libraries/mcp).

## Development and status

Use Python 3.12 and the pinned dependencies in `requirements.txt`. Run `python -m main` using the official Dify plugin development setup; package with the official Dify CLI. This source is a publication candidate. Dify runtime validation, credential isolation and an end-to-end generation still need to pass before a marketplace submission. No Dify marketplace publication is claimed.
