import type { WeatherRadarService } from "../shared/domain";
import type { CesiumLayerAdapter, CesiumLikeViewer } from "./layerDefinitions";
import { available, disabled, failed } from "./layerDefinitions";

const radarLayers = new WeakMap<CesiumLikeViewer, unknown>();

export function createWeatherRadarLayerAdapter(
  service: WeatherRadarService
): CesiumLayerAdapter {
  return {
    id: "weatherRadar",
    async setVisible(context, visible) {
      const existing = radarLayers.get(context.viewer);
      if (!visible) {
        if (existing) {
          context.viewer.imageryLayers?.remove?.(existing, true);
          radarLayers.delete(context.viewer);
        }
        context.viewer.scene?.requestRender?.();
        return available;
      }

      if (context.quality.radar === "off") {
        return disabled("Weather radar is disabled by the current quality mode.");
      }

      try {
        const frame = await service.getLatestFrame();
        const Cesium = context.viewer.__myEarthCesium;
        const url = `${frame.host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;

        if (!Cesium?.UrlTemplateImageryProvider) {
          radarLayers.set(context.viewer, { url, maximumLevel: 7 });
          return available;
        }

        const provider = new Cesium.UrlTemplateImageryProvider({
          url,
          maximumLevel: 7
        });
        const layer = context.viewer.imageryLayers?.addImageryProvider?.(provider);
        if (layer && typeof layer === "object") {
          (layer as { alpha?: number }).alpha =
            context.quality.radar === "reducedOpacity" ? 0.45 : 0.62;
        }
        radarLayers.set(context.viewer, layer ?? provider);
        context.viewer.scene?.requestRender?.();
        return available;
      } catch {
        return failed("RainViewer radar is unavailable.");
      }
    }
  };
}
