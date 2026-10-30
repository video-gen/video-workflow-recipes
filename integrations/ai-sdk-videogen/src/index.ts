import { VideoGen } from "@videogen/sdk";
import type { ToolSet } from "ai";
import { type ResolveClientOptions, resolveVideoGenClient } from "./client";
import type { VideogenToolControls } from "./operations";
import { buildAccountTools } from "./tools/account";
import { buildFileTools } from "./tools/files";
import { buildMediaTools } from "./tools/mediaTools";
import { buildProjectTools } from "./tools/projects";
import { buildResourceTools } from "./tools/resources";
import { buildWorkflowTools } from "./tools/workflows";

export { VideoGen } from "@videogen/sdk";
export { resolveVideoGenClient } from "./client";
export type { ResolveClientOptions } from "./client";
export type { VideogenToolControls } from "./operations";

function buildAllTools(args: { client: VideoGen; controls: VideogenToolControls }) {
  return {
    ...buildWorkflowTools(args),
    ...buildMediaTools(args),
    ...buildProjectTools(args),
    ...buildFileTools({ client: args.client }),
    ...buildResourceTools({ client: args.client }),
    ...buildAccountTools({ client: args.client }),
  };
}

/** The complete set of VideoGen tools, keyed by tool name. */
export type VideogenTools = ReturnType<typeof buildAllTools>;

/** A VideoGen tool name (e.g. `"scriptToVideo"`, `"generateImage"`). */
export type VideogenToolName = keyof VideogenTools;

export type CreateVideogenToolsOptions = ResolveClientOptions & {
  /**
   * When true (default), tools block until the workflow run or tool execution
   * finishes and return the completed result. Set false to return immediately
   * with the run/execution id for the caller to poll.
   */
  wait?: boolean;
  /** Poll interval in ms while waiting. Defaults to the SDK's default. */
  pollIntervalMs?: number;
  /** Maximum time in ms to wait before giving up. Defaults to the SDK's default. */
  timeoutMs?: number;
  /** Restrict the returned tool set to these tool names. Defaults to all tools. */
  include?: readonly VideogenToolName[];
};

/**
 * Builds VideoGen tools in Vercel AI SDK format, ready to drop into
 * `generateText`, `streamText`, or an `Agent`'s `tools`. Authenticates with an
 * explicit client, an explicit `apiKey`, or the `VIDEOGEN_API_KEY` environment
 * variable.
 */
export function createVideogenTools(options: CreateVideogenToolsOptions = {}): ToolSet {
  const client = resolveVideoGenClient(options);

  const controls: VideogenToolControls = {
    wait: options.wait ?? true,
    pollIntervalMs: options.pollIntervalMs,
    timeoutMs: options.timeoutMs,
  };

  const allTools = buildAllTools({ client, controls });

  if (options.include == null) {
    return allTools;
  }

  const included: ToolSet = {};
  for (const name of options.include) {
    included[name] = allTools[name];
  }

  return included;
}
