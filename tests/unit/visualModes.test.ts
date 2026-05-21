import { describe, expect, it } from "vitest";
import { getVisualMode, visualModes } from "../../src/layers/visualModes";

describe("visual modes", () => {
  it("defines all five ordered modes with unique ids", () => {
    expect(visualModes.map((mode) => mode.id)).toEqual([
      "satellite",
      "political",
      "nightLights",
      "terrainEmphasis",
      "cleanGlobe"
    ]);
    expect(new Set(visualModes.map((mode) => mode.id)).size).toBe(5);
  });

  it("keeps radar opacity in range", () => {
    for (const mode of visualModes) {
      expect(mode.radarOpacity).toBeGreaterThanOrEqual(0);
      expect(mode.radarOpacity).toBeLessThanOrEqual(1);
    }
  });

  it("sets night lights and clean globe behavior", () => {
    expect(getVisualMode("nightLights").imageryStrategy).toBe("blackMarble");
    expect(getVisualMode("cleanGlobe").defaultLayers.weatherRadar).toBe(false);
  });
});
