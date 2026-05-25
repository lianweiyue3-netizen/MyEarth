import { describe, expect, it, vi } from "vitest";
import { createLayerController } from "../../src/layers/layerController";
import {
  clearNewsHeatmapLayer,
  createNewsHeatmapLayerAdapter,
  getNewsHeatmapAlpha,
  NEWS_HEATMAP_LAYER_ID,
  pickNewsCountry,
  syncNewsHeatmapLayer
} from "../../src/layers/newsHeatmapLayer";
import type { CesiumLayerAdapter } from "../../src/layers/layerDefinitions";
import type { NewsSnapshot } from "../../src/news/newsTypes";

function createSnapshot(counts: Record<string, number>): NewsSnapshot {
  return {
    provider: "GNews",
    category: "general",
    language: "mixed",
    lastUpdated: "2026-05-21T00:00:00.000Z",
    countries: Object.fromEntries(
      Object.entries(counts).map(([countryCode, headlineCount]) => [
        countryCode,
        {
          countryCode,
          countryName: countryCode.toUpperCase(),
          language: countryCode === "jp" ? "ja" : "en",
          headlineCount,
          articles: []
        }
      ])
    )
  };
}

function createViewer() {
  const addedEntities: any[] = [];
  const removedEntities: any[] = [];
  const Cartesian2 = class {
    x: number;
    y: number;

    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  };

  return {
    addedEntities,
    removedEntities,
    viewer: {
      scene: {
        canvas: {
          getBoundingClientRect: () => ({ left: 10, top: 20 })
        },
        pick: vi.fn(),
        requestRender: vi.fn()
      },
      entities: {
        add: vi.fn((entity) => {
          addedEntities.push(entity);
          return entity;
        }),
        remove: vi.fn((entity) => {
          removedEntities.push(entity);
          return true;
        })
      },
      __myEarthCesium: {
        Cartesian2,
        Cartesian3: {
          fromDegreesArray: vi.fn((coordinates) => coordinates)
        },
        Color: {
          fromCssColorString: vi.fn((css: string) => ({
            css,
            withAlpha: (alpha: number) => ({ css, alpha })
          }))
        },
        PolygonHierarchy: vi.fn(function (
          this: { positions: unknown[] },
          positions: unknown[]
        ) {
          this.positions = positions;
        })
      }
    }
  };
}

describe("news heatmap layer", () => {
  it("creates entities only for countries with headlines and boundaries", () => {
    const { viewer, addedEntities } = createViewer();

    syncNewsHeatmapLayer(viewer, {
      visible: true,
      snapshot: createSnapshot({ us: 4, jp: 1, fr: 0, zz: 3 })
    });

    const countryCodes = addedEntities.map(
      (entity) => entity.properties.newsCountryCode
    );
    expect(new Set(countryCodes)).toEqual(new Set(["us", "jp"]));
    expect(countryCodes).not.toContain("fr");
    expect(countryCodes).not.toContain("zz");
    expect(addedEntities).toHaveLength(4);
    expect(viewer.scene.requestRender).toHaveBeenCalled();
  });

  it("computes heatmap alpha from headline intensity", () => {
    expect(getNewsHeatmapAlpha(0, 4)).toBe(0);
    expect(getNewsHeatmapAlpha(1, 4)).toBe(0.285);
    expect(getNewsHeatmapAlpha(4, 4, true)).toBe(0.7);
  });

  it("emphasizes the selected country and removes only news entities", () => {
    const { viewer, addedEntities, removedEntities } = createViewer();

    syncNewsHeatmapLayer(viewer, {
      visible: true,
      selectedCountryCode: "jp",
      snapshot: createSnapshot({ us: 4, jp: 1 })
    });

    const us = addedEntities.find(
      (entity) => entity.properties.newsCountryCode === "us"
    );
    const jp = addedEntities.find(
      (entity) => entity.properties.newsCountryCode === "jp"
    );

    expect(us.polygon.material.alpha).toBeGreaterThan(jp.polygon.material.alpha);
    expect(jp.polygon.outlineWidth).toBe(3);

    clearNewsHeatmapLayer(viewer);
    expect(removedEntities).toEqual(addedEntities);
  });

  it("emits selected country codes from Cesium picks", () => {
    const { viewer, addedEntities } = createViewer();

    syncNewsHeatmapLayer(viewer, {
      visible: true,
      snapshot: createSnapshot({ us: 1 })
    });
    viewer.scene.pick.mockReturnValue({ id: addedEntities[0] });

    expect(pickNewsCountry(viewer, { clientX: 20, clientY: 40 })).toEqual({
      countryCode: "us"
    });
    expect(viewer.scene.pick).toHaveBeenCalledWith(
      expect.objectContaining({ x: 10, y: 20 })
    );
  });

  it("does not create entities when hidden or missing data", () => {
    const { viewer, addedEntities } = createViewer();

    syncNewsHeatmapLayer(viewer, { visible: false, snapshot: createSnapshot({ us: 1 }) });
    syncNewsHeatmapLayer(viewer, { visible: true });

    expect(addedEntities).toHaveLength(0);
  });
});

