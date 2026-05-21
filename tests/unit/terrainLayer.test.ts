import { describe, expect, it, vi } from "vitest";
import {
  createTerrainLayerAdapter,
  TERRAIN_EMPHASIS_RELIEF_EXAGGERATION,
  TERRAIN_RELIEF_EXAGGERATION
} from "../../src/layers/terrainLayer";
import { getVisualMode } from "../../src/layers/visualModes";
import {
  defaultQualityProfile,
  qualityProfiles
} from "../../src/performance/qualityController";

type TestGlobe = {
  depthTestAgainstTerrain?: boolean;
  material?: unknown;
};

function createContext(quality = defaultQualityProfile) {
  const worldTerrainProvider = { provider: "world-terrain" };
  const ellipsoidTerrainProvider = { provider: "ellipsoid-terrain" };
  const elevationMaterial = { material: "elevation-band" };
  const Cesium = {
    createWorldTerrainAsync: vi.fn().mockResolvedValue(worldTerrainProvider),
    EllipsoidTerrainProvider: vi.fn(function () {
      return ellipsoidTerrainProvider;
    }),
    createElevationBandMaterial: vi.fn(() => elevationMaterial),
    Color: {
      fromCssColorString: vi.fn(() => ({
        withAlpha: vi.fn((alpha: number) => ({ alpha }))
      }))
    }
  };

  return {
    viewer: {
      scene: {
        globe: {} as TestGlobe,
        requestRender: vi.fn(),
        verticalExaggeration: 1,
        verticalExaggerationRelativeHeight: 0
      },
      terrainProvider: undefined as unknown,
      __myEarthCesium: Cesium
    },
    quality,
    reducedMotion: false,
    worldTerrainProvider,
    ellipsoidTerrainProvider,
    elevationMaterial,
    Cesium
  };
}

describe("terrain layer relief", () => {
  it("exaggerates terrain while the terrain layer is visible", async () => {
    const adapter = createTerrainLayerAdapter();
    const context = createContext();

    await expect(adapter.setVisible(context, true)).resolves.toEqual({
      status: "available"
    });

    expect(context.viewer.scene.globe.depthTestAgainstTerrain).toBe(true);
    expect(context.viewer.scene.verticalExaggeration).toBe(
      TERRAIN_RELIEF_EXAGGERATION
    );
    expect(context.viewer.scene.verticalExaggerationRelativeHeight).toBe(0);
    expect(context.Cesium.createWorldTerrainAsync).toHaveBeenCalledWith({
      requestVertexNormals: true,
      requestWaterMask: true
    });
    expect(context.viewer.terrainProvider).toBe(context.worldTerrainProvider);
    expect(context.viewer.scene.globe.material).toBe(context.elevationMaterial);
  });

  it("uses stronger relief in terrain visual mode", async () => {
    const adapter = createTerrainLayerAdapter();
    const context = createContext();

    await adapter.applyVisualMode?.(context, getVisualMode("terrainEmphasis"));

    expect(context.viewer.scene.verticalExaggeration).toBe(
      TERRAIN_EMPHASIS_RELIEF_EXAGGERATION
    );
  });

  it("returns to normal height when terrain is hidden or reduced by quality", async () => {
    const adapter = createTerrainLayerAdapter();
    const context = createContext();

    await adapter.setVisible(context, false);
    expect(context.viewer.scene.globe.depthTestAgainstTerrain).toBe(false);
    expect(context.viewer.scene.verticalExaggeration).toBe(1);
    expect(context.viewer.terrainProvider).toBe(context.ellipsoidTerrainProvider);
    expect(context.viewer.scene.globe.material).toBeUndefined();

    const lowQualityContext = createContext(qualityProfiles.low);
    await expect(adapter.setVisible(lowQualityContext, true)).resolves.toMatchObject({
      status: "disabled"
    });
    await expect(
      adapter.applyVisualMode?.(lowQualityContext, getVisualMode("terrainEmphasis"))
    ).resolves.toMatchObject({
      status: "disabled"
    });
    expect(lowQualityContext.viewer.scene.globe.depthTestAgainstTerrain).toBe(false);
    expect(lowQualityContext.viewer.scene.verticalExaggeration).toBe(1);
  });
});
