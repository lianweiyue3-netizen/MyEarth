import {
  getNewsCountryBoundary,
  type NewsCountryBoundary
} from "../news/countryBoundaries";
import type { NewsSnapshot } from "../news/newsTypes";
import type { LayerAvailability, LayerId } from "../shared/domain";
import type {
  CesiumLayerAdapter,
  CesiumLikeViewer,
  LayerAdapterContext
} from "./layerDefinitions";
import { available, disabled, failed } from "./layerDefinitions";

export const NEWS_HEATMAP_LAYER_ID: LayerId = "newsHeatmap";

export type NewsHeatmapLayerInput = {
  visible: boolean;
  snapshot?: NewsSnapshot;
  selectedCountryCode?: string;
};

export type NewsCountryPick = {
  countryCode: string;
};

export type NewsBoundaryResolver = (
  countryCode: string
) => NewsCountryBoundary | undefined;

export type NewsHeatmapLayerOptions = {
  input?: NewsHeatmapLayerInput;
  getBoundary?: NewsBoundaryResolver;
};

export type NewsHeatmapLayerAdapter = CesiumLayerAdapter & {
  setInput(
    context: LayerAdapterContext,
    input: NewsHeatmapLayerInput
  ): Promise<LayerAvailability>;
  getInput(context: LayerAdapterContext): NewsHeatmapLayerInput;
};

type NewsEntity = {
  id?: string;
  name?: string;
  show?: boolean;
  myEarthLayerId?: "newsHeatmap";
  myEarthNewsCountryCode?: string;
  properties?: {
    newsCountryCode?: unknown;
    countryCode?: unknown;
    headlineCount?: number;
  };
  polygon?: Record<string, any>;
};

const newsEntities = new WeakMap<CesiumLikeViewer, NewsEntity[]>();
const newsInputs = new WeakMap<CesiumLikeViewer, NewsHeatmapLayerInput>();

const missingSnapshotMessage = "News headlines have not loaded.";
const emptySnapshotMessage = "No current headlines are available.";
const unavailableMessage = "News heatmap could not be initialized.";

export function createNewsHeatmapLayerAdapter(
  options: NewsHeatmapLayerOptions = {}
): NewsHeatmapLayerAdapter {
  const getBoundary = options.getBoundary ?? getNewsCountryBoundary;

  return {
    id: NEWS_HEATMAP_LAYER_ID,
    async setVisible(context, visible) {
      const current = newsInputs.get(context.viewer) ?? options.input ?? { visible: false };
      return syncNewsHeatmapLayerWithAvailability(
        context.viewer,
        { ...current, visible },
        getBoundary
      );
    },
    async setInput(context, input) {
      return syncNewsHeatmapLayerWithAvailability(
        context.viewer,
        input,
        getBoundary
      );
    },
    getInput(context) {
      return newsInputs.get(context.viewer) ?? options.input ?? { visible: false };
    },
    dispose(viewer) {
      clearNewsHeatmapLayer(viewer);
    }
  };
}

export function syncNewsHeatmapLayer(
  viewer: CesiumLikeViewer,
  input: NewsHeatmapLayerInput
): void {
  syncNewsHeatmapLayerWithAvailability(viewer, input, getNewsCountryBoundary);
}

export function clearNewsHeatmapLayer(viewer: CesiumLikeViewer | undefined): void {
  if (!viewer) {
    return;
  }

  removeNewsEntities(viewer);
  newsInputs.delete(viewer);
  viewer.scene?.requestRender?.();
}

export function pickNewsCountry(
  viewer: CesiumLikeViewer,
  event: Pick<MouseEvent, "clientX" | "clientY">
): NewsCountryPick | undefined {
  const canvas = viewer.scene?.canvas;
  const Cartesian2 = viewer.__myEarthCesium?.Cartesian2;
  const pick = viewer.scene?.pick;
  if (!canvas || !Cartesian2 || !pick) {
    return undefined;
  }

  const rect = canvas.getBoundingClientRect?.() ?? { left: 0, top: 0 };
  const position = new Cartesian2(event.clientX - rect.left, event.clientY - rect.top);
  const picked = pick(position);
  const countryCode = readCountryCodeFromPickedObject(picked);

  return countryCode ? { countryCode: countryCode.toLowerCase() } : undefined;
}

export function getNewsHeatmapAlpha(
  headlineCount: number,
  maxHeadlineCount: number,
  selected = false
): number {
  if (headlineCount <= 0 || maxHeadlineCount <= 0) {
    return 0;
  }

  const ratio = Math.min(1, Math.max(0, headlineCount / maxHeadlineCount));
  return Number(Math.min(0.78, 0.2 + ratio * 0.34 + (selected ? 0.16 : 0)).toFixed(3));
}

