"""Tests for the VideoGen Composio custom toolkit.

Offline tests (default) verify the package imports and that the full VideoGen
tool surface is registered with the expected names and honors the ``include``
filter — no network, no credentials. The ``integration`` test hits the live
VideoGen API with a read-only ``get_me`` (spends no credits) using the key in
``VIDEOGEN_API_KEY`` and is run separately by the test-runner Cloud Run Job.
"""

import os

import pytest

from composio_videogen.tools import GENERATED_TOOL_NAMES as EXPECTED_TOOL_NAMES

# A throwaway key. Constructing the client and registering tools never touches
# the network, so any non-empty string works for the offline tests.
DUMMY_API_KEY = "vg_offline_test_key"


class _RecordingToolkit:
    """Minimal stand-in for a Composio toolkit that records registered tools."""

    def __init__(self) -> None:
        self.registered: dict[str, object] = {}

    def tool(self, slug: str, name: str, description: str):  # noqa: ARG002
        def decorator(func):
            self.registered[name] = func
            return func

        return decorator


def _register(include=None) -> _RecordingToolkit:
    from composio_videogen import Controls, register_videogen_tools, resolve_client

    toolkit = _RecordingToolkit()
    client = resolve_client(api_key=DUMMY_API_KEY)
    register_videogen_tools(toolkit, client, Controls(), include=include)
    return toolkit


def test_package_imports_and_public_api():
    import composio_videogen

    assert isinstance(composio_videogen.__version__, str)
    for symbol in ("create_videogen_toolkit", "register_videogen_tools", "resolve_client", "Controls"):
        assert hasattr(composio_videogen, symbol), f"missing public symbol {symbol}"


def test_tool_surface_matches_canonical_set():
    toolkit = _register()
    assert set(toolkit.registered.keys()) == EXPECTED_TOOL_NAMES


def test_include_filter_restricts_tools():
    toolkit = _register(include=["get_me", "list_files"])
    assert set(toolkit.registered.keys()) == {"get_me", "list_files"}


def test_create_toolkit_constructs_against_composio():
    from composio_videogen import create_videogen_toolkit

    toolkit = create_videogen_toolkit(api_key=DUMMY_API_KEY)
    assert toolkit is not None


@pytest.mark.integration
def test_live_get_me():
    api_key = os.environ.get("VIDEOGEN_API_KEY")
    if not api_key:
        pytest.skip("VIDEOGEN_API_KEY not set; skipping live integration test")

    from composio_videogen import Controls, register_videogen_tools, resolve_client

    client = resolve_client(api_key=api_key, base_url=os.environ.get("VIDEOGEN_BASE_URL"))

    # Read-only account call over the live API (spends no credits).
    me = client.account.get_me()
    assert me is not None

    # The full tool surface must also build against a live client.
    toolkit = _RecordingToolkit()
    register_videogen_tools(toolkit, client, Controls())
    assert set(toolkit.registered.keys()) == EXPECTED_TOOL_NAMES
