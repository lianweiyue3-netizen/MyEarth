import type { CesiumLayerAdapter, CesiumLikeViewer } from "./layerDefinitions";
import { available, disabled, failed } from "./layerDefinitions";

const cloudLayers = new WeakMap<CesiumLikeViewer, unknown>();

export function createProceduralCloudLayerAdapter(): CesiumLayerAdapter {
  return {
    id: "clouds",
    async setVisible(context, visible) {
      if (!visible) {
        const existing = cloudLayers.get(context.viewer);
        if (existing) {
          context.viewer.imageryLayers?.remove?.(existing, true);
          cloudLayers.delete(context.viewer);
        }
        context.viewer.scene?.requestRender?.();
        return available;
      }

      if (context.quality.clouds === "off") {
        return disabled("Clouds are disabled by the current quality mode.");
      }

      try {
        const layer = { kind: "procedural-clouds", animated: !context.reducedMotion };
        cloudLayers.set(context.viewer, layer);
        context.viewer.scene?.requestRender?.();
        return available;
      } catch {
        return failed("Cloud overlay could not be initialized.");
      }
    },
    async applyQuality(context) {
      if (context.quality.clouds === "off") {
        await this.setVisible(context, false);
        return disabled("Clouds are disabled by the current quality mode.");
      }
      return available;
    }
  };
}
