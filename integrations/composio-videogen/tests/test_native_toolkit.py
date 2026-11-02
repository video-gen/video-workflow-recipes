"""Exercise real Composio tool definitions against an in-memory HTTP transport."""
import json

import httpx
from videogen import VideoGen

from composio_videogen import create_videogen_toolkit


def invoke(toolkit, name, body):
    tool = next(tool for tool in toolkit._tools if tool.name == name)
    return tool.execute(tool.input_params.model_validate(body), None)


def test_native_workflow_forwards_body_and_polls_download():
    requests = []

    def handler(request):
        requests.append(request)
        if request.method == "POST":
            return httpx.Response(200, json={"workflowRunId": "synthetic-run"})
        return httpx.Response(200, json={"status": "succeeded", "downloadUrl": "https://example.invalid/product.mp4"})

    with httpx.Client(transport=httpx.MockTransport(handler)) as http:
        client = VideoGen(api_key="synthetic-only", base_url="https://example.invalid", http_client=http)
        toolkit = create_videogen_toolkit(client=client, include=["storyboard_to_video"])
        result = invoke(toolkit, "storyboard_to_video", {
            "scenes": [{"prompt": "Product close-up"}, {"prompt": "Product in use"}],
            "quality": "HIGH", "auto_export": True,
            "remix_actions": [{"type": "ENABLE_CAPTIONS"}, {"type": "CONVERT_IMAGES_TO_VIDEOS"}],
        })
    assert result["download_url"] == "https://example.invalid/product.mp4"
    assert requests[0].url.path == "/v1/workflows/storyboard-to-video"
    body = json.loads(requests[0].content)
    assert body["quality"] == "HIGH" and body["autoExport"] is True
    assert len(body["remixActions"]) == 2
    assert requests[1].url.path == "/v1/workflows/runs/synthetic-run"


def test_native_export_polls_download():
    requests = []

    def handler(request):
        requests.append(request)
        if request.method == "POST":
            return httpx.Response(200, json={"exportId": "synthetic-export"})
        return httpx.Response(200, json={"status": "succeeded", "downloadUrl": "https://example.invalid/export.mp4"})

    with httpx.Client(transport=httpx.MockTransport(handler)) as http:
        client = VideoGen(api_key="synthetic-only", base_url="https://example.invalid", http_client=http)
        toolkit = create_videogen_toolkit(client=client, include=["export_project"])
        result = invoke(toolkit, "export_project", {"project_id": "synthetic-project", "quality": "HIGH"})
    assert result["download_url"] == "https://example.invalid/export.mp4"
    assert json.loads(requests[0].content) == {"quality": "HIGH"}
    assert "synthetic-project" in requests[1].url.path
    assert "synthetic-export" in requests[1].url.path
