import type { CesiumLayerAdapter, CesiumLikeViewer } from "./layerDefinitions";
import { available, disabled, failed } from "./layerDefinitions";

export const TERRAIN_RELIEF_EXAGGERATION = 2.4;
export const TERRAIN_EMPHASIS_RELIEF_EXAGGERATION = 3.4;

const terrainReducedMessage =
  "Terrain detail is reduced by the current quality mode.";
const terrainUnavailableMessage = "Terrain detail could not be initialized.";

type TerrainLayerState = {
  worldTerrainProviderPromise?: Promise<unknown>;
  ellipsoidProvider?: unknown;
  originalGlobeMaterial?: unknown;
};

const terrainStates = new WeakMap<CesiumLikeViewer, TerrainLayerState>();

export function createTerrainLayerAdapter(): CesiumLayerAdapter {
  let requestedVisible = true;
  let terrainEmphasis = false;
  let operationId = 0;

  const applyTerrainPresentation = async (
    context: Parameters<CesiumLayerAdapter["setVisible"]>[0]
  ) => {
    const currentOperation = ++operationId;
    const terrainAvailable = context.quality.terrainDetail !== "reduced";
    const active = requestedVisible && terrainAvailable;
    const scene = context.viewer.scene;

    if (scene?.globe) {
      scene.globe.depthTestAgainstTerrain = active;
    }

    if (scene) {
      scene.verticalExaggeration = active
        ? terrainEmphasis
          ? TERRAIN_EMPHASIS_RELIEF_EXAGGERATION
          : TERRAIN_RELIEF_EXAGGERATION
        : 1;
      scene.verticalExaggerationRelativeHeight = 0;
      scene.requestRender?.();
    }

    if (!active) {
      setFlatTerrainProvider(context.viewer);
      restoreGlobeMaterial(context.viewer);
      return requestedVisible && !terrainAvailable
        ? disabled(terrainReducedMessage)
        : available;
    }

    try {
      const provider = await getWorldTerrainProvider(context.viewer);
      if (currentOperation !== operationId || !requestedVisible) {
        return available;
      }

      context.viewer.terrainProvider = provider;
      applyElevationTint(context.viewer, terrainEmphasis);
      scene?.requestRender?.();
      return available;
    } catch {
      setFlatTerrainProvider(context.viewer);
      restoreGlobeMaterial(context.viewer);
      scene?.requestRender?.();
      return failed(terrainUnavailableMessage);
    }
  };

  return {
    id: "terrain",
    async setVisible(context, visible) {
      requestedVisible = visible;
      return applyTerrainPresentation(context);
    },
    async applyVisualMode(context, mode) {
      terrainEmphasis = mode.terrainEmphasis;
      return applyTerrainPresentation(context);
    },
    async applyQuality(context) {
      return applyTerrainPresentation(context);
    }
  };
}

async function getWorldTerrainProvider(viewer: CesiumLikeViewer) {
  const state = getTerrainState(viewer);
  if (!state.worldTerrainProviderPromise) {
    const Cesium = viewer.__myEarthCesium;

    state.worldTerrainProviderPromise = Cesium?.createWorldTerrainAsync
      ? Cesium.createWorldTerrainAsync({
          requestVertexNormals: true,
          requestWaterMask: true
        })
      : Promise.resolve({ mock: "world-terrain" });
  }

  return state.worldTerrainProviderPromise;
}

function setFlatTerrainProvider(viewer: CesiumLikeViewer) {
  const Cesium = viewer.__myEarthCesium;
  const state = getTerrainState(viewer);

  if (!state.ellipsoidProvider) {
    state.ellipsoidProvider = Cesium?.EllipsoidTerrainProvider
      ? new Cesium.EllipsoidTerrainProvider()
      : { mock: "ellipsoid-terrain" };
  }

  viewer.terrainProvider = state.ellipsoidProvider;
}

function applyElevationTint(viewer: CesiumLikeViewer, terrainEmphasis: boolean) {
  const globe = viewer.scene?.globe;
  const Cesium = viewer.__myEarthCesium;
  const createMaterial = Cesium?.createElevationBandMaterial;

  if (!globe || !createMaterial || !viewer.scene || !Cesium?.Color) {
    return;
  }

  const state = getTerrainState(viewer);
  if (!("originalGlobeMaterial" in state)) {
    state.originalGlobeMaterial = globe.material;
  }

  globe.material = createMaterial({
    scene: viewer.scene,
    layers: [
      {
        entries: [
          { height: -600, color: color(Cesium, "#1d5166", 0.18) },
          { height: 200, color: color(Cesium, "#377f60", 0.2) },
          { height: 1200, color: color(Cesium, "#a58a54", 0.28) },
          { height: 3200, color: color(Cesium, "#ded0ae", 0.34) },
          {
            height: 7600,
            color: color(Cesium, "#ffffff", terrainEmphasis ? 0.52 : 0.42)
          }
        ],
        extendDownwards: true,
        extendUpwards: true
      }
    ]
  });
}

function restoreGlobeMaterial(viewer: CesiumLikeViewer) {
  const globe = viewer.scene?.globe;
  const state = terrainStates.get(viewer);

  if (globe && state && "originalGlobeMaterial" in state) {
    globe.material = state.originalGlobeMaterial;
  }
}

function color(Cesium: Record<string, any>, css: string, alpha: number) {
  const parsed = Cesium.Color.fromCssColorString?.(css);
  if (parsed?.withAlpha) {
    return parsed.withAlpha(alpha);
  }

  return parsed ?? css;
}

function getTerrainState(viewer: CesiumLikeViewer) {
  let state = terrainStates.get(viewer);
  if (!state) {
    state = {};
    terrainStates.set(viewer, state);
  }

  return state;
}
