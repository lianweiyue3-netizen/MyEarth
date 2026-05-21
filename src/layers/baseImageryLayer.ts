import type {
  LayerAvailability,
  VisualModeDefinition
} from "../shared/domain";
import type { CesiumLikeViewer, LayerAdapterContext } from "./layerDefinitions";
import { available, failed } from "./layerDefinitions";

type BaseImageryKind = "aerial" | "aerialWithLabels" | "road" | "minimal";

type BaseImageryRecord = {
  kind: BaseImageryKind;
  layer?: unknown;
  loading?: boolean;
};

const baseImagery = new WeakMap<CesiumLikeViewer, BaseImageryRecord>();
const baseImageryRequests = new WeakMap<CesiumLikeViewer, number>();

export async function setBaseImageryForVisualMode(
  context: LayerAdapterContext,
  mode: VisualModeDefinition,
  labelsVisible: boolean
): Promise<LayerAvailability> {
  return setBaseImagery(context, getBaseImageryKind(mode, labelsVisible));
}

export async function setBaseImagery(
  context: LayerAdapterContext,
  kind: BaseImageryKind
): Promise<LayerAvailability> {
  const existing = baseImagery.get(context.viewer);
  if (existing?.kind === kind) {
    return available;
  }

  const requestId = (baseImageryRequests.get(context.viewer) ?? 0) + 1;
  baseImageryRequests.set(context.viewer, requestId);

  if (existing?.layer) {
    context.viewer.imageryLayers?.remove?.(existing.layer, true);
    context.viewer.scene?.imageryLayers?.remove?.(existing.layer, true);
  }

  if (kind === "minimal") {
    setGlobeBaseColor(context.viewer);
    baseImagery.set(context.viewer, { kind });
    context.viewer.scene?.requestRender?.();
    return available;
  }

  try {
    const Cesium = context.viewer.__myEarthCesium;
    const style = getWorldImageryStyle(Cesium, kind);
    baseImagery.set(context.viewer, { kind, loading: true });

    if (!Cesium?.createWorldImageryAsync || !style) {
      baseImagery.set(context.viewer, { kind, layer: { mock: kind } });
      return available;
    }

    const provider = await Cesium.createWorldImageryAsync({ style });
    if (baseImageryRequests.get(context.viewer) !== requestId) {
      return available;
    }

    const layer =
      context.viewer.imageryLayers?.addImageryProvider?.(provider, 0) ??
      context.viewer.scene?.imageryLayers?.addImageryProvider?.(provider, 0) ??
      provider;
    baseImagery.set(context.viewer, { kind, layer });
    context.viewer.scene?.requestRender?.();
    return available;
  } catch {
    if (baseImageryRequests.get(context.viewer) === requestId) {
      baseImagery.delete(context.viewer);
    }
    return failed("Base imagery could not be changed.");
  }
}

function getBaseImageryKind(
  mode: VisualModeDefinition,
  labelsVisible: boolean
): BaseImageryKind {
  if (mode.imageryStrategy === "minimal") {
    return labelsVisible ? "road" : "minimal";
  }

  if (mode.imageryStrategy === "cesiumLabels") {
    return "aerialWithLabels";
  }

  if (mode.imageryStrategy === "blackMarble") {
    return "minimal";
  }

  return labelsVisible ? "aerialWithLabels" : "aerial";
}

function getWorldImageryStyle(Cesium: Record<string, any> | undefined, kind: BaseImageryKind) {
  const styles = Cesium?.IonWorldImageryStyle;
  if (!styles) {
    return undefined;
  }

  if (kind === "aerialWithLabels") {
    return styles.AERIAL_WITH_LABELS;
  }

  if (kind === "road") {
    return styles.ROAD;
  }

  return styles.AERIAL;
}

function setGlobeBaseColor(viewer: CesiumLikeViewer) {
  const Cesium = viewer.__myEarthCesium;
  const color = Cesium?.Color?.fromCssColorString?.("#132536");
  const globe = viewer.scene?.globe;

  if (globe && color) {
    globe.baseColor = color;
  }
}
