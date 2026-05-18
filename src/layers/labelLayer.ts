import type { CesiumLayerAdapter } from "./layerDefinitions";
import { available } from "./layerDefinitions";

export function createLabelLayerAdapter(): CesiumLayerAdapter {
  return {
    id: "labels",
    async setVisible(context, visible) {
      if (context.viewer.scene?.globe) {
        context.viewer.scene.globe.showWaterEffect = visible;
      }
      context.viewer.scene?.requestRender?.();
      return available;
    }
  };
}
