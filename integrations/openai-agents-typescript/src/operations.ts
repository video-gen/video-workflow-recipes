import type { JsonObject, VideoGen } from "@videogen/sdk";

/** How the tools handle asynchronous VideoGen operations. */
export type VideogenToolControls = {
  /**
   * When true (default), tools block until the workflow run or tool execution
   * reaches a terminal state and return the finished result. When false, tools
   * return immediately with the run/execution id for the caller to poll.
   */
  wait: boolean;
  pollIntervalMs: number | undefined;
  timeoutMs: number | undefined;
};

const DEFAULT_POLL_INTERVAL_MS = 3000;
const DEFAULT_TIMEOUT_MS = 60 * 60 * 1000;
const TERMINAL_STATUSES = new Set(["succeeded", "failed", "cancelled", "canceled"]);

function isTerminalStatus(status: unknown): boolean {
  return typeof status === "string" && TERMINAL_STATUSES.has(status.toLowerCase());
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function requireStringField(obj: JsonObject, key: string): string {
  const value = obj[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`VideoGen response is missing required string field "${key}".`);
  }
  return value;
}

type DefinedProps<T> = { [K in keyof T]: Exclude<T[K], undefined> };

/**
 * Asserts a JSON-schema tool's runtime-validated input to its SDK request type.
 *
 * The `@openai/agents` `tool()` helper types the execute input as `unknown` for
 * JSON-schema tools (only Zod-schema tools get an inferred type). We use JSON
 * schema — not Zod — because several inputs (visualStyle, remixActions, scenes,
 * caption styles, pronunciation replacements) are free-form, API-validated
 * objects that a strict Zod schema forbids. The model is guided by the JSON
 * schema shown to it and the API validates every field server-side, so the
 * assertion here narrows a value we have already constrained.
 */
export function parseToolInput<T>(input: unknown): T {
  // We intentionally use an unsafe `as` assertion because the `@openai/agents`
  // JSON-schema tool contract surfaces the parsed arguments as `unknown`; the
  // true shape is the SDK request type validated by the API.
  return input as T;
}

export function dropUndefined<T extends Record<string, unknown>>(obj: T): DefinedProps<T> {
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value !== undefined) {
      result[key] = value;
    }
  }

  // We intentionally use an unsafe `as` assertion here because we have removed
  // exactly the `undefined` values that distinguish `T` from `DefinedProps<T>`,
  // a narrowing TypeScript cannot express through an iterative object build.
  return result as DefinedProps<T>;
}

/**
 * Starts a workflow and, unless `wait` is false, polls it to a terminal state.
 * Returns the finished run (or the start response when not waiting).
 */
export async function runWorkflow(
  client: VideoGen,
  start: () => Promise<JsonObject | null>,
  controls: VideogenToolControls,
): Promise<JsonObject> {
  const started = await start();
  if (started == null) {
    throw new Error("Workflow start returned an empty response.");
  }

  if (!controls.wait) {
    return started;
  }

  const workflowRunId = requireStringField(started, "workflowRunId");
  const intervalMs = controls.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
  const deadline = Date.now() + (controls.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const fetchSnapshot = async (): Promise<JsonObject> => {
    const snapshot = await client.workflows.getWorkflowRun({ workflowRunId });
    if (snapshot == null) {
      throw new Error("getWorkflowRun returned an empty response.");
    }
    return snapshot;
  };

  let snapshot = await fetchSnapshot();
  while (!isTerminalStatus(snapshot.status) && Date.now() < deadline) {
    await delay(intervalMs);
    snapshot = await fetchSnapshot();
  }

  return snapshot;
}

/**
 * Starts a media tool execution and, unless `wait` is false, polls it to a
 * terminal state. Returns the finished execution (or the start response).
 */
export async function runTool(
  client: VideoGen,
  start: () => Promise<JsonObject | null>,
  controls: VideogenToolControls,
): Promise<JsonObject> {
  const started = await start();
  if (started == null) {
    throw new Error("Tool start returned an empty response.");
  }

  if (!controls.wait) {
    return started;
  }

  const toolExecutionId = requireStringField(started, "toolExecutionId");
  const intervalMs = controls.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
  const deadline = Date.now() + (controls.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const fetchSnapshot = async (): Promise<JsonObject> => {
    const snapshot = await client.tools.getToolExecutionInfo({ toolExecutionId });
    if (snapshot == null) {
      throw new Error("getToolExecutionInfo returned an empty response.");
    }
    return snapshot;
  };

  let snapshot = await fetchSnapshot();
  while (!isTerminalStatus(snapshot.status) && Date.now() < deadline) {
    await delay(intervalMs);
    snapshot = await fetchSnapshot();
  }

  return snapshot;
}

/**
 * Starts a project export and, unless `wait` is false, polls it until the
 * download URL is ready. Returns the finished export (or the start response).
 */
export async function runExport(
  client: VideoGen,
  projectId: string,
  start: () => Promise<JsonObject | null>,
  controls: VideogenToolControls,
): Promise<JsonObject> {
  const started = await start();
  if (started == null) {
    throw new Error("Export start returned an empty response.");
  }

  if (!controls.wait) {
    return started;
  }

  const exportId = requireStringField(started, "exportId");
  const intervalMs = controls.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
  const deadline = Date.now() + (controls.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const fetchSnapshot = async (): Promise<JsonObject> => {
    const snapshot = await client.projects.getProjectExport({ projectId, exportId });
    if (snapshot == null) {
      throw new Error("getProjectExport returned an empty response.");
    }
    return snapshot;
  };

  let snapshot = await fetchSnapshot();
  while (
    !isTerminalStatus(snapshot.status) &&
    snapshot.downloadUrl == null &&
    Date.now() < deadline
  ) {
    await delay(intervalMs);
    snapshot = await fetchSnapshot();
  }

  return snapshot;
}
