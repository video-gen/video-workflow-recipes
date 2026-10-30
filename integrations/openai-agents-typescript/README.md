# @videogen/openai-agents

Official [OpenAI Agents SDK](https://openai.github.io/openai-agents-js/) tools for the [VideoGen API](https://docs.videogen.io). Give any OpenAI Agents SDK agent the ability to turn a script into a finished narrated video, plus generate standalone images, video clips, voiceovers, sound effects, music, and talking-head avatars.

Every tool wraps the official [`@videogen/sdk`](https://www.npmjs.com/package/@videogen/sdk) and runs as the team that owns your API key.

## Install

```bash
npm install @videogen/openai-agents @openai/agents
```

`@openai/agents` is a peer dependency.

## Setup

Get an API key from [app.videogen.io/api](https://app.videogen.io/api) and set it as `VIDEOGEN_API_KEY`:

```bash
export VIDEOGEN_API_KEY="your_api_key"
```

## Usage

```typescript
import { Agent, run } from "@openai/agents";
import { createVideogenTools } from "@videogen/openai-agents";

const agent = new Agent({
  name: "Video Producer",
  instructions: "You produce short narrated videos with VideoGen when asked.",
  tools: createVideogenTools(),
});

const result = await run(
  agent,
  "Make a short narrated video explaining why staying hydrated matters.",
);

console.log(result.finalOutput);
```

By default each tool blocks until the workflow or tool execution finishes and returns the completed result.

## Options

```typescript
import { VideoGen } from "@videogen/sdk";
import { createVideogenTools } from "@videogen/openai-agents";

const tools = createVideogenTools({
  // Provide a pre-configured client, or pass apiKey / baseUrl, or rely on env.
  client: new VideoGen({ apiKey: process.env.VIDEOGEN_API_KEY }),

  // Return the run/execution id immediately instead of waiting.
  wait: false,

  // Only expose a subset of tools to the model.
  include: ["script_to_video", "generate_image", "text_to_speech"],
});
```

| Option | Default | Description |
| --- | --- | --- |
| `client` | (none) | A pre-configured `VideoGen` client. |
| `apiKey` | `VIDEOGEN_API_KEY` | API key used to build a client when `client` is omitted. |
| `baseUrl` | `VIDEOGEN_BASE_URL` or production | Override the API base URL. |
| `wait` | `true` | Block until the operation finishes and return the result. |
| `pollIntervalMs` | SDK default | Poll interval while waiting. |
| `timeoutMs` | SDK default | Maximum time to wait before giving up. |
| `include` | all tools | Restrict the returned tool set to these tool names. |

## Tools

End-to-end video workflows: `script_to_video`, `voiceover_to_video`, `slideshow_to_video`, `storyboard_to_video`, `list_workflow_runs`, `get_workflow_run`, `cancel_workflow_run`.

Media generation: `generate_image`, `generate_video_clip`, `text_to_speech`, `generate_sound_effect`, `generate_music`, `generate_avatar`, `vectorize_image`, `remove_image_background`, `remove_video_background`, `upscale_image`, `upscale_video`, `image_3d_effect`, `list_tool_executions`, `get_tool_execution`, `cancel_tool_execution`.

Projects: `list_projects`, `get_project`, `export_project`, `remix_project`, `list_project_remix_actions`.

Files: `upload_file`, `get_file`, `list_files`.

Resources and account: `list_tts_voices`, `list_languages`, `get_me`.

## Documentation

- [Use with AI agents](https://docs.videogen.io/use-with-ai-agents)
- [MCP server](https://docs.videogen.io/libraries/mcp)
- [API reference](https://docs.videogen.io)

## License

MIT

## Account and permissions

Generation and editing use VideoGen account credits. Obtain user approval before credit-consuming calls. Use `include` to expose only the tools your agent needs. API keys belong in server-side environment variables, never shared prompts or client-side bundles. Upload tools send the selected local file to VideoGen.

[VideoGen](https://videogen.io/) · [MCP setup](https://videogen.io/videogen-mcp) · [Source](https://github.com/video-gen/video-workflow-recipes/tree/main/integrations/openai-agents-typescript)
