import type { Tool } from "@openai/agents";
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
  /** Restrict the returned tool set to these tool names (e.g. `"script_to_video"`). */
  include?: readonly string[];
};

/**
 * Builds VideoGen tools in OpenAI Agents SDK format, ready to drop into an
 * `Agent`'s `tools` array. Authenticates with an explicit client, an explicit
 * `apiKey`, or the `VIDEOGEN_API_KEY` environment variable.
 */
export function createVideogenTools(options: CreateVideogenToolsOptions = {}): Tool[] {
  const client = resolveVideoGenClient(options);

  const controls: VideogenToolControls = {
    wait: options.wait ?? true,
    pollIntervalMs: options.pollIntervalMs,
    timeoutMs: options.timeoutMs,
  };

  const allTools: Tool[] = [
    ...buildWorkflowTools({ client, controls }),
    ...buildMediaTools({ client, controls }),
    ...buildProjectTools({ client, controls }),
    ...buildFileTools({ client }),
    ...buildResourceTools({ client }),
    ...buildAccountTools({ client }),
  ];

  if (options.include == null) {
    return allTools;
  }

  const included = new Set(options.include);
  return allTools.filter((videogenTool) => included.has(videogenTool.name));
}
