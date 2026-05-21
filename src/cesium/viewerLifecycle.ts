import * as Cesium from "cesium";
import { isWebGlAvailable } from "../performance/deviceProfile";
import type { ViewerCreateOptions, ViewerCreateResult } from "./cesiumTypes";

export const BUILDING_INSPECTION_MINIMUM_ZOOM_METERS = 80;

export async function createMyEarthViewer(
  options: ViewerCreateOptions
): Promise<ViewerCreateResult> {
  if (!options.token) {
    return {
      status: "missingToken",
      message:
        "Set VITE_CESIUM_ION_TOKEN to enable the live Cesium globe. The command UI remains available in limited demo mode."
    };
  }

  if (!isWebGlAvailable()) {
    return {
      status: "failed",
      error: {
        code: "webgl-unavailable",
        severity: "fatal",
        publicMessage:
          "This browser or GPU does not appear to support the 3D Earth view.",
        recoverable: false
      }
    };
  }

  try {
    Cesium.Ion.defaultAccessToken = options.token;

    const viewer = new Cesium.Viewer(options.container, {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      navigationHelpButton: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      vrButton: false,
      baseLayer: false,
      shouldAnimate: true
    });

    viewer.scene.globe.enableLighting = true;
    if (viewer.scene.skyAtmosphere) {
      viewer.scene.skyAtmosphere.show = true;
    }
    viewer.scene.requestRenderMode = false;
    viewer.scene.screenSpaceCameraController.minimumZoomDistance =
      BUILDING_INSPECTION_MINIMUM_ZOOM_METERS;
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 28_000_000;
    (viewer as any).__myEarthCesium = Cesium;

    return { status: "ready", viewer };
  } catch {
    return {
      status: "failed",
      error: {
        code: "cesium-init-failed",
        severity: "fatal",
        publicMessage:
          "The 3D Earth view could not be initialized. Try another modern browser or check Cesium token setup.",
        recoverable: false
      }
    };
  }
}

export function destroyMyEarthViewer(viewer: any): void {
  try {
    if (viewer && typeof viewer.destroy === "function" && !viewer.isDestroyed?.()) {
      viewer.destroy();
    }
  } catch {
    // Cleanup should not crash app unmount.
  }
}
