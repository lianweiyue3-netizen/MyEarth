import type { CesiumLikeViewer, LayerAdapterContext } from "./layerDefinitions";
import { available, failed } from "./layerDefinitions";

const nightLightLayers = new WeakMap<CesiumLikeViewer, unknown>();

export async function setNightLightsVisible(
  context: LayerAdapterContext,
  visible: boolean
) {
  const existing = nightLightLayers.get(context.viewer);

  if (!visible) {
    if (existing) {
      context.viewer.imageryLayers?.remove?.(existing, true);
      nightLightLayers.delete(context.viewer);
    }
    context.viewer.scene?.requestRender?.();
    return available;
  }

  if (existing) {
    return available;
  }

  try {
    const Cesium = context.viewer.__myEarthCesium;
    if (!Cesium?.IonImageryProvider?.fromAssetId) {
      nightLightLayers.set(context.viewer, { mock: "black-marble" });
      return available;
    }

    const provider = await Cesium.IonImageryProvider.fromAssetId(3812);
    const layer = context.viewer.imageryLayers?.addImageryProvider?.(provider);
    nightLightLayers.set(context.viewer, layer ?? provider);
    context.viewer.scene?.requestRender?.();
    return available;
  } catch {
    return failed("Night lights imagery is unavailable.");
  }
}
