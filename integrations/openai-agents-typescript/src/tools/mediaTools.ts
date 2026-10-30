import { textToSpeechParameters } from "../request-schemas";
import type { VideoGen } from "@videogen/sdk";
import { type Tool, tool } from "@openai/agents";
import { type VideogenToolControls, parseToolInput, runTool } from "../operations";
import {
  aspectRatioSchema,
  avatarQualitySchema,
  bool,
  cursorField,
  enumStr,
  imageFileIdField,
  imageFileIdsField,
  entityIdsField,
  startFrameFileIdField,
  spokenDialogueField,
  voiceDescriptionField,
  imageQualitySchema,
  isOutputTemporaryField,
  limitField,
  num,
  numResultsField,
  objectSchema,
  selfOnlyField,
  str,
  stringArray,
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
}): Tool[] {
  const singleFileTool = (args: {
    name: string;
    description: string;
    fileField: string;
    fileFieldSchema: typeof imageFileIdField;
    call: (input: unknown) => Promise<{ toolExecutionId: string }>;
  }): Tool =>
    tool({
      name: args.name,
      description: args.description,
      strict: false,
      parameters: objectSchema(
        {
          [args.fileField]: args.fileFieldSchema,
          watermarkMode: watermarkModeSchema,
          numResults: numResultsField,
          isOutputTemporary: isOutputTemporaryField,
        },
        [args.fileField],
      ),
      execute: async (input) => await runTool(client, () => args.call(input), controls),
    });

  return [
    tool({
      name: "generate_image",
      description:
        "Generate an image from a text prompt, optionally conditioned on source images and actor, product, or visual-style entity ids.",
      strict: false,
      parameters: objectSchema(
        {
          prompt: str("Text description of the image to generate."),
          quality: imageQualitySchema,
          imageFileIds: imageFileIdsField,
          entityIds: entityIdsField,
          aspectRatio: aspectRatioSchema,
          watermarkMode: watermarkModeSchema,
          numResults: numResultsField,
          isOutputTemporary: isOutputTemporaryField,
        },
        ["prompt", "quality"],
      ),
      execute: async (input) =>
        await runTool(
          client,
          () =>
            client.tools.generateImage(
              parseToolInput<Parameters<typeof client.tools.generateImage>[0]>(input),
            ),
          controls,
        ),
    }),

    tool({
      name: "generate_video_clip",
      description:
        "Generate a video clip from a text prompt, source images, or source videos. quality is optional (LOW, STANDARD, HIGH, or MAX).",
      strict: false,
      parameters: objectSchema(
        {
          quality: enumStr(
            ["LOW", "STANDARD", "HIGH", "MAX"],
            "Video generation quality tier (LOW, STANDARD, HIGH, or MAX). When omitted, your workspace's Default AI quality for video is used.",
          ),
          prompt: str("Text description of the video to generate."),
          startFrameFileId: startFrameFileIdField,
          imageFileIds: imageFileIdsField,
          videoFileIds: videoFileIdsField,
          audioFileIds: stringArray(
            "Source audio file ids (vg_file_...) to lip-sync from a recording. Use spokenDialogue to have the model speak a line it generates itself.",
          ),
          spokenDialogue: spokenDialogueField,
          voiceDescription: voiceDescriptionField,
          generateAudio: {
            type: "boolean",
            description: "Whether to generate audio for the clip.",
          },
          suppressBackgroundMusic: {
            type: "boolean",
            description:
              "When true, the clip will not include a musical soundtrack. Spoken dialogue and environmental sound are still allowed.",
          },
          durationSeconds: num(
            "Optional clip length in whole seconds (1 to 30). Omit or pass null for Auto.",
          ),
          aspectRatio: aspectRatioSchema,
          watermarkMode: watermarkModeSchema,
          numResults: numResultsField,
          isOutputTemporary: isOutputTemporaryField,
        },
        ["quality"],
      ),
      execute: async (input) =>
        await runTool(
          client,
          () =>
            client.tools.generateVideoClip(
              parseToolInput<Parameters<typeof client.tools.generateVideoClip>[0]>(input),
            ),
          controls,
        ),
    }),

    tool({
      name: "text_to_speech",
      description: "Convert text into spoken audio using a selectable voice.",
      strict: false,
      parameters: textToSpeechParameters,
      execute: async (input) =>
        await runTool(
          client,
          () =>
            client.tools.textToSpeech(
              parseToolInput<Parameters<typeof client.tools.textToSpeech>[0]>(input),
            ),
          controls,
        ),
    }),

    tool({
      name: "generate_sound_effect",
      description: "Generate a sound effect from a text prompt.",
      strict: false,
      parameters: objectSchema(
        {
          prompt: str("Description of the sound effect."),
          durationSeconds: num("Requested duration in seconds."),
          promptInfluence: num("How strongly the prompt guides generation (0-1)."),
          numResults: numResultsField,
          isOutputTemporary: isOutputTemporaryField,
        },
        ["prompt"],
      ),
      execute: async (input) =>
        await runTool(
          client,
          () =>
            client.tools.generateSoundEffect(
              parseToolInput<Parameters<typeof client.tools.generateSoundEffect>[0]>(input),
            ),
          controls,
        ),
    }),

    tool({
      name: "generate_music",
      description: "Generate a music track from a text prompt.",
      strict: false,
      parameters: objectSchema(
        {
          prompt: str("Description of the music to generate."),
          numResults: numResultsField,
          isOutputTemporary: isOutputTemporaryField,
        },
        ["prompt"],
      ),
      execute: async (input) =>
        await runTool(
          client,
          () =>
            client.tools.generateMusic(
              parseToolInput<Parameters<typeof client.tools.generateMusic>[0]>(input),
            ),
          controls,
        ),
    }),

    tool({
      name: "generate_motion_graphic",
      description:
        "Generate an animated motion graphic video from a text prompt. Best for precise text animations (typing effects, kinetic typography, lower thirds). Optionally pass reference media file ids and actor, product, or visual-style entity ids.",
      strict: false,
      parameters: objectSchema(
        {
          prompt: str("Description of the animated motion graphic to generate."),
          fileIds: stringArray(
            "Optional reference media file ids (vg_file_...) the motion graphic may display or animate.",
          ),
          entityIds: entityIdsField,
          durationSeconds: num("Length in seconds, a whole number from 1 to 300. Defaults to 5."),
          aspectRatio: aspectRatioSchema,
          transparentBackground: bool(
            "Whether to render a transparent WebM overlay. Set to false for an opaque MP4. Defaults to true.",
          ),
          numResults: numResultsField,
          isOutputTemporary: isOutputTemporaryField,
        },
        ["prompt"],
      ),
      execute: async (input) =>
        await runTool(
          client,
          () =>
            client.tools.generateMotionGraphic(
              parseToolInput<Parameters<typeof client.tools.generateMotionGraphic>[0]>(input),
            ),
          controls,
        ),
    }),

    tool({
      name: "generate_avatar",
      description: "Generate a talking-head avatar video from an ACTOR entity and uploaded audio.",
      strict: false,
      parameters: objectSchema(
        {
          actorEntityId: str(
            "The id of an ACTOR entity (vg_enti_...) with at least one image reference.",
          ),
          avatarQuality: avatarQualitySchema,
          audioFileId: str(
            "Uploaded audio file id (vg_file_...) for the avatar to lip-sync.",
          ),
          watermarkMode: watermarkModeSchema,
          numResults: numResultsField,
          isOutputTemporary: isOutputTemporaryField,
        },
        ["actorEntityId", "audioFileId"],
      ),
      execute: async (input) =>
        await runTool(
          client,
          () =>
            client.tools.generateAvatar(
              parseToolInput<Parameters<typeof client.tools.generateAvatar>[0]>(input),
            ),
          controls,
        ),
    }),

    singleFileTool({
      name: "vectorize_image",
      description: "Convert a raster image into a vector (SVG).",
      fileField: "imageFileId",
      fileFieldSchema: imageFileIdField,
      call: (input) =>
        client.tools.vectorizeImage(
          parseToolInput<Parameters<typeof client.tools.vectorizeImage>[0]>(input),
        ),
    }),

    singleFileTool({
      name: "remove_image_background",
      description: "Remove the background from an image.",
      fileField: "imageFileId",
      fileFieldSchema: imageFileIdField,
      call: (input) =>
        client.tools.removeImageBackground(
          parseToolInput<Parameters<typeof client.tools.removeImageBackground>[0]>(input),
        ),
    }),

    singleFileTool({
      name: "remove_video_background",
      description: "Remove the background from a video.",
      fileField: "videoFileId",
      fileFieldSchema: videoFileIdField,
      call: (input) =>
        client.tools.removeVideoBackground(
          parseToolInput<Parameters<typeof client.tools.removeVideoBackground>[0]>(input),
        ),
    }),

    singleFileTool({
      name: "upscale_image",
      description: "Increase the resolution of an image.",
      fileField: "imageFileId",
      fileFieldSchema: imageFileIdField,
      call: (input) =>
        client.tools.upscaleImage(
          parseToolInput<Parameters<typeof client.tools.upscaleImage>[0]>(input),
        ),
    }),

    singleFileTool({
      name: "upscale_video",
      description: "Increase the resolution of a video.",
      fileField: "videoFileId",
      fileFieldSchema: videoFileIdField,
      call: (input) =>
        client.tools.upscaleVideo(
          parseToolInput<Parameters<typeof client.tools.upscaleVideo>[0]>(input),
        ),
    }),

    singleFileTool({
      name: "image_3d_effect",
      description: "Add 3D parallax motion to a still image, producing a video.",
      fileField: "imageFileId",
      fileFieldSchema: imageFileIdField,
      call: (input) =>
        client.tools.image3dEffect(
          parseToolInput<Parameters<typeof client.tools.image3dEffect>[0]>(input),
        ),
    }),

    tool({
      name: "list_tool_executions",
      description: "List past tool executions, most recent first.",
      strict: false,
      parameters: objectSchema({ cursor: cursorField, limit: limitField, selfOnly: selfOnlyField }),
      execute: async (input) =>
        await client.tools.listToolExecutions(
          parseToolInput<Parameters<typeof client.tools.listToolExecutions>[0]>(input),
        ),
    }),

    tool({
      name: "get_tool_execution",
      description: "Fetch the current status and results of a single tool execution.",
      strict: false,
      parameters: objectSchema({ toolExecutionId: str("Tool execution id (vg_tool_...).") }, [
        "toolExecutionId",
      ]),
      execute: async (input) =>
        await client.tools.getToolExecutionInfo(
          parseToolInput<Parameters<typeof client.tools.getToolExecutionInfo>[0]>(input),
        ),
    }),

    tool({
      name: "cancel_tool_execution",
      description: "Request cancellation of an in-progress tool execution.",
      strict: false,
      parameters: objectSchema({ toolExecutionId: str("Tool execution id (vg_tool_...).") }, [
        "toolExecutionId",
      ]),
      execute: async (input) =>
        await client.tools.cancelToolExecution(
          parseToolInput<Parameters<typeof client.tools.cancelToolExecution>[0]>(input),
        ),
    }),
  ];
}
