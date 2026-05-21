import { describe, expect, it, vi } from "vitest";
import { createLayerController } from "../../src/layers/layerController";

type TestGlobe = {
  baseColor?: unknown;
};

type TestCesium = {
  IonWorldImageryStyle: {
    AERIAL: number;
    AERIAL_WITH_LABELS: number;
    ROAD: number;
  };
  IonImageryProvider?: {
    fromAssetId: ReturnType<typeof vi.fn>;
  };
  Color: {
    fromCssColorString: ReturnType<typeof vi.fn>;
  };
  createWorldImageryAsync: ReturnType<typeof vi.fn>;
};

function createViewer() {
  const addedLayers: unknown[] = [];
  const removedLayers: unknown[] = [];
  const createWorldImageryAsync = vi.fn(async ({ style }: { style: number }) => ({
    style
  }));
  const globe: TestGlobe = {};
  const Cesium: TestCesium = {
    IonWorldImageryStyle: {
      AERIAL: 2,
      AERIAL_WITH_LABELS: 3,
      ROAD: 4
    },
    Color: {
      fromCssColorString: vi.fn((css: string) => ({ css }))
    },
    createWorldImageryAsync
  };

  return {
    addedLayers,
    removedLayers,
    viewer: {
      scene: {
        globe,
        requestRender: vi.fn()
      },
      imageryLayers: {
        addImageryProvider: vi.fn((provider: unknown) => {
          const layer = { provider };
          addedLayers.push(layer);
          return layer;
        }),
        remove: vi.fn((layer: unknown) => {
          removedLayers.push(layer);
          return true;
        })
      },
      __myEarthCesium: Cesium
    }
  };
}

describe("base imagery layer", () => {
  it("switches visual modes to distinct Cesium imagery styles", async () => {
    const { viewer } = createViewer();
    const controller = createLayerController({ viewer, adapters: [] });

    await controller.setVisualMode("satellite");
    await controller.setLayerVisibility("labels", true);
    await controller.setVisualMode("cleanGlobe");
    await controller.setLayerVisibility("labels", false);

    expect(viewer.__myEarthCesium.createWorldImageryAsync).toHaveBeenCalledWith({
      style: 2
    });
    expect(viewer.__myEarthCesium.createWorldImageryAsync).toHaveBeenCalledWith({
      style: 3
    });
    expect(viewer.__myEarthCesium.createWorldImageryAsync).toHaveBeenCalledWith({
      style: 4
    });
    expect(viewer.scene.globe.baseColor).toEqual({ css: "#132536" });
  });

  it("uses Black Marble as a separate night overlay", async () => {
    const { viewer } = createViewer();
    const fromAssetId = vi.fn(async (assetId: number) => ({ assetId }));
    viewer.__myEarthCesium.IonImageryProvider = { fromAssetId };
    const controller = createLayerController({ viewer, adapters: [] });

    await controller.setVisualMode("nightLights");

    expect(fromAssetId).toHaveBeenCalledWith(3812);
    expect(viewer.scene.globe.baseColor).toEqual({ css: "#132536" });
  });

  it("deduplicates overlapping base imagery startup requests", async () => {
    const { viewer, addedLayers } = createViewer();
    const controller = createLayerController({ viewer, adapters: [] });

    await Promise.all([
      controller.setVisualMode("satellite"),
      controller.setVisualMode("satellite")
    ]);

    expect(viewer.__myEarthCesium.createWorldImageryAsync).toHaveBeenCalledTimes(1);
    expect(addedLayers).toHaveLength(1);
  });
});
