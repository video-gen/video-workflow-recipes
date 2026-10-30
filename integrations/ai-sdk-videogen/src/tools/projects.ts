import { remixProjectInputSchema, exportProjectInputSchema } from "../request-schemas";
import type { VideoGen } from "@videogen/sdk";
import { type ToolSet, tool } from "ai";
import { z } from "zod";
import { type VideogenToolControls, dropUndefined, runExport } from "../operations";
import { cursorField, limitField, selfOnlyField } from "../schemas";

export function buildProjectTools({
  client,
  controls,
}: {
  client: VideoGen;
  controls: VideogenToolControls;
}) {
  return {
    listProjects: tool({
      description:
        "List projects, including projects created in the dashboard.",
      inputSchema: z.object({
        cursor: cursorField,
        limit: limitField,
        selfOnly: selfOnlyField,
      }),
      execute: async (input) => await client.projects.listProjects(dropUndefined(input)),
    }),

    getProject: tool({
      description: "Fetch metadata and the shareable URL for a single project.",
      inputSchema: z.object({ projectId: z.string().describe("Project id.") }),
      execute: async ({ projectId }) => await client.projects.getProject({ projectId }),
    }),

    exportProject: tool({
      description:
        "Export a project to an MP4. By default waits until the download URL is ready and returns it.",
      inputSchema: exportProjectInputSchema,
      execute: async ({ projectId, quality }) =>
        await runExport(
          client,
          projectId,
          () =>
            client.projects.exportProject({ projectId, ...(quality != null ? { quality } : {}) }),
          controls,
        ),
    }),

    remixProject: tool({
      description:
        "Apply remix actions (music, logo, captions, transitions, natural-language edits) to an existing project. Poll with listProjectRemixActions for status.",
      inputSchema: remixProjectInputSchema,
      execute: async (input) => await client.projects.remixProject(input),
    }),

    listProjectRemixActions: tool({
      description: "List the status of remix actions applied to a project.",
      inputSchema: z.object({ projectId: z.string().describe("Project id.") }),
      execute: async ({ projectId }) => await client.projects.listProjectRemixActions({ projectId }),
    }),
  } satisfies ToolSet;
}
