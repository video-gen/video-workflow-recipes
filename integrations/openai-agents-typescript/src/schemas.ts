/**
 * JSON Schema fragments for VideoGen tool parameters.
 *
 * The `@openai/agents` `tool()` helper accepts either a strict Zod schema or a
 * JSON Schema. We use JSON Schema with `strict: false` because several inputs
 * (visual style, remix actions, storyboard scenes, caption styles, pronunciation
 * replacements) are free-form objects validated by the API — a strict schema
 * forbids the `additionalProperties` those fields require. The model is guided
 * by these descriptions; the API validates every field server-side.
 */

export type JsonSchemaEntry = Record<string, unknown>;

/** A non-strict JSON object schema, as required by a non-strict `tool()`. */
export type ObjectSchema = {
  type: "object";
  properties: Record<string, JsonSchemaEntry>;
  required: string[];
  additionalProperties: true;
  description?: string;
};

export function objectSchema(
  properties: Record<string, JsonSchemaEntry>,
  required: string[] = [],
): ObjectSchema {
  return { type: "object", properties, required, additionalProperties: true };
}

export const str = (description: string): JsonSchemaEntry => ({ type: "string", description });

export const num = (description: string): JsonSchemaEntry => ({ type: "number", description });

export const int = (description: string): JsonSchemaEntry => ({ type: "integer", description });

export const bool = (description: string): JsonSchemaEntry => ({ type: "boolean", description });

export const enumStr = (values: readonly string[], description: string): JsonSchemaEntry => ({
  type: "string",
  enum: [...values],
  description,
});

export const stringArray = (description: string): JsonSchemaEntry => ({
  type: "array",
  items: { type: "string" },
  description,
});

export const looseObject = (description: string): JsonSchemaEntry => ({
  type: "object",
  additionalProperties: true,
  description,
});

export const looseObjectArray = (description: string): JsonSchemaEntry => ({
  type: "array",
  items: { type: "object", additionalProperties: true },
  description,
});

export const cursorField = str("Pagination cursor from a previous response's `nextCursor`.");

export const limitField = int("Maximum number of items to return (max 100).");

export const selfOnlyField = bool(
  "When true, restrict results to items created by the API key owner rather than the whole team.",
);

export const aspectRatioSchema = {
  type: "object",
  additionalProperties: true,
  properties: {
    width: num("Aspect-ratio width (e.g. 16 for 16:9)."),
    height: num("Aspect-ratio height (e.g. 9 for 16:9)."),
  },
  required: ["width", "height"],
  description: "Output aspect ratio as a width:height pair (e.g. { width: 16, height: 9 }).",
} satisfies JsonSchemaEntry;

export const visualStyleSchema = {
  type: "object",
  additionalProperties: true,
  properties: {
    type: enumStr(
      ["STOCK", "AI_IMAGE"],
      "STOCK pulls stock footage/images; AI_IMAGE generates a styled image per section. Pass entityId for a saved visual-style entity, or aiStyle for a free-form look.",
    ),
    aiStyle: str(
      "Required when type is AI_IMAGE and entityId is omitted: free-form description of the look for every image.",
    ),
    entityId: str(
      "When type is AI_IMAGE: id of a VISUAL_STYLE entity (vg_enti_...). When set, generated images match that entity instead of aiStyle.",
    ),
    restyleFeaturedBRollWithAiStyle: bool(
      "When true (AI_IMAGE only), re-render featured b-roll images in the chosen style.",
    ),
  },
  required: ["type"],
  description: "Visual style for the generated b-roll.",
} satisfies JsonSchemaEntry;

export const visualPacingSchema = enumStr(
  ["FAST", "MEDIUM", "SLOW"],
  "How quickly visuals change. Defaults to MEDIUM.",
);

export const imageQualitySchema = enumStr(
  ["LOW", "STANDARD", "HIGH", "MAX"],
  "AI image generation quality tier. LOW is fastest/cheapest; MAX is highest quality. When omitted, your workspace's Default AI quality is used.",
);

export const avatarQualitySchema = {
  ...imageQualitySchema,
  description:
    "Avatar generation quality tier. Applies when actorEntityId is provided. Optional; when omitted, your account's Default AI quality for avatars is used.",
};

export const watermarkModeSchema = enumStr(
  ["NONE", "VIDEO_GEN", "AUTO"],
  "Whether to apply a VideoGen watermark to the output.",
);

export const remixActionsSchema = looseObjectArray(
  "Edits applied to the project, each an object with a `type`: SET_BACKGROUND_MUSIC, SET_LOGO, ENABLE_CAPTIONS, DISABLE_CAPTIONS, ADD_TRANSITIONS, ADD_ZOOM, RESIZE_PROJECT, CLEAN_UP_TRANSCRIPT, CONVERT_IMAGES_TO_VIDEOS, or CHANGE_NARRATOR (plus that action's own fields). CHANGE_NARRATOR accepts actorEntityId and optional avatarQuality. Provide at least two for a polished result, e.g. [{ type: 'ENABLE_CAPTIONS' }, { type: 'CONVERT_IMAGES_TO_VIDEOS' }].",
);

export const captionStyleSchema = looseObject(
  "Caption style overrides object. Omit for the default caption style.",
);

export const languageField = str(
  "Output language as a BCP-47 code (e.g. 'en', 'es', 'fr'). Defaults to English.",
);

export const voiceIdField = str(
  "Catalog display name (e.g. Matilda) or text-to-speech voice id (vg_voic_...).",
);

export const voiceSpeedField = num("Speech rate multiplier.");

export const actorEntityIdField = str(
  "Recommended. Optional id of an ACTOR entity (vg_enti_...) with an image reference. When set, narration is delivered by that actor avatar.",
);

export const logoFileIdField = str("Uploaded logo image file id (vg_file_...) to overlay.");

export const workflowAgentContextField = str(
  "Production notes for the AI (visual direction that is never spoken).",
);

export const numResultsField = int("Number of result variations to generate.");

export const isOutputTemporaryField = bool(
  "When true, the output is temporary and not persisted to your library.",
);

export const startFrameFileIdField = str(
  "Opening-frame still file id (vg_file_...). Used as the first frame of the clip.",
);

export const spokenDialogueField = str(
  "Exact line the subject should speak as native lip-synced speech. The model synthesizes the voice from this text.",
);

export const voiceDescriptionField = str(
  "Natural-language description of the voice that speaks spokenDialogue. Used when spokenDialogue is set.",
);

export const imageFileIdsField = stringArray(
  "Source image file ids (vg_file_...) for image-conditioned generation.",
);

export const entityIdsField = stringArray(
  "Optional actor, product, or visual-style entity ids (vg_enti_...) used as identity/reference.",
);

export const videoFileIdsField = stringArray(
  "Source video file ids (vg_file_...) for video-conditioned generation.",
);

export const imageFileIdField = str("Source image file id (vg_file_...).");

export const videoFileIdField = str("Source video file id (vg_file_...).");