function syncNewsHeatmapLayerWithAvailability(
  viewer: CesiumLikeViewer,
  input: NewsHeatmapLayerInput,
  getBoundary: NewsBoundaryResolver
): LayerAvailability {
  newsInputs.set(viewer, input);
  removeNewsEntities(viewer);

  if (!input.visible) {
    viewer.scene?.requestRender?.();
    return available;
  }

  if (!input.snapshot) {
    viewer.scene?.requestRender?.();
    return disabled(missingSnapshotMessage);
  }

  if (!hasEntityApi(viewer)) {
    viewer.scene?.requestRender?.();
    return failed(unavailableMessage);
  }

  const countries = Object.values(input.snapshot.countries).filter(
    (country) => country.headlineCount > 0
  );

  if (countries.length === 0) {
    viewer.scene?.requestRender?.();
    return disabled(emptySnapshotMessage);
  }

  const maxHeadlineCount = Math.max(
    ...countries.map((country) => country.headlineCount)
  );
  const nextEntities: NewsEntity[] = [];

  try {
    for (const country of countries) {
      const boundary = getBoundary(country.countryCode);
      if (!boundary) {
        continue;
      }

      for (const [polygonIndex, polygon] of boundary.polygons.entries()) {
        if (!isValidPolygon(polygon)) {
          continue;
        }

        const entity = createCountryEntity(
          viewer,
          country.countryCode,
          country.countryName,
          country.headlineCount,
          maxHeadlineCount,
          polygonIndex,
          polygon,
          input.selectedCountryCode === country.countryCode
        );
        nextEntities.push(viewer.entities.add(entity));
      }
    }

    newsEntities.set(viewer, nextEntities);
    viewer.scene?.requestRender?.();
    return nextEntities.length > 0 ? available : disabled(emptySnapshotMessage);
  } catch {
    removeNewsEntities(viewer);
    viewer.scene?.requestRender?.();
    return failed(unavailableMessage);
  }
}

function createCountryEntity(
  viewer: CesiumLikeViewer,
  countryCode: string,
  countryName: string,
  headlineCount: number,
  maxHeadlineCount: number,
  polygonIndex: number,
  polygon: Array<[number, number]>,
  selected: boolean
): NewsEntity {
  const Cesium = viewer.__myEarthCesium ?? {};
  const alpha = getNewsHeatmapAlpha(headlineCount, maxHeadlineCount, selected);

  return {
    id: `myearth-news-${countryCode}-${polygonIndex}`,
    name: `News heatmap: ${countryName}`,
    show: true,
    myEarthLayerId: "newsHeatmap",
    myEarthNewsCountryCode: countryCode,
    properties: {
      newsCountryCode: countryCode,
      countryCode,
      headlineCount
    },
    polygon: {
      hierarchy: createPolygonHierarchy(Cesium, polygon),
      material: color(Cesium, "#f6a13a", alpha),
      outline: true,
      outlineColor: color(Cesium, selected ? "#fff2c2" : "#ffd08a", selected ? 0.92 : 0.58),
      outlineWidth: selected ? 3 : 1,
      height: 0,
      heightReference: Cesium.HeightReference?.CLAMP_TO_GROUND,
      classificationType: Cesium.ClassificationType?.TERRAIN
    }
  };
}

function createPolygonHierarchy(
  Cesium: Record<string, any>,
  polygon: Array<[number, number]>
) {
  if (Cesium.Cartesian3?.fromDegreesArray) {
    const positions = Cesium.Cartesian3.fromDegreesArray(
      polygon.flatMap(([longitude, latitude]) => [longitude, latitude])
    );
    return Cesium.PolygonHierarchy
      ? new Cesium.PolygonHierarchy(positions)
      : positions;
  }

  const positions = polygon.map(([longitude, latitude]) =>
    Cesium.Cartesian3?.fromDegrees?.(longitude, latitude, 0) ?? {
      longitude,
      latitude,
      height: 0
    }
  );
  return Cesium.PolygonHierarchy
    ? new Cesium.PolygonHierarchy(positions)
    : positions;
}

function removeNewsEntities(viewer: CesiumLikeViewer): void {
  const existing = newsEntities.get(viewer) ?? [];
  if (existing.length === 0) {
    return;
  }

  if (hasEntityApi(viewer)) {
    for (const entity of existing) {
      entity.show = false;
      viewer.entities.remove(entity);
    }
  }

  newsEntities.delete(viewer);
}

function hasEntityApi(
  viewer: CesiumLikeViewer
): viewer is CesiumLikeViewer & {
  entities: {
    add: (entity: NewsEntity) => NewsEntity;
    remove: (entity: NewsEntity) => boolean;
  };
} {
  return (
    typeof viewer.entities?.add === "function" &&
    typeof viewer.entities?.remove === "function"
  );
}

function isValidPolygon(polygon: Array<[number, number]>): boolean {
  return (
    polygon.length >= 4 &&
    polygon.every(
      ([longitude, latitude]) =>
        Number.isFinite(longitude) &&
        Number.isFinite(latitude) &&
        longitude >= -180 &&
        longitude <= 180 &&
        latitude >= -90 &&
        latitude <= 90
    )
  );
}

function readCountryCodeFromPickedObject(picked: unknown): string | undefined {
  if (!picked || typeof picked !== "object") {
    return undefined;
  }

  const record = picked as Record<string, any>;
  return (
    readCountryCode(record.id) ??
    readCountryCode(record.entity) ??
    readCountryCode(record.primitive)
  );
}

function readCountryCode(value: unknown): string | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, any>;
  if (
    typeof record.myEarthNewsCountryCode === "string" &&
    record.myEarthNewsCountryCode.length > 0
  ) {
    return record.myEarthNewsCountryCode;
  }

  const candidate =
    record.properties?.newsCountryCode ?? record.properties?.countryCode;
  if (typeof candidate === "string" && candidate.length > 0) {
    return candidate;
  }

  if (typeof candidate?.getValue === "function") {
    const value = candidate.getValue();
    return typeof value === "string" && value.length > 0 ? value : undefined;
  }

  return undefined;
}

function color(Cesium: Record<string, any>, css: string, alpha: number) {
  const parsed = Cesium.Color?.fromCssColorString?.(css);
  return parsed?.withAlpha?.(alpha) ?? { color: css, alpha };
}
