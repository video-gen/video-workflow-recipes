import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { type VideoGen, getHydratedFile, uploadFile } from "@videogen/sdk";
import { type ToolSet, tool } from "ai";
import { z } from "zod";
import { dropUndefined } from "../operations";
import { cursorField, limitField } from "../schemas";

export function buildFileTools({ client }: { client: VideoGen }) {
  return {
    uploadFile: tool({
      description:
        "Upload a local file to VideoGen and wait until it is processed. Returns the file with its id (vg_file_...) and signed URLs. Use the returned fileId for voiceoverToVideo, slideshowToVideo, logos, or B-roll.",
      inputSchema: z.object({
        filePath: z.string().describe("Absolute path to a local file to upload."),
        displayName: z
          .string()
          .optional()
          .describe("Display name for the file. Defaults to the source file name."),
        type: z
          .enum(["IMAGE", "VIDEO", "AUDIO"])
          .optional()
          .describe("File type. Inferred when omitted."),
      }),
      execute: async ({ filePath, displayName, type }) => {
        const buffer = await readFile(filePath);
        const bytes = new Uint8Array(buffer);
        const resolvedName =
          displayName != null && displayName.length > 0 ? displayName : basename(filePath);

        return await uploadFile({
          client,
          data: bytes,
          displayName: resolvedName,
          ...(type != null ? { type } : {}),
        });
      },
    }),

    getFile: tool({
      description:
        "Fetch a file by id with freshly hydrated (non-expired) signed URLs for its thumbnail, preview, and download renditions.",
      inputSchema: z.object({ fileId: z.string().describe("File id (vg_file_...).") }),
      execute: async ({ fileId }) => await getHydratedFile({ client, fileId }),
    }),

    listFiles: tool({
      description: "List files visible to the current API key.",
      inputSchema: z.object({ cursor: cursorField, limit: limitField }),
      execute: async (input) => await client.files.getFiles(dropUndefined(input)),
    }),
  } satisfies ToolSet;
}
