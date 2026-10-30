import { scriptToVideoInputSchema, voiceoverToVideoInputSchema, slideshowToVideoInputSchema, storyboardToVideoInputSchema, videoToVideoInputSchema } from "../request-schemas";
import type { VideoGen } from "@videogen/sdk";
import { type ToolSet, tool } from "ai";
import { z } from "zod";
import { type VideogenToolControls, dropUndefined, runWorkflow } from "../operations";
import {
  aspectRatioSchema,
  cursorField,
  limitField,
  selfOnlyField,
} from "../schemas";

export function buildWorkflowTools({
  client,
  controls,
}: {
  client: VideoGen;
  controls: VideogenToolControls;
}) {
  return {
    scriptToVideo: tool({
      description:
        "Turn a script into a finished narrated video with visuals and captions. The script is narrated verbatim (not rewritten). Provide at least two remixActions (e.g. ENABLE_CAPTIONS + CONVERT_IMAGES_TO_VIDEOS) for a polished result.",
      inputSchema: scriptToVideoInputSchema,
      execute: async (input) =>
        await runWorkflow(client, () => client.workflows.scriptToVideo(input), controls),
    }),

    voiceoverToVideo: tool({
      description:
        "Build a narrated video from an already-uploaded voiceover audio file. Upload the audio first with uploadFile, then pass its fileId.",
      inputSchema: voiceoverToVideoInputSchema,
      execute: async (input) =>
        await runWorkflow(
          client,
          () => client.workflows.voiceoverToVideo(input),
          controls,
        ),
    }),

    slideshowToVideo: tool({
      description:
        "Build a narrated video from an already-uploaded PDF or slideshow file. Upload the file first with uploadFile, then pass its fileId. ADD_TRANSITIONS + CONVERT_IMAGES_TO_VIDEOS make strong remixActions here.",
      inputSchema: slideshowToVideoInputSchema,
      execute: async (input) =>
        await runWorkflow(
          client,
          () => client.workflows.slideshowToVideo(input),
          controls,
        ),
    }),

    storyboardToVideo: tool({
      description:
        "Build a video from a structured storyboard of scenes. Pass quality HIGH and at least two remixActions (e.g. ENABLE_CAPTIONS + ADD_TRANSITIONS).",
      inputSchema: storyboardToVideoInputSchema,
      execute: async (input) =>
        await runWorkflow(
          client,
          () => client.workflows.storyboardToVideo(input),
          controls,
        ),
    }),

    promptToVideoClip: tool({
      description:
        "Generate one short AI video clip (1-30 seconds) from a text prompt inside an editable project. VideoGen generates an opening frame (optionally guided by reference images), then animates it into a video. Does not accept remixActions. For a standalone clip without a project, use generateVideoClip. For longer narrated multi-scene videos, use scriptToVideo.",
      inputSchema: z.object({
        prompt: z
          .string()
          .describe(
            "Text prompt describing the video to generate (e.g. 'A golden retriever running through a sunlit meadow in slow motion, cinematic').",
          ),
        imageFileIds: z
          .array(z.string())
          .max(4)
          .optional()
          .describe("Uploaded reference image file ids that guide the opening frame."),
        durationSeconds: z
          .number()
          .int()
          .min(1)
          .max(30)
          .optional()
          .describe(
            "Desired clip length in whole seconds (1-30). Defaults to 10. Clamped to the selected quality's supported range.",
          ),
        aspectRatio: aspectRatioSchema.optional(),
        quality: z
          .enum(["LOW", "STANDARD", "HIGH", "MAX"])
          .optional()
          .describe("Video (and opening-frame) quality tier. Defaults to STANDARD."),
      }),
      execute: async (input) =>
        await runWorkflow(
          client,
          () => client.workflows.promptToVideoClip(dropUndefined(input)),
          controls,
        ),
    }),

    videoToVideo: tool({
      description:
        "Restyle an existing video from a text prompt inside an editable project, keeping its length and timing. Pass exactly one of videoFileId (an uploaded video) or videoUrl (a public link, which the run imports itself). Up to 120 seconds is restyled per run. Provide at least two remixActions (e.g. ENABLE_CAPTIONS + ADD_TRANSITIONS) for a polished result.",
      inputSchema: videoToVideoInputSchema,
      execute: async (input) =>
        await runWorkflow(client, () => client.workflows.videoToVideo(input), controls),
    }),

    listWorkflowRuns: tool({
      description: "List workflow runs, most recent first.",
      inputSchema: z.object({
        cursor: cursorField,
        limit: limitField,
        selfOnly: selfOnlyField,
      }),
      execute: async (input) => await client.workflows.listWorkflowRuns(dropUndefined(input)),
    }),

    getWorkflowRun: tool({
      description: "Fetch the current status and result of a single workflow run.",
      inputSchema: z.object({
        workflowRunId: z.string().describe("Workflow run id (vg_work_...)."),
      }),
      execute: async ({ workflowRunId }) => await client.workflows.getWorkflowRun({ workflowRunId }),
    }),

    cancelWorkflowRun: tool({
      description: "Request cancellation of an in-progress workflow run.",
      inputSchema: z.object({
        workflowRunId: z.string().describe("Workflow run id (vg_work_...)."),
      }),
      execute: async ({ workflowRunId }) =>
        await client.workflows.cancelWorkflowRun({ workflowRunId }),
    }),
  } satisfies ToolSet;
}
