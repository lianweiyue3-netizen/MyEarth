import type { CesiumLayerAdapter, CesiumLikeViewer } from "./layerDefinitions";
import { available, disabled, failed } from "./layerDefinitions";

const tilesets = new WeakMap<CesiumLikeViewer, unknown>();

export function createBuildingsLayerAdapter(): CesiumLayerAdapter {
  return {
    id: "buildings",
    async setVisible(context, visible) {
      if (context.quality.buildings === "off" && visible) {
        return disabled("3D buildings are disabled by the current quality mode.");
      }

      if (!visible) {
        const existing = tilesets.get(context.viewer);
        if (existing) {
          context.viewer.scene?.primitives?.remove(existing);
          tilesets.delete(context.viewer);
        }
        context.viewer.scene?.requestRender?.();
        return available;
      }

      if (tilesets.has(context.viewer)) {
        return available;
      }

      try {
        const Cesium = context.viewer.__myEarthCesium;
        if (!Cesium?.createOsmBuildingsAsync) {
          tilesets.set(context.viewer, { mock: "osm-buildings" });
          return available;
        }

        const tileset = await Cesium.createOsmBuildingsAsync();
        context.viewer.scene?.primitives?.add(tileset);
        tilesets.set(context.viewer, tileset);
        context.viewer.scene?.requestRender?.();
        return available;
      } catch {
        return failed("3D buildings could not be loaded.");
      }
    },
    async applyQuality(context) {
      if (context.quality.buildings === "off") {
        await this.setVisible(context, false);
        return disabled("3D buildings are disabled by the current quality mode.");
      }
      return available;
    },
    dispose(viewer) {
      const existing = tilesets.get(viewer);
      if (existing) {
        viewer.scene?.primitives?.remove(existing);
        tilesets.delete(viewer);
      }
    }
  };
}
