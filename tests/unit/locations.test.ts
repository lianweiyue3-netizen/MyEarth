import { describe, expect, it } from "vitest";
import {
  cityLocations,
  earthLocations,
  locationsById,
  wonderLocations
} from "../../src/content/locations";
import { validateLocations } from "../../src/content/validateContent";
import { cameraPresets } from "../../src/camera/cameraPresets";

describe("location content", () => {
  it("defines exactly eight wonders and seven cities", () => {
    expect(wonderLocations).toHaveLength(8);
    expect(cityLocations).toHaveLength(7);
    expect(locationsById["mount-everest"].name).toBe("Mount Everest");
  });

  it("keeps wonder facts, coordinates, layers, and sources valid", () => {
    expect(validateLocations(earthLocations, cameraPresets)).toEqual([]);
    for (const location of earthLocations) {
      expect(location.coordinates.latitude).toBeGreaterThanOrEqual(-90);
      expect(location.coordinates.latitude).toBeLessThanOrEqual(90);
      expect(location.coordinates.longitude).toBeGreaterThanOrEqual(-180);
      expect(location.coordinates.longitude).toBeLessThanOrEqual(180);
      expect(location.facts.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("sets building descents only for city shortcuts", () => {
    expect(cityLocations.every((location) => location.buildingDescentPreferred)).toBe(true);
    expect(wonderLocations.every((location) => !location.buildingDescentPreferred)).toBe(true);
  });
});
