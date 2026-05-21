import { describe, expect, it } from "vitest";
import {
  locationPanelContentById,
  topicContent
} from "../../src/content/learningContent";
import { cityLocations, wonderLocations } from "../../src/content/locations";
import { sourceNotesById } from "../../src/content/sourceNotes";

describe("learning content", () => {
  it("covers required topics, wonders, and cities", () => {
    expect(Object.keys(topicContent)).toEqual(
      expect.arrayContaining([
        "terrain",
        "climate",
        "ecosystems",
        "atmosphere",
        "water",
        "ice",
        "human-impact",
        "urbanization"
      ])
    );

    for (const location of [...wonderLocations, ...cityLocations]) {
      expect(locationPanelContentById[location.id]).toBeDefined();
    }
  });

  it("uses valid suggested layers and source references", () => {
    for (const panel of Object.values(locationPanelContentById)) {
      expect(panel.sourceNoteIds.every((id) => sourceNotesById[id])).toBe(true);
      expect(panel.suggestedLayers.every((id) => typeof id === "string")).toBe(true);
    }
  });

  it("does not suggest the removed aurora layer", () => {
    for (const panel of Object.values(locationPanelContentById)) {
      expect(panel.suggestedLayers).not.toContain("aurora");
      expect(panel.illustrativeDisclaimer).toBeUndefined();
    }
  });
});