describe("news heatmap layer controller integration", () => {
  it("routes news visibility updates to registered adapters", async () => {
    const { viewer } = createViewer();
    const onAvailabilityChange = vi.fn();
    const newsAdapter: CesiumLayerAdapter = {
      id: NEWS_HEATMAP_LAYER_ID,
      setVisible: vi.fn().mockResolvedValue({ status: "available" })
    };
    const controller = createLayerController({
      viewer,
      onAvailabilityChange,
      adapters: [newsAdapter]
    });

    await controller.setLayerVisibility(NEWS_HEATMAP_LAYER_ID, true);

    expect(newsAdapter.setVisible).toHaveBeenCalledWith(
      expect.objectContaining({ viewer }),
      true
    );
    expect(onAvailabilityChange).toHaveBeenCalledWith(NEWS_HEATMAP_LAYER_ID, {
      status: "available"
    });
  });

  it("publishes disabled news availability when no snapshot is present", async () => {
    const { viewer } = createViewer();
    const onAvailabilityChange = vi.fn();
    const controller = createLayerController({ viewer, onAvailabilityChange });

    await controller.setLayerVisibility(NEWS_HEATMAP_LAYER_ID, true);

    expect(onAvailabilityChange).toHaveBeenCalledWith(
      NEWS_HEATMAP_LAYER_ID,
      expect.objectContaining({
        status: "disabled",
        reason: "News headlines have not loaded."
      })
    );
  });

  it("marks adapter failures as recoverable through the controller", async () => {
    const { viewer } = createViewer();
    const onAvailabilityChange = vi.fn();
    const failedAvailability = {
      status: "failed" as const,
      reason: "News heatmap could not be initialized.",
      recoverable: true
    };
    const controller = createLayerController({
      viewer,
      onAvailabilityChange,
      adapters: [
        {
          id: NEWS_HEATMAP_LAYER_ID,
          setVisible: vi.fn().mockResolvedValue(failedAvailability)
        }
      ]
    });

    await controller.setLayerVisibility(NEWS_HEATMAP_LAYER_ID, true);

    expect(onAvailabilityChange).toHaveBeenCalledWith(
      NEWS_HEATMAP_LAYER_ID,
      failedAvailability
    );
  });

  it("keeps news toggles independent from radar, labels, terrain, and sound", async () => {
    const { viewer } = createViewer();
    const onAvailabilityChange = vi.fn();
    const newsAdapter = createNewsHeatmapLayerAdapter();
    const radarAdapter: CesiumLayerAdapter = {
      id: "weatherRadar",
      setVisible: vi.fn().mockResolvedValue({ status: "available" })
    };
    const labelAdapter: CesiumLayerAdapter = {
      id: "labels",
      setVisible: vi.fn().mockResolvedValue({ status: "available" })
    };
    const terrainAdapter: CesiumLayerAdapter = {
      id: "terrain",
      setVisible: vi.fn().mockResolvedValue({ status: "available" })
    };
    const controller = createLayerController({
      viewer,
      onAvailabilityChange,
      adapters: [newsAdapter, radarAdapter, labelAdapter, terrainAdapter]
    });

    await controller.setLayerVisibility(NEWS_HEATMAP_LAYER_ID, false);

    expect(radarAdapter.setVisible).not.toHaveBeenCalled();
    expect(labelAdapter.setVisible).not.toHaveBeenCalled();
    expect(terrainAdapter.setVisible).not.toHaveBeenCalled();
    expect(onAvailabilityChange).toHaveBeenCalledWith(NEWS_HEATMAP_LAYER_ID, {
      status: "available"
    });
  });
});
