import { remixProjectParameters, exportProjectParameters } from "../request-schemas";
import type { VideoGen } from "@videogen/sdk";
import { type Tool, tool } from "@openai/agents";
import {
  type VideogenToolControls,
  dropUndefined,
  parseToolInput,
  runExport,
} from "../operations";
import {
  cursorField,
  limitField,
  objectSchema,
  selfOnlyField,
  str,
} from "../schemas";

export function buildProjectTools({
  client,
  controls,
}: {
  client: VideoGen;
  controls: VideogenToolControls;
}): Tool[] {
  return [
    tool({
      name: "list_projects",
      description:
        "List projects, including projects created in the dashboard.",
      strict: false,
      parameters: objectSchema({
        cursor: cursorField,
        limit: limitField,
        selfOnly: selfOnlyField,
      }),
      execute: async (input) =>
        await client.projects.listProjects(
          parseToolInput<Parameters<typeof client.projects.listProjects>[0]>(input),
        ),
    }),

    tool({
      name: "get_project",
      description: "Fetch metadata and the shareable URL for a single project.",
      strict: false,
      parameters: objectSchema({ projectId: str("Project id.") }, ["projectId"]),
      execute: async (input) =>
        await client.projects.getProject(
          parseToolInput<Parameters<typeof client.projects.getProject>[0]>(input),
        ),
    }),

    tool({
      name: "export_project",
      description:
        "Export a project to an MP4. By default waits until the download URL is ready and returns it.",
      strict: false,
      parameters: exportProjectParameters,
      execute: async (input) => {
        const args = parseToolInput<Parameters<typeof client.projects.exportProject>[0]>(input);
        const { projectId, quality } = args;
        return await runExport(
          client,
          projectId,
          () =>
            client.projects.exportProject({ projectId, ...(quality != null ? { quality } : {}) }),
          controls,
        );
      },
    }),

    tool({
      name: "remix_project",
      description:
        "Apply remix actions (music, logo, captions, transitions, natural-language edits) to an existing project. Poll with list_project_remix_actions for status.",
      strict: false,
      parameters: remixProjectParameters,
      execute: async (input) => {
        const args = parseToolInput<Parameters<typeof client.projects.remixProject>[0]>(input);
        const { projectId, ...body } = args;
        return await client.projects.remixProject({ projectId, ...dropUndefined(body) });
      },
    }),

    tool({
      name: "list_project_remix_actions",
      description: "List the status of remix actions applied to a project.",
      strict: false,
      parameters: objectSchema({ projectId: str("Project id.") }, ["projectId"]),
      execute: async (input) =>
        await client.projects.listProjectRemixActions(
          parseToolInput<Parameters<typeof client.projects.listProjectRemixActions>[0]>(input),
        ),
    }),
  ];
}
