import type {
  LayerAvailability,
  LayerController,
  LayerId,
  QualityProfile,
  VisualModeId
} from "../shared/domain";
import { defaultQualityProfile } from "../performance/qualityController";
import { setBaseImageryForVisualMode } from "./baseImageryLayer";
import {
  available,
  disabled,
  type CesiumLayerAdapter,
  type CesiumLikeViewer,
  type LayerAdapterContext
} from "./layerDefinitions";
import { createLabelLayerAdapter } from "./labelLayer";
import { createNewsHeatmapLayerAdapter } from "./newsHeatmapLayer";
import { setNightLightsVisible } from "./nightLightsLayer";
import { createTerrainLayerAdapter } from "./terrainLayer";
import { getVisualMode } from "./visualModes";
import { createWeatherRadarLayerAdapter } from "./weatherRadarLayer";
import { createWeatherRadarService } from "./weatherRadarService";

export type LayerControllerOptions = {
  viewer: CesiumLikeViewer;
  quality?: QualityProfile;
  reducedMotion?: boolean;
  onAvailabilityChange?: (id: LayerId, availability: LayerAvailability) => void;
  adapters?: CesiumLayerAdapter[];
};

export function createLayerController(options: LayerControllerOptions): LayerController {
  let quality = options.quality ?? defaultQualityProfile;
  let currentVisualMode = getVisualMode("satellite");
  let labelsVisible = false;
  const context = (): LayerAdapterContext => ({
    viewer: options.viewer,
    quality,
    reducedMotion: options.reducedMotion ?? false
  });

  const adapters =
    options.adapters ??
    [
      createTerrainLayerAdapter(),
      createLabelLayerAdapter(),
      createNewsHeatmapLayerAdapter(),
      createWeatherRadarLayerAdapter(createWeatherRadarService())
    ];

  const byId = new Map(adapters.map((adapter) => [adapter.id, adapter]));
  const publish = (id: LayerId, availability: LayerAvailability) => {
    options.onAvailabilityChange?.(id, availability);
  };

  async function runAdapter(
    id: LayerId,
    work: (adapter: CesiumLayerAdapter) => Promise<LayerAvailability>
  ) {
    const adapter = byId.get(id);
    if (!adapter) {
      publish(id, { status: "disabled", reason: "Layer adapter is not registered." });
      return;
    }

    const availability = await work(adapter);
    publish(id, availability);
  }

  return {
    async setVisualMode(modeId: VisualModeId) {
      currentVisualMode = getVisualMode(modeId);
      await setBaseImageryForVisualMode(context(), currentVisualMode, labelsVisible);
      await setNightLightsVisible(
        context(),
        currentVisualMode.imageryStrategy === "blackMarble"
      );

      for (const adapter of adapters) {
        if (adapter.applyVisualMode) {
          publish(adapter.id, await adapter.applyVisualMode(context(), currentVisualMode));
        }
      }

      publish("labels", available);
      publish("atmosphere", available);
    },
    async setLayerVisibility(id, visible) {
      if (id === "atmosphere") {
        if (options.viewer.scene?.globe) {
          options.viewer.scene.globe.showGroundAtmosphere = visible;
        }
        publish(id, available);
        return;
      }

      if (id === "sound") {
        publish(id, available);
        return;
      }

      if (id === "buildings") {
        publish(id, disabled("3D buildings are hidden to keep the view unobstructed."));
        return;
      }

      if (id === "labels") {
        labelsVisible = visible;
        const labelsAdapter = byId.get("labels");
        const labelAvailability = labelsAdapter
          ? await labelsAdapter.setVisible(context(), visible)
          : available;
        const imageryAvailability = await setBaseImageryForVisualMode(
          context(),
          currentVisualMode,
          labelsVisible
        );
        publish(id, firstUnavailable(labelAvailability, imageryAvailability) ?? available);
        return;
      }

      await runAdapter(id, (adapter) => adapter.setVisible(context(), visible));
    },
    async applyQuality(profile) {
      quality = profile;
      for (const adapter of adapters) {
        if (adapter.applyQuality) {
          publish(adapter.id, await adapter.applyQuality(context()));
        }
      }
    },
    dispose() {
      for (const adapter of adapters) {
        adapter.dispose?.(options.viewer);
      }
    }
  };
}

function firstUnavailable(
  ...availability: LayerAvailability[]
): LayerAvailability | undefined {
  return availability.find((entry) => entry.status !== "available");
}
