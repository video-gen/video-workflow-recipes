import { describe, expect, it } from "vitest";
import { createVideogenTools } from "../src/index";

// The canonical VideoGen tool surface every framework integration exposes.
const EXPECTED_TOOL_NAMES = new Set<string>([
  // workflows
  "script_to_video",
  "voiceover_to_video",
  "slideshow_to_video",
  "storyboard_to_video",
  "prompt_to_video_clip",
  "video_to_video",
  "list_workflow_runs",
  "get_workflow_run",
  "cancel_workflow_run",
  // media tools
  "generate_image",
  "generate_motion_graphic",
  "generate_video_clip",
  "text_to_speech",
  "generate_sound_effect",
  "generate_music",
  "generate_avatar",
  "vectorize_image",
  "remove_image_background",
  "remove_video_background",
  "upscale_image",
  "upscale_video",
  "image_3d_effect",
  "list_tool_executions",
  "get_tool_execution",
  "cancel_tool_execution",
  // projects
  "list_projects",
  "get_project",
  "export_project",
  "remix_project",
  "list_project_remix_actions",
  // files
  "upload_file",
  "get_file",
  "list_files",
  // resources + account
  "list_tts_voices",
  "list_languages",
  "get_me",
]);

// Building tools never touches the network, so any non-empty key works offline.
const DUMMY_API_KEY = "vg_offline_test_key";

const toolNames = (tools: { name: string }[]): Set<string> =>
  new Set(tools.map((videogenTool) => videogenTool.name));

describe("createVideogenTools", () => {
  it("builds the full canonical VideoGen tool surface", () => {
    const tools = createVideogenTools({ apiKey: DUMMY_API_KEY });
    expect(toolNames(tools)).toEqual(EXPECTED_TOOL_NAMES);
  });

  it("honors the include filter", () => {
    const tools = createVideogenTools({
      apiKey: DUMMY_API_KEY,
      include: ["get_me", "list_files"],
    });
    expect(toolNames(tools)).toEqual(new Set(["get_me", "list_files"]));
  });

  it("throws a helpful error when no key is available", () => {
    const previous = process.env.VIDEOGEN_API_KEY;
    delete process.env.VIDEOGEN_API_KEY;
    try {
      expect(() => createVideogenTools({})).toThrow(/VideoGen API key/);
    } finally {
      if (previous != null) {
        process.env.VIDEOGEN_API_KEY = previous;
      }
    }
  });
});
