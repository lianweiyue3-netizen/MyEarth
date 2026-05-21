import { earthLocations } from "../content/locations";
import type { CesiumLayerAdapter, CesiumLikeViewer } from "./layerDefinitions";
import { available, failed } from "./layerDefinitions";

type ReferenceLabel = {
  id: string;
  text: string;
  latitude: number;
  longitude: number;
  kind: "region" | "ocean" | "place";
};

type LabelCollectionLike = {
  add?: (options: Record<string, unknown>) => unknown;
  show?: boolean;
};

const referenceLabels: ReferenceLabel[] = [
  {
    id: "north-america",
    text: "North America",
    latitude: 45,
    longitude: -105,
    kind: "region"
  },
  {
    id: "south-america",
    text: "South America",
    latitude: -18,
    longitude: -60,
    kind: "region"
  },
  { id: "europe", text: "Europe", latitude: 51, longitude: 14, kind: "region" },
  { id: "africa", text: "Africa", latitude: 5, longitude: 20, kind: "region" },
  { id: "asia", text: "Asia", latitude: 38, longitude: 90, kind: "region" },
  {
    id: "australia",
    text: "Australia",
    latitude: -25,
    longitude: 134,
    kind: "region"
  },
  { id: "pacific", text: "Pacific Ocean", latitude: 0, longitude: -160, kind: "ocean" },
  {
    id: "atlantic",
    text: "Atlantic Ocean",
    latitude: 5,
    longitude: -30,
    kind: "ocean"
  },
  {
    id: "indian",
    text: "Indian Ocean",
    latitude: -20,
    longitude: 80,
    kind: "ocean"
  },
  ...earthLocations.map((location) => ({
    id: location.id,
    text: location.name,
    latitude: location.coordinates.latitude,
    longitude: location.coordinates.longitude,
    kind: "place" as const
  }))
];

const labelCollections = new WeakMap<CesiumLikeViewer, unknown>();

export function createLabelLayerAdapter(): CesiumLayerAdapter {
  return {
    id: "labels",
    async setVisible(context, visible) {
      if (!visible) {
        removeLabelCollection(context.viewer);
        context.viewer.scene?.requestRender?.();
        return available;
      }

      if (labelCollections.has(context.viewer)) {
        const existing = labelCollections.get(context.viewer) as LabelCollectionLike;
        existing.show = true;
        context.viewer.scene?.requestRender?.();
        return available;
      }

      try {
        const collection = createLabelCollection(context.viewer);
        if (!collection) {
          return failed("Reference labels could not be initialized.");
        }

        labelCollections.set(context.viewer, collection);
        context.viewer.scene?.requestRender?.();
        return available;
      } catch {
        return failed("Reference labels could not be initialized.");
      }
    },
    dispose(viewer) {
      removeLabelCollection(viewer);
    }
  };
}

function createLabelCollection(viewer: CesiumLikeViewer): unknown | undefined {
  const Cesium = viewer.__myEarthCesium;
  const collection: LabelCollectionLike = Cesium?.LabelCollection
    ? new Cesium.LabelCollection({ scene: viewer.scene })
    : createMockCollection();

  for (const label of referenceLabels) {
    collection.add?.(createLabelOptions(Cesium, label));
  }

  return viewer.scene?.primitives?.add(collection) ?? collection;
}

function createLabelOptions(
  Cesium: Record<string, any> | undefined,
  label: ReferenceLabel
) {
  const position = Cesium?.Cartesian3?.fromDegrees?.(
    label.longitude,
    label.latitude,
    label.kind === "place" ? 35_000 : 70_000
  );

  return {
    id: label.id,
    position,
    text: label.text,
    font:
      label.kind === "place"
        ? "600 15px Inter, sans-serif"
        : "700 18px Inter, sans-serif",
    fillColor: color(Cesium, label.kind === "ocean" ? "#9edcff" : "#f7fbff"),
    outlineColor: color(Cesium, "#05111f"),
    outlineWidth: label.kind === "place" ? 4 : 5,
    style: Cesium?.LabelStyle?.FILL_AND_OUTLINE,
    horizontalOrigin: Cesium?.HorizontalOrigin?.CENTER,
    verticalOrigin: Cesium?.VerticalOrigin?.BOTTOM,
    pixelOffset: vector2(Cesium, 0, label.kind === "place" ? -7 : 0),
    scaleByDistance: nearFar(Cesium, 1_500_000, 1.12, 30_000_000, 0.82),
    translucencyByDistance: nearFar(Cesium, 3_000_000, 1, 32_000_000, 0.88),
    distanceDisplayCondition: distanceDisplay(Cesium, 0, 34_000_000),
    showBackground: true,
    backgroundColor: color(Cesium, "rgba(4, 13, 25, 0.62)"),
    backgroundPadding: vector2(Cesium, 8, 5)
  };
}

function removeLabelCollection(viewer: CesiumLikeViewer) {
  const collection = labelCollections.get(viewer);
  if (!collection) {
    return;
  }

  viewer.scene?.primitives?.remove(collection);
  labelCollections.delete(viewer);
}

function color(Cesium: Record<string, any> | undefined, css: string) {
  return Cesium?.Color?.fromCssColorString?.(css) ?? css;
}

function vector2(Cesium: Record<string, any> | undefined, x: number, y: number) {
  return Cesium?.Cartesian2 ? new Cesium.Cartesian2(x, y) : { x, y };
}

function nearFar(
  Cesium: Record<string, any> | undefined,
  near: number,
  nearValue: number,
  far: number,
  farValue: number
) {
  return Cesium?.NearFarScalar
    ? new Cesium.NearFarScalar(near, nearValue, far, farValue)
    : { near, nearValue, far, farValue };
}

function distanceDisplay(
  Cesium: Record<string, any> | undefined,
  near: number,
  far: number
) {
  return Cesium?.DistanceDisplayCondition
    ? new Cesium.DistanceDisplayCondition(near, far)
    : { near, far };
}

function createMockCollection(): LabelCollectionLike {
  const labels: Record<string, unknown>[] = [];
  return {
    show: true,
    add(options) {
      labels.push(options);
      return options;
    }
  };
}
