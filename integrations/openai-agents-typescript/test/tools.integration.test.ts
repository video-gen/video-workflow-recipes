import { describe, expect, it } from "vitest";
import { createVideogenTools, resolveVideoGenClient } from "../src/index";

const apiKey = process.env.VIDEOGEN_API_KEY;

/**
 * Live smoke against the VideoGen API. Uses the read-only `get_me` account call
 * (spends no credits) with the key/base URL supplied by the test-runner Cloud
 * Run Job. Skips when no key is present.
 */
describe.skipIf(apiKey == null || apiKey.trim() === "")("openai-agents live integration", () => {
  it("resolves a client and fetches the account over the live API", async () => {
    const client = resolveVideoGenClient({
      apiKey,
      baseUrl: process.env.VIDEOGEN_BASE_URL,
    });

    const me = await client.account.getMe();
    expect(me).toBeDefined();
  });

  it("builds the full tool surface against a live client", () => {
    const client = resolveVideoGenClient({
      apiKey,
      baseUrl: process.env.VIDEOGEN_BASE_URL,
    });

    const tools = createVideogenTools({ client });
    expect(tools.length).toBe(35);
  });
});
