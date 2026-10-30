import type { VideoGen } from "@videogen/sdk";
import { type ToolSet, tool } from "ai";
import { z } from "zod";

export function buildAccountTools({ client }: { client: VideoGen }) {
  return {
    getMe: tool({
      description:
        "Fetch the authenticated team's account details, including the current credit balance.",
      inputSchema: z.object({}),
      execute: async () => await client.account.getMe(),
    }),
  } satisfies ToolSet;
}
