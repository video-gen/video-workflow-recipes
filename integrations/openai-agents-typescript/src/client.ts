import { VideoGen } from "@videogen/sdk";

const DEFAULT_BASE_URL = "https://api.videogen.io";

export type ResolveClientOptions = {
  /** A pre-configured VideoGen client. When provided, it is used as-is. */
  client?: VideoGen;
  /** API key. Falls back to the `VIDEOGEN_API_KEY` environment variable. */
  apiKey?: string;
  /** API base URL. Falls back to `VIDEOGEN_BASE_URL`, then production. */
  baseUrl?: string;
};

/**
 * Resolves a VideoGen client from an explicit client, an explicit key, or the
 * environment. Every tool call is authenticated as the team that owns the key.
 */
export function resolveVideoGenClient(options: ResolveClientOptions): VideoGen {
  if (options.client != null) {
    return options.client;
  }

  const apiKey = options.apiKey ?? process.env.VIDEOGEN_API_KEY;

  if (apiKey == null || apiKey.trim() === "") {
    throw new Error(
      "No VideoGen API key found. Pass `client` or `apiKey` to createVideogenTools, or set the VIDEOGEN_API_KEY environment variable. Create a key at https://app.videogen.io/api.",
    );
  }

  const baseUrl = options.baseUrl ?? process.env.VIDEOGEN_BASE_URL ?? DEFAULT_BASE_URL;

  return new VideoGen({ apiKey: apiKey.trim(), baseUrl, clientId: "openai-agents" });
}
