import type { VideoGen } from "@videogen/sdk";
import { type Tool, tool } from "@openai/agents";
import { parseToolInput } from "../operations";
import { bool, cursorField, limitField, objectSchema, str } from "../schemas";

export function buildResourceTools({ client }: { client: VideoGen }): Tool[] {
  return [
    tool({
      name: "list_tts_voices",
      description:
        "List available text-to-speech voices for narration, text_to_speech, and workflows.",
      strict: false,
      parameters: objectSchema({
        cursor: cursorField,
        limit: limitField,
        includeDeprecatedVoices: bool("Include deprecated voices in the results."),
        query: str(
          "Optional case-insensitive substring filter across each item's searchable text fields.",
        ),
      }),
      execute: async (input) =>
        await client.resources.listTtsVoices(
          parseToolInput<Parameters<typeof client.resources.listTtsVoices>[0]>(input),
        ),
    }),

    tool({
      name: "list_languages",
      description: "List supported languages for narration and captions.",
      strict: false,
      parameters: objectSchema({
        query: str(
          "Optional case-insensitive substring filter across each item's searchable text fields.",
        ),
      }),
      execute: async (input) =>
        await client.resources.listLanguages(
          parseToolInput<Parameters<typeof client.resources.listLanguages>[0]>(input),
        ),
    }),
  ];
}
