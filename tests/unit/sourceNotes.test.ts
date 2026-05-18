import { describe, expect, it } from "vitest";
import { sourceNotes, validateSourceNotes } from "../../src/content/sourceNotes";
import type { LearningTopic } from "../../src/shared/domain";

describe("source notes", () => {
  it("uses unique ids and complete metadata", () => {
    expect(validateSourceNotes()).toEqual([]);
    expect(new Set(sourceNotes.map((note) => note.id)).size).toBe(sourceNotes.length);
  });

  it("contains topic, wonder, and city notes", () => {
    expect(sourceNotes.some((note) => note.id === "topic-terrain")).toBe(true);
    expect(sourceNotes.some((note) => note.id === "location-mount-everest")).toBe(true);
    expect(sourceNotes.some((note) => note.id === "location-new-york-city")).toBe(true);
  });

  it("covers every required learning topic", () => {
    const topics: LearningTopic[] = [
      "terrain",
      "climate",
      "ecosystems",
      "atmosphere",
      "water",
      "ice",
      "human-impact",
      "urbanization",
      "geology",
      "biodiversity"
    ];

    for (const topic of topics) {
      expect(sourceNotes.some((note) => note.topics.includes(topic))).toBe(true);
    }
  });

  it("rejects invalid references", () => {
    expect(
      validateSourceNotes([
        {
          id: "broken",
          title: "",
          publisher: "",
          url: "not-a-url",
          purpose: "",
          topics: ["terrain"]
        }
      ])
    ).toContain("Source note broken is missing required metadata");
  });
});
