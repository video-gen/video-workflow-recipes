# @videogen/ai-tool

Official [Vercel AI SDK](https://ai-sdk.dev) tools for the [VideoGen API](https://docs.videogen.io). Give any AI SDK agent the ability to turn a script into a finished narrated video, plus generate standalone images, video clips, voiceovers, sound effects, music, and talking-head avatars.

Every tool wraps the official [`@videogen/sdk`](https://www.npmjs.com/package/@videogen/sdk) and runs as the team that owns your API key.

## Install

```bash
npm install @videogen/ai-tool ai zod
```

`ai` (the Vercel AI SDK) and `zod` are peer dependencies.

## Setup

Get an API key from [app.videogen.io/api](https://app.videogen.io/api) and set it as `VIDEOGEN_API_KEY`:

```bash
export VIDEOGEN_API_KEY="your_api_key"
```

## Usage with AI SDK 7

```typescript
import { generateText, isStepCount } from "ai";
import { createVideogenTools } from "@videogen/ai-tool";

const tools = createVideogenTools({ include: ["getMe", "listFiles"] });

const result = await generateText({
  model: "openai/gpt-5-mini",
  tools,
  stopWhen: isStepCount(10),
  prompt: "Read my VideoGen account and list five files. Do not generate media.",
});

console.log(result.text);
```

By default each tool blocks until the workflow or tool execution finishes and returns the completed result.

## Options

```typescript
import { VideoGen } from "@videogen/sdk";
import { createVideogenTools } from "@videogen/ai-tool";

const tools = createVideogenTools({
  // Provide a pre-configured client, or pass apiKey / baseUrl, or rely on env.
  client: new VideoGen({ apiKey: process.env.VIDEOGEN_API_KEY }),

  // Return the run/execution id immediately instead of waiting.
  wait: false,

  // Only expose a subset of tools to the model.
  include: ["scriptToVideo", "generateImage", "textToSpeech"],
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

End-to-end video workflows: `scriptToVideo`, `voiceoverToVideo`, `slideshowToVideo`, `storyboardToVideo`, `listWorkflowRuns`, `getWorkflowRun`, `cancelWorkflowRun`.

Media generation: `generateImage`, `generateVideoClip`, `textToSpeech`, `generateSoundEffect`, `generateMusic`, `generateMotionGraphic`, `generateAvatar`, `vectorizeImage`, `removeImageBackground`, `removeVideoBackground`, `upscaleImage`, `upscaleVideo`, `image3dEffect`, `listToolExecutions`, `getToolExecution`, `cancelToolExecution`.

Projects: `listProjects`, `getProject`, `exportProject`, `remixProject`, `listProjectRemixActions`.

Files: `uploadFile`, `getFile`, `listFiles`.

Resources and account: `listTtsVoices`, `listLanguages`, `getMe`.

## Documentation

- [Use with AI agents](https://docs.videogen.io/use-with-ai-agents)
- [MCP server](https://docs.videogen.io/libraries/mcp)
- [API reference](https://docs.videogen.io)

## License

MIT

## Account and permissions

Generation and editing use VideoGen account credits. Obtain user approval before credit-consuming calls. Use `include` to expose only the tools your agent needs. API keys belong in server-side environment variables, never shared prompts or client-side bundles. Upload tools send the selected local file to VideoGen.

[VideoGen](https://videogen.io/) · [MCP setup](https://videogen.io/videogen-mcp) · [Source](https://github.com/video-gen/video-workflow-recipes/tree/main/integrations/ai-sdk-videogen)

Compatibility checked with AI SDK 5 and 7. The example above uses AI SDK 7’s `isStepCount` helper; AI SDK 5 uses `stepCountIs`. Set `AI_GATEWAY_API_KEY` for the example’s model call. `VIDEOGEN_API_KEY` authenticates the VideoGen tools separately.
