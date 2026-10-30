import { scriptToVideoParameters, voiceoverToVideoParameters, slideshowToVideoParameters, storyboardToVideoParameters, videoToVideoParameters } from "../request-schemas";
import type { VideoGen } from "@videogen/sdk";
import { type Tool, tool } from "@openai/agents";
import { type VideogenToolControls, parseToolInput, runWorkflow } from "../operations";
import {
  aspectRatioSchema,
  cursorField,
  limitField,
  num,
  objectSchema,
  selfOnlyField,
  str,
  stringArray,
} from "../schemas";

export function buildWorkflowTools({
  client,
  controls,
}: {
  client: VideoGen;
  controls: VideogenToolControls;
}): Tool[] {
  return [
    tool({
      name: "script_to_video",
      description:
        "Turn a script into a finished narrated video with visuals and captions. The script is narrated verbatim (not rewritten). Provide at least two remixActions (e.g. ENABLE_CAPTIONS + CONVERT_IMAGES_TO_VIDEOS) for a polished result.",
      strict: false,
      parameters: scriptToVideoParameters,
      execute: async (input) =>
        await runWorkflow(
          client,
          () =>
            client.workflows.scriptToVideo(
              parseToolInput<Parameters<typeof client.workflows.scriptToVideo>[0]>(input),
            ),
          controls,
        ),
    }),

    tool({
      name: "voiceover_to_video",
      description:
        "Build a narrated video from an already-uploaded voiceover audio file. Upload the audio first with upload_file, then pass its fileId.",
      strict: false,
      parameters: voiceoverToVideoParameters,
      execute: async (input) =>
        await runWorkflow(
          client,
          () =>
            client.workflows.voiceoverToVideo(
              parseToolInput<Parameters<typeof client.workflows.voiceoverToVideo>[0]>(input),
            ),
          controls,
        ),
    }),

    tool({
      name: "slideshow_to_video",
      description:
        "Build a narrated video from an already-uploaded PDF or slideshow file. Upload the file first with upload_file, then pass its fileId. ADD_TRANSITIONS + CONVERT_IMAGES_TO_VIDEOS make strong remixActions here.",
      strict: false,
      parameters: slideshowToVideoParameters,
      execute: async (input) =>
        await runWorkflow(
          client,
          () =>
            client.workflows.slideshowToVideo(
              parseToolInput<Parameters<typeof client.workflows.slideshowToVideo>[0]>(input),
            ),
          controls,
        ),
    }),

    tool({
      name: "storyboard_to_video",
      description:
        "Build a video from a structured storyboard of scenes. This workflow does not accept remixActions.",
      strict: false,
      parameters: storyboardToVideoParameters,
      execute: async (input) =>
        await runWorkflow(
          client,
          () =>
            client.workflows.storyboardToVideo(
              parseToolInput<Parameters<typeof client.workflows.storyboardToVideo>[0]>(input),
            ),
          controls,
        ),
    }),

    tool({
      name: "prompt_to_video_clip",
      description:
        "Generate one short AI video clip (1-30 seconds) from a text prompt inside an editable project. VideoGen generates an opening frame (optionally guided by reference images), then animates it into a video. Does not accept remixActions. For a standalone clip without a project, use generate_video_clip. For longer narrated multi-scene videos, use script_to_video.",
      strict: false,
      parameters: objectSchema(
        {
          prompt: str(
            "Text prompt describing the video to generate (e.g. 'A golden retriever running through a sunlit meadow in slow motion, cinematic').",
          ),
          imageFileIds: stringArray(
            "Uploaded reference image file ids that guide the opening frame.",
          ),
          durationSeconds: num(
            "Desired clip length in whole seconds (1-30). Defaults to 10. Clamped to the selected quality's supported range.",
          ),
          aspectRatio: aspectRatioSchema,
          quality: str(
            "Video (and opening-frame) quality tier: LOW, STANDARD, HIGH, or MAX. Defaults to STANDARD.",
          ),
        },
        ["prompt"],
      ),
      execute: async (input) =>
        await runWorkflow(
          client,
          () =>
            client.workflows.promptToVideoClip(
              parseToolInput<Parameters<typeof client.workflows.promptToVideoClip>[0]>(input),
            ),
          controls,
        ),
    }),

    tool({
      name: "video_to_video",
      description:
        "Restyle an existing video from a text prompt inside an editable project, keeping its length and timing. Pass exactly one of videoFileId (an uploaded video) or videoUrl (a public link, which the run imports itself). Up to 120 seconds is restyled per run. Provide at least two remixActions (e.g. ENABLE_CAPTIONS + ADD_TRANSITIONS) for a polished result.",
      strict: false,
      parameters: videoToVideoParameters,
      execute: async (input) =>
        await runWorkflow(
          client,
          () =>
            client.workflows.videoToVideo(
              parseToolInput<Parameters<typeof client.workflows.videoToVideo>[0]>(input),
            ),
          controls,
        ),
    }),

    tool({
      name: "list_workflow_runs",
      description: "List workflow runs, most recent first.",
      strict: false,
      parameters: objectSchema({ cursor: cursorField, limit: limitField, selfOnly: selfOnlyField }),
      execute: async (input) =>
        await client.workflows.listWorkflowRuns(
          parseToolInput<Parameters<typeof client.workflows.listWorkflowRuns>[0]>(input),
        ),
    }),

    tool({
      name: "get_workflow_run",
      description: "Fetch the current status and result of a single workflow run.",
      strict: false,
      parameters: objectSchema({ workflowRunId: str("Workflow run id (vg_work_...).") }, [
        "workflowRunId",
      ]),
      execute: async (input) =>
        await client.workflows.getWorkflowRun(
          parseToolInput<Parameters<typeof client.workflows.getWorkflowRun>[0]>(input),
        ),
    }),

    tool({
      name: "cancel_workflow_run",
      description: "Request cancellation of an in-progress workflow run.",
      strict: false,
      parameters: objectSchema({ workflowRunId: str("Workflow run id (vg_work_...).") }, [
        "workflowRunId",
      ]),
      execute: async (input) =>
        await client.workflows.cancelWorkflowRun(
          parseToolInput<Parameters<typeof client.workflows.cancelWorkflowRun>[0]>(input),
        ),
    }),
  ];
}
