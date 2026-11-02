# composio-videogen

Official [Composio](https://composio.dev) custom toolkit for the [VideoGen API](https://docs.videogen.io). Give any Composio agent the ability to turn a script into a finished narrated video, plus generate standalone images, video clips, voiceovers, sound effects, music, and talking-head avatars.

Every tool wraps the official [`videogen`](https://pypi.org/project/videogen/) SDK and runs as the team that owns your API key.

## Install

Requires Python 3.11–3.15 and Composio 0.30.x.

```bash
pip install composio-videogen
```

## Setup

Get an API key from [app.videogen.io/api](https://app.videogen.io/api) and set it as `VIDEOGEN_API_KEY`:

```bash
export VIDEOGEN_API_KEY="your_api_key"
```

## Usage

`create_videogen_toolkit()` returns a Composio custom toolkit. Pass it to a session via `experimental={"custom_toolkits": [...]}`, and `session.tools()` returns your VideoGen tools alongside any other Composio tools.

```python
from composio import Composio
from composio_videogen import create_videogen_toolkit

composio = Composio()
videogen = create_videogen_toolkit(composio, include=["get_me", "list_files"])

session = composio.create(
    user_id="default",
    experimental={"custom_toolkits": [videogen]},
)

tools = session.tools()
```

By default each tool blocks until the workflow or tool execution finishes and returns the completed result.

## Options

```python
from videogen import VideoGen
from composio_videogen import create_videogen_toolkit

videogen = create_videogen_toolkit(
    composio,

    # Provide a pre-configured client, or pass api_key / base_url, or rely on env.
    client=VideoGen(api_key="your_api_key"),

    # Return the run/execution id immediately instead of waiting.
    wait=False,

    # Only register a subset of tools.
    include=["script_to_video", "generate_image", "text_to_speech"],
)
```

| Option | Default | Description |
| --- | --- | --- |
| `composio` | — | A `Composio` client. When provided, the toolkit is created via `composio.experimental.Toolkit`; otherwise the toolkit class is used directly. |
| `client` | — | A pre-configured `VideoGen` client. |
| `api_key` | `VIDEOGEN_API_KEY` | API key used to build a client when `client` is omitted. |
| `base_url` | `VIDEOGEN_BASE_URL` or production | Override the API base URL. |
| `wait` | `True` | Block until the operation finishes and return the result. |
| `poll_interval_ms` | SDK default | Poll interval while waiting. |
| `timeout_ms` | SDK default | Maximum time to wait before giving up. |
| `include` | all tools | Restrict the registered tools to these tool names. |
| `slug` | `VIDEOGEN` | Toolkit slug (final tool slugs are `LOCAL_<slug>_<TOOL>`). |
| `name` | `VideoGen` | Human-readable toolkit name. |
| `description` | VideoGen summary | Toolkit description shown to the agent. |
| `preload` | `None` | When `True`, expose the toolkit's tools directly instead of via search. |

## Tools

<!-- BEGIN GENERATED PYTHON AGENT TOOLS -->
- Workflows: `cancel_workflow_run`, `get_workflow_run`, `list_workflow_runs`, `prompt_to_video_clip`, `script_to_video`, `slideshow_to_video`, `storyboard_to_video`, `video_to_video`, `voiceover_to_video`.
- Media generation: `cancel_tool_execution`, `generate_avatar`, `generate_image`, `generate_motion_graphic`, `generate_music`, `generate_sound_effect`, `generate_video_clip`, `get_tool_execution`, `image_3d_effect`, `list_tool_executions`, `remove_image_background`, `remove_video_background`, `text_to_speech`, `upscale_image`, `upscale_video`, `vectorize_image`.
- Projects: `export_project`, `get_project`, `list_project_remix_actions`, `list_projects`, `remix_project`.
- Files: `get_file`, `list_files`, `upload_file`.
- Resources and account: `get_me`, `list_languages`, `list_tts_voices`.

Avatar generation and supported video workflows use reusable actor entities. Pass `actor_entity_id` and set `avatar_quality` to `LOW`, `STANDARD`, `HIGH`, or `MAX`. Narrator changes are passed in `remix_actions` as `CHANGE_NARRATOR` action dictionaries.
<!-- END GENERATED PYTHON AGENT TOOLS -->

## Documentation

- [Use with AI agents](https://docs.videogen.io/use-with-ai-agents)
- [MCP server](https://docs.videogen.io/libraries/mcp)
- [API reference](https://docs.videogen.io)

## License

MIT

## Account and permissions

Generation and editing use VideoGen credits. Obtain user approval before credit-consuming operations and expose only the tools the agent needs with `include`. The example above exposes only account and file-list tools. API keys belong in server-side environment variables. Upload tools send the selected local file to VideoGen; Composio receives tool definitions when you attach the toolkit to a session.

Tested with Composio 0.30.0 and VideoGen SDK 2.5.3 using offline discovery and in-memory HTTP routing/polling checks. A real hosted Composio session and paid media generation are not part of these checks.

[VideoGen](https://videogen.io/) · [MCP setup](https://videogen.io/videogen-mcp) · [Source](https://github.com/video-gen/video-workflow-recipes/tree/main/integrations/composio-videogen)
