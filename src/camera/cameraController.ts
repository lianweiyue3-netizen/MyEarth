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
    positionCartographic?: {
      longitude: number;
      latitude: number;
      height: number;
    };
    pickEllipsoid?: (windowPosition: unknown, ellipsoid?: unknown) => unknown;
  };
  scene?: {
    canvas?: {
      clientWidth: number;
      clientHeight: number;
    };
    globe?: {
      ellipsoid?: unknown;
    };
    requestRender?: () => void;
  };
  __myEarthCesium?: {
    Cartesian3?: {
      fromDegrees: (lon: number, lat: number, height: number) => unknown;
      fromRadians?: (lon: number, lat: number, height: number) => unknown;
    };
    Cartesian2?: new (x: number, y: number) => unknown;
    Cartographic?: {
      fromCartesian: (
        cartesian: unknown,
        ellipsoid?: unknown
      ) => { longitude: number; latitude: number };
    };
    Math?: { toRadians: (degrees: number) => number };
  };
};

export type CameraControllerOptions = {
  viewer: CameraLikeViewer;
  reducedMotion: boolean;
  onModeChange?: (mode: CameraMode) => void;
};

export function createCameraController(options: CameraControllerOptions): CameraController {
  let mode: CameraMode = "introOrbit";
  let orbitFrame: number | undefined;
  let zoomAlignFrame: number | undefined;
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

  const stopZoomAlignment = () => {
    if (zoomAlignFrame !== undefined) {
      cancelAnimationFrame(zoomAlignFrame);
      zoomAlignFrame = undefined;
    }
  };

  const startOrbit = (nextMode: CameraMode) => {
    setMode(nextMode);
    stopOrbit();
    stopZoomAlignment();
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

  const flyToPreset = async (
    preset: CameraPreset,
    nextMode: CameraMode,
    resumeOrbit = true
  ) => {
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
    if (disposed || mode === "manual") {
      return;
    }

    if (resumeOrbit) {
      startOrbit("idleOrbit");
    } else {
      setMode("manual");
    }
  };

  const alignZoomedOutView = () => {
    const camera = options.viewer.camera;
    const position = camera?.positionCartographic;
    const cartesian = options.viewer.__myEarthCesium?.Cartesian3;
    const Cartesian2 = options.viewer.__myEarthCesium?.Cartesian2;
    const Cartographic = options.viewer.__myEarthCesium?.Cartographic;
    const toRadians =
      options.viewer.__myEarthCesium?.Math?.toRadians ?? ((value: number) => value);

    if (!position || !cartesian || !camera?.setView) {
      return;
    }

    const canvas = options.viewer.scene?.canvas;
    const ellipsoid = options.viewer.scene?.globe?.ellipsoid;
    const centerCartesian =
      canvas && Cartesian2 && camera.pickEllipsoid
        ? camera.pickEllipsoid(
            new Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2),
            ellipsoid
          )
        : undefined;
    const centerCartographic =
      centerCartesian && Cartographic
        ? Cartographic.fromCartesian(centerCartesian, ellipsoid)
        : position;

    const destination = cartesian.fromRadians
      ? cartesian.fromRadians(
          centerCartographic.longitude,
          centerCartographic.latitude,
          position.height
        )
      : cartesian.fromDegrees(
          (centerCartographic.longitude * 180) / Math.PI,
          (centerCartographic.latitude * 180) / Math.PI,
          position.height
        );

    camera.setView({
      destination,
      orientation: {
        heading: 0,
        pitch: toRadians(-90),
        roll: 0
      }
    });
    options.viewer.scene?.requestRender?.();
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

        await flyToPreset(
          preset,
          location.kind === "city" ? "flyingToCity" : "flyingToWonder",
          false
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
          "flyingToCity",
          false
        );
      }
    },
    notifyManualInteraction() {
      stopOrbit();
      stopZoomAlignment();
      setMode("manual");
    },
    notifyManualZoom(_deltaY) {
      stopOrbit();
      setMode("manual");

      if (disposed) {
        return;
      }

      stopZoomAlignment();
      zoomAlignFrame = requestAnimationFrame(() => {
        zoomAlignFrame = undefined;
        alignZoomedOutView();
      });
    },
    getMode() {
      return mode;
    },
    dispose() {
      disposed = true;
      stopOrbit();
      stopZoomAlignment();
    }
  };
}
