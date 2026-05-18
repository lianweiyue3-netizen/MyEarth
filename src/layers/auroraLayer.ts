import type { CesiumLayerAdapter, CesiumLikeViewer } from "./layerDefinitions";
import { available, disabled, failed } from "./layerDefinitions";

const auroraLayers = new WeakMap<CesiumLikeViewer, unknown>();

export function createAuroraLayerAdapter(): CesiumLayerAdapter {
  return {
    id: "aurora",
    async setVisible(context, visible) {
      if (!visible) {
        auroraLayers.delete(context.viewer);
        context.viewer.scene?.requestRender?.();
        return available;
      }

      if (context.quality.aurora === "off") {
        return disabled("Aurora is disabled by the current quality mode.");
      }

      try {
        auroraLayers.set(context.viewer, {
          kind: "illustrative-aurora",
          animated: !context.reducedMotion && context.quality.aurora === "full",
          latitudeBands: [67, -67]
        });
        context.viewer.scene?.requestRender?.();
        return available;
      } catch {
        return failed("Illustrative aurora could not be initialized.");
      }
    },
    async applyQuality(context) {
      if (context.quality.aurora === "off") {
        await this.setVisible(context, false);
        return disabled("Aurora is disabled by the current quality mode.");
      }
      return available;
    }
  };
}
