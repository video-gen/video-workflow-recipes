import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { type VideoGen, getHydratedFile, uploadFile } from "@videogen/sdk";
import { type Tool, tool } from "@openai/agents";
import { parseToolInput } from "../operations";
import { cursorField, enumStr, limitField, objectSchema, str } from "../schemas";

type UploadFileArgs = {
  filePath: string;
  displayName?: string;
  type?: "IMAGE" | "VIDEO" | "AUDIO";
};

export function buildFileTools({ client }: { client: VideoGen }): Tool[] {
  return [
    tool({
      name: "upload_file",
      description:
        "Upload a local file to VideoGen and wait until it is processed. Returns the file with its id (vg_file_...) and signed URLs. Use the returned fileId for voiceover_to_video, slideshow_to_video, logos, or B-roll.",
      strict: false,
      parameters: objectSchema(
        {
          filePath: str("Absolute path to a local file to upload."),
          displayName: str("Display name for the file. Defaults to the source file name."),
          type: enumStr(["IMAGE", "VIDEO", "AUDIO"], "File type. Inferred when omitted."),
        },
        ["filePath"],
      ),
      execute: async (input) => {
        const { filePath, displayName, type } = parseToolInput<UploadFileArgs>(input);
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

    tool({
      name: "get_file",
      description:
        "Fetch a file by id with freshly hydrated (non-expired) signed URLs for its thumbnail, preview, and download renditions.",
      strict: false,
      parameters: objectSchema({ fileId: str("File id (vg_file_...).") }, ["fileId"]),
      execute: async (input) => {
        const { fileId } = parseToolInput<{ fileId: string }>(input);
        return await getHydratedFile({ client, fileId });
      },
    }),

    tool({
      name: "list_files",
      description: "List files visible to the current API key.",
      strict: false,
      parameters: objectSchema({ cursor: cursorField, limit: limitField }),
      execute: async (input) =>
        await client.files.getFiles(
          parseToolInput<Parameters<typeof client.files.getFiles>[0]>(input),
        ),
    }),
  ];
}
