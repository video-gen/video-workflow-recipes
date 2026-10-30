"""Tests for the VideoGen OpenAI Agents SDK tools.

Offline tests (default) verify the package imports and that the full VideoGen
tool surface is built with the expected names and honors the ``include`` filter
— no network, no credentials. The ``integration`` test hits the live VideoGen
API with a read-only ``get_me`` (spends no credits) using ``VIDEOGEN_API_KEY``
and is run separately by the test-runner Cloud Run Job.
"""

import os

import pytest

from openai_agents_videogen.tools import GENERATED_TOOL_NAMES as EXPECTED_TOOL_NAMES

DUMMY_API_KEY = "vg_offline_test_key"


def _tool_names(tools) -> set:
    return {tool.name for tool in tools}


def test_package_imports_and_public_api():
    import openai_agents_videogen

    assert isinstance(openai_agents_videogen.__version__, str)
    for symbol in ("create_videogen_tools", "resolve_client", "Controls"):
        assert hasattr(openai_agents_videogen, symbol), f"missing public symbol {symbol}"


def test_tool_surface_matches_canonical_set():
    from openai_agents_videogen import create_videogen_tools

    tools = create_videogen_tools(api_key=DUMMY_API_KEY)
    assert _tool_names(tools) == EXPECTED_TOOL_NAMES


def test_include_filter_restricts_tools():
    from openai_agents_videogen import create_videogen_tools

    tools = create_videogen_tools(api_key=DUMMY_API_KEY, include=["get_me", "list_files"])
    assert _tool_names(tools) == {"get_me", "list_files"}


@pytest.mark.integration
def test_live_get_me():
    api_key = os.environ.get("VIDEOGEN_API_KEY")
    if not api_key:
        pytest.skip("VIDEOGEN_API_KEY not set; skipping live integration test")

    from openai_agents_videogen import create_videogen_tools, resolve_client

    client = resolve_client(api_key=api_key, base_url=os.environ.get("VIDEOGEN_BASE_URL"))

    me = client.account.get_me()
    assert me is not None

    tools = create_videogen_tools(client=client)
    assert _tool_names(tools) == EXPECTED_TOOL_NAMES
