import type { CesiumLayerAdapter } from "./layerDefinitions";
import { available, disabled } from "./layerDefinitions";

export function createTerrainLayerAdapter(): CesiumLayerAdapter {
  return {
    id: "terrain",
    async setVisible(context, visible) {
      if (context.quality.terrainDetail === "reduced" && visible) {
        return disabled("Terrain detail is reduced by the current quality mode.");
      }

      if (context.viewer.scene?.globe) {
        context.viewer.scene.globe.depthTestAgainstTerrain = visible;
        context.viewer.scene.requestRender?.();
      }

      return available;
    },
    async applyQuality(context) {
      return context.quality.terrainDetail === "reduced"
        ? disabled("Terrain detail is reduced by the current quality mode.")
        : available;
    }
  };
}
