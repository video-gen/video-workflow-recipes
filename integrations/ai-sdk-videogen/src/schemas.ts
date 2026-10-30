import type { JsonObject } from "@videogen/sdk";
import { z } from "zod";

/**
 * Pins a permissive, JSON-Schema-representable runtime schema to the SDK's
 * precise type `T`. The complex SDK request fields (remix actions, caption
 * styles, storyboard scenes, pronunciation replacements) are large unions we do
 * not re-model field-by-field in zod. We keep a loose object/array schema for
 * the wire format and annotate it with the SDK type so the value stays
 * assignable when forwarded to the SDK. The API still validates these fields.
 */
export function sdkFieldSchema<T>(runtimeSchema: z.ZodTypeAny, description: string): z.ZodType<T> {
  // We intentionally use an unsafe `as` assertion here because the loose runtime
  // schema exists only to produce a JSON Schema for the model; the actual field
  // is validated by the API, and its true type is the SDK's `T`.
  return runtimeSchema.describe(description) as unknown as z.ZodType<T>;
}

const looseObject = z.record(z.string(), z.unknown());

export const cursorField = z
  .string()
  .optional()
  .describe("Pagination cursor from a previous response's `nextCursor`.");

export const limitField = z
  .number()
  .int()
  .positive()
  .max(100)
  .optional()
  .describe("Maximum number of items to return.");

export const selfOnlyField = z
  .boolean()
  .optional()
  .describe(
    "When true, restrict results to items created by the API key owner rather than the whole team.",
  );

export const aspectRatioSchema = z
  .object({
    width: z.number().positive().describe("Aspect-ratio width (e.g. 16 for 16:9)."),
    height: z.number().positive().describe("Aspect-ratio height (e.g. 9 for 16:9)."),
  })
  .describe("Output aspect ratio as a width:height pair (e.g. { width: 16, height: 9 }).");

export const visualStyleSchema = z
  .object({
    type: z
      .enum(["STOCK", "AI_IMAGE"])
      .describe(
        "STOCK pulls stock footage/images; AI_IMAGE generates a styled image per section. Pass entityId for a saved visual-style entity, or aiStyle for a free-form look.",
      ),
    aiStyle: z
      .string()
      .optional()
      .describe(
        "Required when type is AI_IMAGE and entityId is omitted: free-form description of the look for every image.",
      ),
    entityId: z
      .string()
      .optional()
      .describe(
        "When type is AI_IMAGE: id of a VISUAL_STYLE entity (vg_enti_...). When set, generated images match that entity instead of aiStyle.",
      ),
    restyleFeaturedBRollWithAiStyle: z
      .boolean()
      .optional()
      .describe("When true (AI_IMAGE only), re-render featured b-roll images in the chosen style."),
  })
  .describe("Visual style for the generated b-roll.");

export const visualPacingSchema = z
  .enum(["FAST", "MEDIUM", "SLOW"])
  .describe("How quickly visuals change. Defaults to MEDIUM.");

export const imageQualitySchema = z
  .enum(["LOW", "STANDARD", "HIGH", "MAX"])
  .describe(
    "AI image generation quality tier. LOW is fastest/cheapest; MAX is highest quality. Optional; when omitted, your workspace's Default AI quality is used.",
  );

export const avatarQualitySchema = imageQualitySchema.describe(
  "Avatar generation quality tier. Applies when actorEntityId is provided. Optional; when omitted, your account's Default AI quality for avatars is used.",
);

export const watermarkModeSchema = z
  .enum(["NONE", "VIDEO_GEN", "AUTO"])
  .describe("Whether to apply a VideoGen watermark to the output.");

export const remixActionsSchema = sdkFieldSchema<unknown[]>(
  z.array(looseObject),
  "Edits applied to the project, each an object with a `type`: SET_BACKGROUND_MUSIC, SET_LOGO, ENABLE_CAPTIONS, DISABLE_CAPTIONS, ADD_TRANSITIONS, ADD_ZOOM, RESIZE_PROJECT, CLEAN_UP_TRANSCRIPT, CONVERT_IMAGES_TO_VIDEOS, or CHANGE_NARRATOR (plus that action's own fields). CHANGE_NARRATOR accepts actorEntityId and optional avatarQuality. Provide at least two for a polished result, e.g. [{ type: 'ENABLE_CAPTIONS' }, { type: 'CONVERT_IMAGES_TO_VIDEOS' }].",
);

export const captionStyleSchema = sdkFieldSchema<JsonObject | null>(
  looseObject.nullable(),
  "Caption style overrides object, or null to hide captions. Omit for the default caption style.",
);

export const languageField = z
  .string()
  .optional()
  .describe("Output language as a BCP-47 code (e.g. 'en', 'es', 'fr'). Defaults to English.");

export const voiceIdField = z
  .string()
  .optional()
  .describe("Catalog display name (e.g. Matilda) or text-to-speech voice id (vg_voic_...).");

export const voiceSpeedField = z.number().positive().optional().describe("Speech rate multiplier.");

export const actorEntityIdField = z
  .string()
  .optional()
  .describe(
    "Recommended. Optional id of an ACTOR entity (vg_enti_...) with an image reference. When set, narration is delivered by that actor avatar.",
  );

export const logoFileIdField = z
  .string()
  .optional()
  .describe("Uploaded logo image file id (vg_file_...) to overlay.");

export const workflowAgentContextField = z
  .string()
  .optional()
  .describe("Production notes for the AI (visual direction that is never spoken).");

export const numResultsField = z
  .number()
  .int()
  .positive()
  .optional()
  .describe("Number of result variations to generate.");

export const isOutputTemporaryField = z
  .boolean()
  .optional()
  .describe("When true, the output is temporary and not persisted to your library.");

export const spokenDialogueField = z
  .string()
  .optional()
  .describe(
    "Exact line the subject should speak as native lip-synced speech. The model synthesizes the voice from this text.",
  );

export const voiceDescriptionField = z
  .string()
  .optional()
  .describe(
    "Natural-language description of the voice that speaks spokenDialogue. Used when spokenDialogue is set.",
  );

export const startFrameFileIdField = z
  .string()
  .optional()
  .describe("Opening-frame still file id (vg_file_...). Used as the first frame of the clip.");

export const imageFileIdsField = z
  .array(z.string())
  .optional()
  .describe("Source image file ids (vg_file_...) for image-conditioned generation.");

export const entityIdsField = z
  .array(z.string())
  .optional()
  .describe(
    "Optional actor, product, or visual-style entity ids (vg_enti_...) used as identity/reference.",
  );

export const videoFileIdsField = z
  .array(z.string())
  .optional()
  .describe("Source video file ids (vg_file_...) for video-conditioned generation.");

export const imageFileIdField = z.string().describe("Source image file id (vg_file_...).");

export const videoFileIdField = z.string().describe("Source video file id (vg_file_...).");
