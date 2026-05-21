import type { WeatherRadarService } from "../shared/domain";
import type {
  CesiumLayerAdapter,
  CesiumLikeViewer,
  LayerAdapterContext
} from "./layerDefinitions";
import { available, disabled, failed } from "./layerDefinitions";

type RadarImageryLayer = Record<string, unknown> & {
  alpha?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  gamma?: number;
  show?: boolean;
};

type RadarLayerState = {
  layer: RadarImageryLayer;
  modeOpacity: number;
};

type RadarRequestState = {
  desiredVisible: boolean;
  requestId: number;
};

const DEFAULT_RADAR_OPACITY = 0.68;
const RADAR_MAXIMUM_LEVEL = 7;
const radarLayers = new WeakMap<CesiumLikeViewer, RadarLayerState>();
const radarRequests = new WeakMap<CesiumLikeViewer, RadarRequestState>();

export function createWeatherRadarLayerAdapter(
  service: WeatherRadarService
): CesiumLayerAdapter {
  return {
    id: "weatherRadar",
    async setVisible(context, visible) {
      const request = nextRadarRequest(context.viewer, visible);
      const existing = radarLayers.get(context.viewer);
      if (!visible) {
        if (existing) {
          removeRadarLayer(context.viewer, existing.layer);
          radarLayers.delete(context.viewer);
        }
        context.viewer.scene?.requestRender?.();
        return available;
      }

      if (context.quality.radar === "off") {
        return disabled("Weather radar is disabled by the current quality mode.");
      }

      if (existing) {
        applyRadarLayerStyle(existing, context);
        context.viewer.scene?.requestRender?.();
        return available;
      }

      try {
        const frame = await service.getLatestFrame();
        if (!isLatestVisibleRequest(context.viewer, request.requestId)) {
          return available;
        }

        const Cesium = context.viewer.__myEarthCesium;
        const url = `${frame.host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;

        if (!Cesium?.UrlTemplateImageryProvider) {
          const layer = { url, maximumLevel: RADAR_MAXIMUM_LEVEL };
          const state = { layer, modeOpacity: DEFAULT_RADAR_OPACITY };
          applyRadarLayerStyle(state, context);
          radarLayers.set(context.viewer, state);
          return available;
        }

        const provider = new Cesium.UrlTemplateImageryProvider({
          url,
          maximumLevel: RADAR_MAXIMUM_LEVEL
        });
        const layer =
          context.viewer.imageryLayers?.addImageryProvider?.(provider) ?? provider;
        const state = {
          layer: layer as RadarImageryLayer,
          modeOpacity: DEFAULT_RADAR_OPACITY
        };
        applyRadarLayerStyle(state, context);
        radarLayers.set(context.viewer, state);
        context.viewer.scene?.requestRender?.();
        return available;
      } catch {
        return failed("RainViewer radar is unavailable.");
      }
    },
    async applyVisualMode(context, mode) {
      const existing = radarLayers.get(context.viewer);
      if (!existing) {
        return available;
      }

      existing.modeOpacity = mode.radarOpacity;
      if (context.quality.radar === "off") {
        existing.layer.show = false;
        context.viewer.scene?.requestRender?.();
        return disabled("Weather radar is disabled by the current quality mode.");
      }

      applyRadarLayerStyle(existing, context);
      context.viewer.scene?.requestRender?.();
      return available;
    },
    async applyQuality(context) {
      const existing = radarLayers.get(context.viewer);
      if (!existing) {
        return available;
      }

      if (context.quality.radar === "off") {
        existing.layer.show = false;
        context.viewer.scene?.requestRender?.();
        return disabled("Weather radar is disabled by the current quality mode.");
      }

      applyRadarLayerStyle(existing, context);
      context.viewer.scene?.requestRender?.();
      return available;
    },
    dispose(viewer) {
      const existing = radarLayers.get(viewer);
      if (existing) {
        removeRadarLayer(viewer, existing.layer);
        radarLayers.delete(viewer);
      }
      radarRequests.delete(viewer);
    }
  };
}

function applyRadarLayerStyle(
  state: RadarLayerState,
  context: LayerAdapterContext
) {
  const qualityMultiplier =
    context.quality.radar === "reducedOpacity" ? 0.88 : 1;
  state.layer.alpha = Math.min(
    0.92,
    Math.max(0.48, state.modeOpacity * qualityMultiplier)
  );
  state.layer.brightness = context.quality.radar === "reducedOpacity" ? 1.22 : 1.36;
  state.layer.contrast = 1.28;
  state.layer.saturation = 1.2;
  state.layer.gamma = 0.92;
  state.layer.show = true;
}

function removeRadarLayer(viewer: CesiumLikeViewer, layer: RadarImageryLayer) {
  layer.show = false;
  const removed = viewer.imageryLayers?.remove?.(layer, true);
  if (!removed) {
    viewer.scene?.imageryLayers?.remove?.(layer, true);
  }
}

function nextRadarRequest(
  viewer: CesiumLikeViewer,
  desiredVisible: boolean
): RadarRequestState {
  const previous = radarRequests.get(viewer);
  const next = {
    desiredVisible,
    requestId: (previous?.requestId ?? 0) + 1
  };
  radarRequests.set(viewer, next);
  return next;
}

function isLatestVisibleRequest(viewer: CesiumLikeViewer, requestId: number) {
  const latest = radarRequests.get(viewer);
  return latest?.desiredVisible === true && latest.requestId === requestId;
}
