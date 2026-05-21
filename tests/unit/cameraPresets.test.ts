import { describe, expect, it } from "vitest";

import {
  INITIAL_GLOBAL_PRESET_ID,
  LOCATION_CAMERA_PRESET_IDS,
  RESET_GLOBAL_PRESET_ID,
  REQUIRED_CAMERA_PRESET_IDS,
  SEARCH_RESULT_PRESET_ID,
  cameraPresets,
  getCameraPreset,
  requireCameraPreset,
  validateCameraPreset,
  validateCameraPresets
} from "../../src/camera/cameraPresets";
import type { CameraPreset } from "../../src/camera/cameraTypes";

const expectedLocationPresetIds = [
  "mount-everest",
  "grand-canyon",
  "amazon-rainforest",
  "great-barrier-reef",
  "sahara-desert",
  "antarctica",
  "himalayas",
  "aurora-region",
  "new-york-city",
  "tokyo",
  "london",
  "paris",
  "dubai",
  "san-francisco",
  "singapore"
] as const;

const makeInvalidPreset = (overrides: Partial<CameraPreset>): CameraPreset => ({
  ...cameraPresets[0],
  ...overrides,
  target: {
    ...cameraPresets[0].target,
    ...overrides.target
  },
  orientation: {
    ...cameraPresets[0].orientation,
    ...overrides.orientation
  },
  durationSeconds: {
    ...cameraPresets[0].durationSeconds,
    ...overrides.durationSeconds
  }
});

describe("camera presets", () => {
  it("exports the required stable preset ids", () => {
    expect(LOCATION_CAMERA_PRESET_IDS).toEqual(expectedLocationPresetIds);
    expect(REQUIRED_CAMERA_PRESET_IDS).toEqual([
      INITIAL_GLOBAL_PRESET_ID,
      RESET_GLOBAL_PRESET_ID,
      SEARCH_RESULT_PRESET_ID,
      ...expectedLocationPresetIds
    ]);
  });

  it("has one valid preset for every required id", () => {
    expect(cameraPresets).toHaveLength(REQUIRED_CAMERA_PRESET_IDS.length);
    expect(new Set(cameraPresets.map((preset) => preset.id)).size).toBe(
      cameraPresets.length
    );

    for (const id of REQUIRED_CAMERA_PRESET_IDS) {
      const preset = getCameraPreset(id);

      expect(preset, id).toBeDefined();
      expect(validateCameraPreset(preset as CameraPreset), id).toEqual({
        valid: true,
        issues: []
      });
    }

    expect(validateCameraPresets()).toEqual({
      valid: true,
      issues: []
    });
  });

  it("keeps initial and reset presets distinct", () => {
    const initial = requireCameraPreset(INITIAL_GLOBAL_PRESET_ID);
    const reset = requireCameraPreset(RESET_GLOBAL_PRESET_ID);

    expect(initial.id).toBe("initial-global");
    expect(reset.id).toBe("reset-global");
    expect(initial).not.toEqual(reset);
  });

  it("exposes the search-result fallback preset", () => {
    const preset = requireCameraPreset(SEARCH_RESULT_PRESET_ID);

    expect(preset.id).toBe("search-result");
    expect(preset.destinationHeightMeters).toBeLessThanOrEqual(6_500);
  });

  it("uses close city inspection presets", () => {
    for (const id of [
      "new-york-city",
      "tokyo",
      "london",
      "paris",
      "dubai",
      "san-francisco",
      "singapore"
    ]) {
      expect(requireCameraPreset(id).destinationHeightMeters).toBeLessThanOrEqual(
        4_500
      );
    }
  });

  it("keeps location and search cameras top-down", () => {
    for (const id of [
      SEARCH_RESULT_PRESET_ID,
      ...expectedLocationPresetIds
    ]) {
      const preset = requireCameraPreset(id);

      expect(preset.orientation.headingDegrees).toBe(0);
      expect(preset.orientation.pitchDegrees).toBe(-90);
      expect(preset.orientation.rollDegrees).toBe(0);
    }
  });

  it("returns undefined for optional lookup misses and throws for required lookup misses", () => {
    expect(getCameraPreset("not-a-preset")).toBeUndefined();
    expect(() => requireCameraPreset("not-a-preset")).toThrow(
      "Unknown camera preset: not-a-preset"
    );
  });

  it("rejects reduced-motion durations that exceed default duration", () => {
    const result = validateCameraPreset(
      makeInvalidPreset({
        durationSeconds: {
          default: 1,
          reducedMotion: 2
        }
      })
    );

    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual({
      field: "durationSeconds.reducedMotion",
      message: "Reduced-motion duration must not exceed default duration."
    });
  });

  it("rejects non-finite or non-positive heights", () => {
    const targetHeightResult = validateCameraPreset(
      makeInvalidPreset({
        target: {
          latitude: 0,
          longitude: 0,
          heightMeters: Number.POSITIVE_INFINITY
        }
      })
    );
    const destinationHeightResult = validateCameraPreset(
      makeInvalidPreset({
        destinationHeightMeters: 0
      })
    );

    expect(targetHeightResult.issues).toContainEqual({
      field: "target.heightMeters",
      message: "Target height must be a finite positive number."
    });
    expect(destinationHeightResult.issues).toContainEqual({
      field: "destinationHeightMeters",
      message: "Destination height must be a finite positive number."
    });
  });

  it("rejects non-finite pitch and heading values", () => {
    const result = validateCameraPreset(
      makeInvalidPreset({
        orientation: {
          headingDegrees: Number.POSITIVE_INFINITY,
          pitchDegrees: Number.NaN,
          rollDegrees: 0
        }
      })
    );

    expect(result.issues).toEqual(
      expect.arrayContaining([
        {
          field: "orientation.headingDegrees",
          message: "Value must be finite."
        },
        {
          field: "orientation.pitchDegrees",
          message: "Value must be finite."
        }
      ])
    );
  });
});
