import { textToSpeechInputSchema } from "../request-schemas";
import type { VideoGen } from "@videogen/sdk";
import { type ToolSet, tool } from "ai";
import { z } from "zod";
import { type VideogenToolControls, dropUndefined, runTool } from "../operations";
import {
  aspectRatioSchema,
  avatarQualitySchema,
  cursorField,
  imageFileIdField,
  imageFileIdsField,
  entityIdsField,
  startFrameFileIdField,
  spokenDialogueField,
  voiceDescriptionField,
  imageQualitySchema,
  isOutputTemporaryField,
  limitField,
  numResultsField,
  selfOnlyField,
  videoFileIdField,
  videoFileIdsField,
  watermarkModeSchema,
} from "../schemas";

export function buildMediaTools({
  client,
  controls,
}: {
  client: VideoGen;
  controls: VideogenToolControls;
}) {
  return {
    generateImage: tool({
      description:
        "Generate an image from a text prompt, optionally conditioned on source images and actor, product, or visual-style entity ids.",
      inputSchema: z.object({
        prompt: z.string().describe("Text description of the image to generate."),
        quality: imageQualitySchema.optional(),
        imageFileIds: imageFileIdsField,
        entityIds: entityIdsField,
        aspectRatio: aspectRatioSchema.optional(),
        watermarkMode: watermarkModeSchema.optional(),
        numResults: numResultsField,
        isOutputTemporary: isOutputTemporaryField,
      }),
      execute: async (input) =>
        await runTool(client, () => client.tools.generateImage(dropUndefined(input)), controls),
    }),

    generateVideoClip: tool({
      description:
        "Generate a video clip from a text prompt, source images, or source videos. quality is optional (LOW, STANDARD, HIGH, or MAX).",
      inputSchema: z.object({
        quality: z
          .enum(["LOW", "STANDARD", "HIGH", "MAX"])
          .optional()
          .describe(
            "Video generation quality tier (LOW, STANDARD, HIGH, or MAX). Optional; when omitted, your workspace's Default AI quality for video is used.",
          ),
        prompt: z.string().optional().describe("Text description of the video to generate."),
        startFrameFileId: startFrameFileIdField,
        imageFileIds: imageFileIdsField,
        videoFileIds: videoFileIdsField,
        audioFileIds: z
          .array(z.string())
          .optional()
          .describe(
            "Source audio file ids (vg_file_...) to lip-sync from a recording. Use spokenDialogue to have the model speak a line it generates itself.",
          ),
        spokenDialogue: spokenDialogueField,
        voiceDescription: voiceDescriptionField,
        generateAudio: z.boolean().optional().describe("Whether to generate audio for the clip."),
        suppressBackgroundMusic: z
          .boolean()
          .optional()
          .describe(
            "When true, the clip will not include a musical soundtrack. Spoken dialogue and environmental sound are still allowed.",
          ),
        durationSeconds: z
          .number()
          .positive()
          .nullable()
          .optional()
          .describe(
            "Optional clip length in whole seconds (1 to 30). Omit or pass null for Auto.",
          ),
        aspectRatio: aspectRatioSchema.optional(),
        watermarkMode: watermarkModeSchema.optional(),
        numResults: numResultsField,
        isOutputTemporary: isOutputTemporaryField,
      }),
      execute: async (input) =>
        await runTool(client, () => client.tools.generateVideoClip(dropUndefined(input)), controls),
    }),

    textToSpeech: tool({
      description: "Convert text into spoken audio using a selectable voice.",
      inputSchema: textToSpeechInputSchema,
      execute: async (input) =>
        await runTool(client, () => client.tools.textToSpeech(input), controls),
    }),

    generateSoundEffect: tool({
      description: "Generate a sound effect from a text prompt.",
      inputSchema: z.object({
        prompt: z.string().describe("Description of the sound effect."),
        durationSeconds: z
          .number()
          .positive()
          .nullable()
          .optional()
          .describe("Requested duration in seconds."),
        promptInfluence: z
          .number()
          .nullable()
          .optional()
          .describe("How strongly the prompt guides generation (0-1)."),
        numResults: numResultsField,
        isOutputTemporary: isOutputTemporaryField,
      }),
      execute: async (input) =>
        await runTool(client, () => client.tools.generateSoundEffect(dropUndefined(input)), controls),
    }),

    generateMusic: tool({
      description: "Generate a music track from a text prompt.",
      inputSchema: z.object({
        prompt: z.string().describe("Description of the music to generate."),
        numResults: numResultsField,
        isOutputTemporary: isOutputTemporaryField,
      }),
      execute: async (input) =>
        await runTool(client, () => client.tools.generateMusic(dropUndefined(input)), controls),
    }),

    generateMotionGraphic: tool({
      description:
        "Generate an animated motion graphic video from a text prompt. Best for precise text animations (typing effects, kinetic typography, lower thirds). Optionally pass reference media file ids and actor, product, or visual-style entity ids.",
      inputSchema: z.object({
        prompt: z.string().describe("Description of the animated motion graphic to generate."),
        fileIds: z
          .array(z.string())
          .optional()
          .describe(
            "Optional reference media file ids (vg_file_...) the motion graphic may display or animate.",
          ),
        entityIds: entityIdsField,
        durationSeconds: z
          .number()
          .int()
          .nullable()
          .optional()
          .describe("Length in seconds, a whole number from 1 to 300. Defaults to 5."),
        aspectRatio: aspectRatioSchema.optional(),
        transparentBackground: z
          .boolean()
          .optional()
          .describe(
            "Whether to render a transparent WebM overlay. Set to false for an opaque MP4. Defaults to true.",
          ),
        numResults: numResultsField,
        isOutputTemporary: isOutputTemporaryField,
      }),
      execute: async (input) =>
        await runTool(
          client,
          () => client.tools.generateMotionGraphic(dropUndefined(input)),
          controls,
        ),
    }),

    generateAvatar: tool({
      description: "Generate a talking-head avatar video from an ACTOR entity and uploaded audio.",
      inputSchema: z.object({
        actorEntityId: z
          .string()
          .describe("The id of an ACTOR entity (vg_enti_...) with at least one image reference."),
        avatarQuality: avatarQualitySchema.optional(),
        audioFileId: z
          .string()
          .describe("Uploaded audio file id (vg_file_...) for the avatar to lip-sync."),
        watermarkMode: watermarkModeSchema.optional(),
        numResults: numResultsField,
        isOutputTemporary: isOutputTemporaryField,
      }),
      execute: async (input) =>
        await runTool(client, () => client.tools.generateAvatar(dropUndefined(input)), controls),
    }),

    vectorizeImage: tool({
      description: "Convert a raster image into a vector (SVG).",
      inputSchema: z.object({
        imageFileId: imageFileIdField,
        watermarkMode: watermarkModeSchema.optional(),
        numResults: numResultsField,
        isOutputTemporary: isOutputTemporaryField,
      }),
      execute: async (input) =>
        await runTool(client, () => client.tools.vectorizeImage(dropUndefined(input)), controls),
    }),

    removeImageBackground: tool({
      description: "Remove the background from an image.",
      inputSchema: z.object({
        imageFileId: imageFileIdField,
        watermarkMode: watermarkModeSchema.optional(),
        numResults: numResultsField,
        isOutputTemporary: isOutputTemporaryField,
      }),
      execute: async (input) =>
        await runTool(
          client,
          () => client.tools.removeImageBackground(dropUndefined(input)),
          controls,
        ),
    }),

    removeVideoBackground: tool({
      description: "Remove the background from a video.",
      inputSchema: z.object({
        videoFileId: videoFileIdField,
        watermarkMode: watermarkModeSchema.optional(),
        numResults: numResultsField,
        isOutputTemporary: isOutputTemporaryField,
      }),
      execute: async (input) =>
        await runTool(
          client,
          () => client.tools.removeVideoBackground(dropUndefined(input)),
          controls,
        ),
    }),

    upscaleImage: tool({
      description: "Increase the resolution of an image.",
      inputSchema: z.object({
        imageFileId: imageFileIdField,
        watermarkMode: watermarkModeSchema.optional(),
        numResults: numResultsField,
        isOutputTemporary: isOutputTemporaryField,
      }),
      execute: async (input) =>
        await runTool(client, () => client.tools.upscaleImage(dropUndefined(input)), controls),
    }),

    upscaleVideo: tool({
      description: "Increase the resolution of a video.",
      inputSchema: z.object({
        videoFileId: videoFileIdField,
        watermarkMode: watermarkModeSchema.optional(),
        numResults: numResultsField,
        isOutputTemporary: isOutputTemporaryField,
      }),
      execute: async (input) =>
        await runTool(client, () => client.tools.upscaleVideo(dropUndefined(input)), controls),
    }),

    image3dEffect: tool({
      description: "Add 3D parallax motion to a still image, producing a video.",
      inputSchema: z.object({
        imageFileId: imageFileIdField,
        watermarkMode: watermarkModeSchema.optional(),
        numResults: numResultsField,
        isOutputTemporary: isOutputTemporaryField,
      }),
      execute: async (input) =>
        await runTool(client, () => client.tools.image3dEffect(dropUndefined(input)), controls),
    }),

    listToolExecutions: tool({
      description: "List past tool executions, most recent first.",
      inputSchema: z.object({
        cursor: cursorField,
        limit: limitField,
        selfOnly: selfOnlyField,
      }),
      execute: async (input) => await client.tools.listToolExecutions(dropUndefined(input)),
    }),

    getToolExecution: tool({
      description: "Fetch the current status and results of a single tool execution.",
      inputSchema: z.object({
        toolExecutionId: z.string().describe("Tool execution id (vg_tool_...)."),
      }),
      execute: async ({ toolExecutionId }) =>
        await client.tools.getToolExecutionInfo({ toolExecutionId }),
    }),

    cancelToolExecution: tool({
      description: "Request cancellation of an in-progress tool execution.",
      inputSchema: z.object({
        toolExecutionId: z.string().describe("Tool execution id (vg_tool_...)."),
      }),
      execute: async ({ toolExecutionId }) =>
        await client.tools.cancelToolExecution({ toolExecutionId }),
    }),
  } satisfies ToolSet;
}
