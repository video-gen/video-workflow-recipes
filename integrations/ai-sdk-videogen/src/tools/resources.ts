import type { VideoGen } from "@videogen/sdk";
import { type ToolSet, tool } from "ai";
import { z } from "zod";
import { dropUndefined } from "../operations";
import { cursorField, limitField } from "../schemas";

const catalogueQueryField = z
  .string()
  .optional()
  .describe(
    "Optional case-insensitive substring filter across each item's searchable text fields.",
  );

export function buildResourceTools({ client }: { client: VideoGen }) {
  return {
    listTtsVoices: tool({
      description:
        "List available text-to-speech voices for narration, textToSpeech, and workflows.",
      inputSchema: z.object({
        cursor: cursorField,
        limit: limitField,
        includeDeprecatedVoices: z
          .boolean()
          .optional()
          .describe("Include deprecated voices in the results."),
        query: catalogueQueryField,
      }),
      execute: async (input) => await client.resources.listTtsVoices(dropUndefined(input)),
    }),

    listLanguages: tool({
      description: "List supported languages for narration and captions.",
      inputSchema: z.object({
        query: catalogueQueryField,
      }),
      execute: async (input) => await client.resources.listLanguages(dropUndefined(input)),
    }),
  } satisfies ToolSet;
}
