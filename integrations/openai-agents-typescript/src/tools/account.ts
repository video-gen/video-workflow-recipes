import type { VideoGen } from "@videogen/sdk";
import { type Tool, tool } from "@openai/agents";
import { objectSchema } from "../schemas";

export function buildAccountTools({ client }: { client: VideoGen }): Tool[] {
  return [
    tool({
      name: "get_me",
      description:
        "Fetch the authenticated team's account details, including the current credit balance.",
      strict: false,
      parameters: objectSchema({}),
      execute: async () => await client.account.getMe(),
    }),
  ];
}
