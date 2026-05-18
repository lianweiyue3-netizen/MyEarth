import { getLocationById } from "../content/locations";
import {
  INITIAL_GLOBAL_PRESET_ID,
  RESET_GLOBAL_PRESET_ID,
  SEARCH_RESULT_PRESET_ID,
  getCameraPreset
} from "./cameraPresets";
import type { CameraCommand, CameraController, CameraMode, CameraPreset } from "../shared/domain";

type CameraLikeViewer = {
  camera?: {
    flyTo?: (options: Record<string, unknown>) => void;
    setView?: (options: Record<string, unknown>) => void;
    rotateRight?: (amount: number) => void;
  };
  scene?: {
    requestRender?: () => void;
  };
  __myEarthCesium?: {
    Cartesian3?: { fromDegrees: (lon: number, lat: number, height: number) => unknown };
    Math?: { toRadians: (degrees: number) => number };
  };
};

export type CameraControllerOptions = {
  viewer: CameraLikeViewer;
  reducedMotion: boolean;
  onModeChange?: (mode: CameraMode) => void;
  onBuildingsOpportunity?: (locationId: string) => void;
};

export function createCameraController(options: CameraControllerOptions): CameraController {
  let mode: CameraMode = "introOrbit";
  let orbitFrame: number | undefined;
  let disposed = false;

  const setMode = (next: CameraMode) => {
    mode = next;
    options.onModeChange?.(next);
  };

  const stopOrbit = () => {
    if (orbitFrame !== undefined) {
      cancelAnimationFrame(orbitFrame);
      orbitFrame = undefined;
    }
  };

  const startOrbit = (nextMode: CameraMode) => {
    setMode(nextMode);
    stopOrbit();
    if (options.reducedMotion || disposed) {
      return;
    }

    const tick = () => {
      options.viewer.camera?.rotateRight?.(0.00018);
      options.viewer.scene?.requestRender?.();
      orbitFrame = requestAnimationFrame(tick);
    };
    orbitFrame = requestAnimationFrame(tick);
  };

  const flyToPreset = async (preset: CameraPreset, nextMode: CameraMode) => {
    stopOrbit();
    setMode(nextMode);

    const Cesium = options.viewer.__myEarthCesium;
    const height = preset.destinationHeightMeters;
    const destination = Cesium?.Cartesian3?.fromDegrees
      ? Cesium.Cartesian3.fromDegrees(
          preset.target.longitude,
          preset.target.latitude,
          height
        )
      : {
          longitude: preset.target.longitude,
          latitude: preset.target.latitude,
          height
        };
    const toRadians = Cesium?.Math?.toRadians ?? ((value: number) => value);
    const roll = options.reducedMotion ? 0 : preset.orientation.rollDegrees;

    options.viewer.camera?.flyTo?.({
      destination,
      orientation: {
        heading: toRadians(preset.orientation.headingDegrees),
        pitch: toRadians(preset.orientation.pitchDegrees),
        roll: toRadians(roll)
      },
      duration: options.reducedMotion
        ? preset.durationSeconds.reducedMotion
        : preset.durationSeconds.default
    });

    await Promise.resolve();
    if (!disposed && mode !== "manual") {
      startOrbit("idleOrbit");
    }
  };

  return {
    async execute(command: CameraCommand) {
      if (disposed) {
        return;
      }

      if (command.type === "startIntroOrbit") {
        const preset = getCameraPreset(INITIAL_GLOBAL_PRESET_ID);
        if (preset) {
          await flyToPreset(preset, "introOrbit");
        }
        startOrbit("introOrbit");
        return;
      }

      if (command.type === "startIdleOrbit") {
        startOrbit("idleOrbit");
        return;
      }

      if (command.type === "pauseOrbit") {
        stopOrbit();
        setMode(command.reason === "user" ? "manual" : mode);
        return;
      }

      if (command.type === "resetView") {
        const preset = getCameraPreset(RESET_GLOBAL_PRESET_ID);
        if (preset) {
          await flyToPreset(preset, "resetting");
        }
        return;
      }

      if (command.type === "flyToLocation") {
        const location = getLocationById(command.locationId);
        const preset = location ? getCameraPreset(location.cameraPresetId) : undefined;
        if (!location || !preset) {
          throw new Error(`Unknown location id: ${command.locationId}`);
        }

        if (location.kind === "city" && location.buildingDescentPreferred) {
          options.onBuildingsOpportunity?.(location.id);
        }

        await flyToPreset(
          preset,
          location.kind === "city" ? "flyingToCity" : "flyingToWonder"
        );
        return;
      }

      if (command.type === "flyToCoordinates") {
        const preset = getCameraPreset(SEARCH_RESULT_PRESET_ID);
        if (!preset) {
          throw new Error("Search result camera preset is unavailable");
        }

        await flyToPreset(
          {
            ...preset,
            target: {
              latitude: command.latitude,
              longitude: command.longitude
            },
            destinationHeightMeters:
              command.heightMeters ?? preset.destinationHeightMeters
          },
          "flyingToCity"
        );
      }
    },
    notifyManualInteraction() {
      stopOrbit();
      setMode("manual");
    },
    getMode() {
      return mode;
    },
    dispose() {
      disposed = true;
      stopOrbit();
    }
  };
}
