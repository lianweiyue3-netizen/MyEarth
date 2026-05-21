import type { CameraPreset } from "./cameraTypes";

export type { CameraPreset } from "./cameraTypes";

export const INITIAL_GLOBAL_PRESET_ID = "initial-global";
export const RESET_GLOBAL_PRESET_ID = "reset-global";
export const SEARCH_RESULT_PRESET_ID = "search-result";

export const LOCATION_CAMERA_PRESET_IDS = [
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

export const REQUIRED_CAMERA_PRESET_IDS = [
  INITIAL_GLOBAL_PRESET_ID,
  RESET_GLOBAL_PRESET_ID,
  SEARCH_RESULT_PRESET_ID,
  ...LOCATION_CAMERA_PRESET_IDS
] as const;

export type CameraPresetId = (typeof REQUIRED_CAMERA_PRESET_IDS)[number];

export const cameraPresets = [
  {
    id: INITIAL_GLOBAL_PRESET_ID,
    target: {
      latitude: 18,
      longitude: -35
    },
    destinationHeightMeters: 18_000_000,
    orientation: {
      headingDegrees: 0,
      pitchDegrees: -90,
      rollDegrees: 0
    },
    durationSeconds: {
      default: 0.1,
      reducedMotion: 0
    }
  },
  {
    id: RESET_GLOBAL_PRESET_ID,
    target: {
      latitude: 0,
      longitude: 0
    },
    destinationHeightMeters: 22_000_000,
    orientation: {
      headingDegrees: 0,
      pitchDegrees: -90,
      rollDegrees: 0
    },
    durationSeconds: {
      default: 2.2,
      reducedMotion: 0.4
    }
  },
  {
    id: SEARCH_RESULT_PRESET_ID,
    target: {
      latitude: 0,
      longitude: 0
    },
    destinationHeightMeters: 6_500,
    orientation: {
      headingDegrees: 0,
      pitchDegrees: -90,
      rollDegrees: 0
    },
    durationSeconds: {
      default: 3,
      reducedMotion: 0.6
    }
  },
  {
    id: "mount-everest",
    target: {
      latitude: 27.9881,
      longitude: 86.925,
      heightMeters: 8849
    },
    destinationHeightMeters: 120_000,
    orientation: {
      headingDegrees: 0,
      pitchDegrees: -90,
      rollDegrees: 0
    },
    durationSeconds: {
      default: 4.2,
      reducedMotion: 1.1
    }
  },
  {
    id: "grand-canyon",
    target: {
      latitude: 36.1069,
      longitude: -112.1129,
      heightMeters: 2100
    },
    destinationHeightMeters: 450_000,
    orientation: {
      headingDegrees: 0,
      pitchDegrees: -90,
      rollDegrees: 0
    },
    durationSeconds: {
      default: 4,
      reducedMotion: 1
    }
  },
  {
    id: "amazon-rainforest",
    target: {
      latitude: -3.4653,
      longitude: -62.2159,
      heightMeters: 120
    },
    destinationHeightMeters: 1_400_000,
    orientation: {
      headingDegrees: 0,
      pitchDegrees: -90,
      rollDegrees: 0
    },
    durationSeconds: {
      default: 4.1,
      reducedMotion: 1
    }
  },
  {
    id: "great-barrier-reef",
    target: {
      latitude: -18.2871,
      longitude: 147.6992,
      heightMeters: 1
    },
    destinationHeightMeters: 650_000,
    orientation: {
      headingDegrees: 0,
      pitchDegrees: -90,
      rollDegrees: 0
    },
    durationSeconds: {
      default: 3.8,
      reducedMotion: 0.9
    }
  },
  {
    id: "sahara-desert",
    target: {
      latitude: 23.4162,
      longitude: 25.6628,
      heightMeters: 450
    },
    destinationHeightMeters: 1_800_000,
    orientation: {
      headingDegrees: 0,
      pitchDegrees: -90,
      rollDegrees: 0
    },
    durationSeconds: {
      default: 4,
      reducedMotion: 1
    }
  },
  {
    id: "antarctica",
    target: {
      latitude: -82.8628,
      longitude: 135,
      heightMeters: 2800
    },
    destinationHeightMeters: 2_500_000,
    orientation: {
      headingDegrees: 0,
      pitchDegrees: -90,
      rollDegrees: 0
    },
    durationSeconds: {
      default: 4.4,
      reducedMotion: 1.2
    }
  },
  {
    id: "himalayas",
    target: {
      latitude: 29,
      longitude: 83,
      heightMeters: 5000
    },
    destinationHeightMeters: 1_200_000,
    orientation: {
      headingDegrees: 0,
      pitchDegrees: -90,
      rollDegrees: 0
    },
    durationSeconds: {
      default: 4,
      reducedMotion: 1
    }
  },
  {
    id: "aurora-region",
    target: {
      latitude: 68.5,
      longitude: -50,
      heightMeters: 1000
    },
    destinationHeightMeters: 2_600_000,
    orientation: {
      headingDegrees: 0,
      pitchDegrees: -90,
      rollDegrees: 0
    },
    durationSeconds: {
      default: 4.2,
      reducedMotion: 1
    }
  },
  {
    id: "new-york-city",
    target: {
      latitude: 40.7128,
      longitude: -74.006,
      heightMeters: 10
    },
    destinationHeightMeters: 3_200,
    orientation: {
      headingDegrees: 0,
      pitchDegrees: -90,
      rollDegrees: 0
    },
    durationSeconds: {
      default: 3.4,
      reducedMotion: 0.8
    }
  },
  {
    id: "tokyo",
    target: {
      latitude: 35.6762,
      longitude: 139.6503,
      heightMeters: 40
    },
    destinationHeightMeters: 3_600,
    orientation: {
      headingDegrees: 0,
      pitchDegrees: -90,
      rollDegrees: 0
    },
    durationSeconds: {
      default: 3.4,
      reducedMotion: 0.8
    }
  },
  {
    id: "london",
    target: {
      latitude: 51.5074,
      longitude: -0.1278,
      heightMeters: 15
    },
    destinationHeightMeters: 3_200,
    orientation: {
      headingDegrees: 0,
      pitchDegrees: -90,
      rollDegrees: 0
    },
    durationSeconds: {
      default: 3.4,
      reducedMotion: 0.8
    }
  },
  {
    id: "paris",
    target: {
      latitude: 48.8566,
      longitude: 2.3522,
      heightMeters: 35
    },
    destinationHeightMeters: 3_000,
    orientation: {
      headingDegrees: 0,
      pitchDegrees: -90,
      rollDegrees: 0
    },
    durationSeconds: {
      default: 3.4,
      reducedMotion: 0.8
    }
  },
  {
    id: "dubai",
    target: {
      latitude: 25.2048,
      longitude: 55.2708,
      heightMeters: 20
    },
    destinationHeightMeters: 4_200,
    orientation: {
      headingDegrees: 0,
      pitchDegrees: -90,
      rollDegrees: 0
    },
    durationSeconds: {
      default: 3.4,
      reducedMotion: 0.8
    }
  },
  {
    id: "san-francisco",
    target: {
      latitude: 37.7749,
      longitude: -122.4194,
      heightMeters: 16
    },
    destinationHeightMeters: 3_400,
    orientation: {
      headingDegrees: 0,
      pitchDegrees: -90,
      rollDegrees: 0
    },
    durationSeconds: {
      default: 3.4,
      reducedMotion: 0.8
    }
  },
  {
    id: "singapore",
    target: {
      latitude: 1.3521,
      longitude: 103.8198,
      heightMeters: 15
    },
    destinationHeightMeters: 2_800,
    orientation: {
      headingDegrees: 0,
      pitchDegrees: -90,
      rollDegrees: 0
    },
    durationSeconds: {
      default: 3.4,
      reducedMotion: 0.8
    }
  }
] as const satisfies readonly CameraPreset[];

export const cameraPresetLookup = Object.freeze(
  Object.fromEntries(cameraPresets.map((preset) => [preset.id, preset]))
) as Readonly<Record<CameraPresetId, CameraPreset>>;

export type CameraPresetValidationIssue = {
  field: string;
  message: string;
};

export type CameraPresetValidationResult = {
  valid: boolean;
  issues: CameraPresetValidationIssue[];
};

export const getCameraPreset = (id: string): CameraPreset | undefined => {
  const lookup = cameraPresetLookup as Readonly<Record<string, CameraPreset | undefined>>;
  return lookup[id];
};

export const requireCameraPreset = (id: string): CameraPreset => {
  const preset = getCameraPreset(id);

  if (!preset) {
    throw new Error(`Unknown camera preset: ${id}`);
  }

  return preset;
};

export const validateCameraPreset = (
  preset: CameraPreset
): CameraPresetValidationResult => {
  const issues: CameraPresetValidationIssue[] = [];

  addRangeIssue(issues, "target.latitude", preset.target.latitude, -90, 90);
  addRangeIssue(issues, "target.longitude", preset.target.longitude, -180, 180);

  if (
    preset.target.heightMeters !== undefined &&
    !isPositiveFiniteNumber(preset.target.heightMeters)
  ) {
    issues.push({
      field: "target.heightMeters",
      message: "Target height must be a finite positive number."
    });
  }

  if (!isPositiveFiniteNumber(preset.destinationHeightMeters)) {
    issues.push({
      field: "destinationHeightMeters",
      message: "Destination height must be a finite positive number."
    });
  }

  addFiniteIssue(issues, "orientation.headingDegrees", preset.orientation.headingDegrees);
  addFiniteIssue(issues, "orientation.pitchDegrees", preset.orientation.pitchDegrees);
  addFiniteIssue(issues, "orientation.rollDegrees", preset.orientation.rollDegrees);

  if (!isPositiveFiniteNumber(preset.durationSeconds.default)) {
    issues.push({
      field: "durationSeconds.default",
      message: "Default duration must be a finite positive number."
    });
  }

  if (
    !Number.isFinite(preset.durationSeconds.reducedMotion) ||
    preset.durationSeconds.reducedMotion < 0
  ) {
    issues.push({
      field: "durationSeconds.reducedMotion",
      message: "Reduced-motion duration must be a finite non-negative number."
    });
  }

  if (preset.durationSeconds.reducedMotion > preset.durationSeconds.default) {
    issues.push({
      field: "durationSeconds.reducedMotion",
      message: "Reduced-motion duration must not exceed default duration."
    });
  }

  return {
    valid: issues.length === 0,
    issues
  };
};

export const validateCameraPresets = (
  presets: readonly CameraPreset[] = cameraPresets
): CameraPresetValidationResult => {
  const issues = presets.flatMap((preset) =>
    validateCameraPreset(preset).issues.map((issue) => ({
      field: `${preset.id}.${issue.field}`,
      message: issue.message
    }))
  );
  const seenIds = new Set<string>();

  for (const preset of presets) {
    if (seenIds.has(preset.id)) {
      issues.push({
        field: preset.id,
        message: "Camera preset ids must be unique."
      });
    }

    seenIds.add(preset.id);
  }

  return {
    valid: issues.length === 0,
    issues
  };
};

const isPositiveFiniteNumber = (value: number): boolean =>
  Number.isFinite(value) && value > 0;

const addFiniteIssue = (
  issues: CameraPresetValidationIssue[],
  field: string,
  value: number
): void => {
  if (!Number.isFinite(value)) {
    issues.push({
      field,
      message: "Value must be finite."
    });
  }
};

const addRangeIssue = (
  issues: CameraPresetValidationIssue[],
  field: string,
  value: number,
  min: number,
  max: number
): void => {
  if (!Number.isFinite(value) || value < min || value > max) {
    issues.push({
      field,
      message: `Value must be finite and between ${min} and ${max}.`
    });
  }
};
