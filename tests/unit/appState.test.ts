import { createStore } from "jotai/vanilla";
import { describe, expect, expectTypeOf, it } from "vitest";
import {
  accessibilityAtom,
  cameraModeAtom,
  defaultAccessibilityState,
  defaultLayerAvailability,
  defaultLayerVisibility,
  defaultNewsState,
  defaultQualityProfile,
  defaultSoundState,
  defaultTourState,
  defaultWeatherState,
  effectiveQualityAtom,
  isSerializableAtomValue,
  layerAvailabilityAtom,
  layerVisibilityAtom,
  loadingPhaseAtom,
  newsStateAtom,
  qualityModeAtom,
  selectedLocationIdAtom,
  soundStateAtom,
  tourStateAtom,
  visualModeAtom,
  weatherStateAtom
} from "../../src/app/appAtoms";
import type { SerializableAtomValue } from "../../src/app/appAtoms";
import {
  clearSelectedLocationActionAtom,
  selectLocationActionAtom,
  selectNewsCountryActionAtom,
  setNewsReadyActionAtom,
  setLayerAvailabilityActionAtom,
  setLayerVisibilityActionAtom
} from "../../src/app/appActions";
import type { NewsSnapshot } from "../../src/news/newsTypes";
import type {
  EarthLocation,
  LayerAvailability,
  LayerId
} from "../../src/shared/domain";

function createLocation(id: string): EarthLocation {
  return {
    id,
    name: "Mount Everest",
    kind: "wonder",
    category: "Mountain",
    coordinates: {
      latitude: 27.9881,
      longitude: 86.925,
      heightMeters: 8849
    },
    cameraPresetId: "mount-everest",
    summary: "A test location record.",
    facts: ["High peak", "Himalayan range", "Glaciated terrain"],
    topics: ["terrain"],
    suggestedLayers: ["terrain"],
    sourceNoteIds: ["test-source"]
  };
}

function createNewsSnapshot(): NewsSnapshot {
  return {
    provider: "GNews",
    category: "general",
    language: "en",
    lastUpdated: "2026-05-21T00:00:00.000Z",
    countries: {
      us: {
        countryCode: "us",
        countryName: "United States",
        headlineCount: 1,
        articles: [
          {
            id: "us-0-test",
            title: "Test headline",
            summary: "Short summary",
            url: "https://example.com/news",
            sourceName: "Example News",
            publishedAt: "2026-05-21T00:00:00.000Z"
          }
        ]
      }
    }
  };
}

describe("Jotai app state", () => {
  it("starts with first-load defaults from the design", () => {
    const store = createStore();

    expect(store.get(loadingPhaseAtom)).toBe("boot");
    expect(store.get(cameraModeAtom)).toBe("introOrbit");
    expect(store.get(selectedLocationIdAtom)).toBeUndefined();
    expect(store.get(visualModeAtom)).toBe("satellite");
    expect(store.get(qualityModeAtom)).toBe("auto");
    expect(store.get(effectiveQualityAtom)).toEqual(defaultQualityProfile);
    expect(store.get(layerVisibilityAtom)).toEqual(defaultLayerVisibility);
    expect(store.get(layerVisibilityAtom).labels).toBe(false);
    expect(store.get(layerAvailabilityAtom)).toEqual(defaultLayerAvailability);
    expect(store.get(tourStateAtom)).toEqual(defaultTourState);
    expect(store.get(soundStateAtom)).toEqual(defaultSoundState);
    expect(store.get(weatherStateAtom)).toEqual(defaultWeatherState);
    expect(store.get(newsStateAtom)).toEqual(defaultNewsState);
    expect(store.get(accessibilityAtom)).toEqual(defaultAccessibilityState);
    expect(store.get(layerVisibilityAtom).newsHeatmap).toBe(false);
    expect(store.get(layerAvailabilityAtom).newsHeatmap).toEqual({
      status: "disabled",
      reason: "News headlines have not loaded."
    });
  });

  it("updates one layer visibility without mutating unrelated layers", () => {
    const store = createStore();
    const before = store.get(layerVisibilityAtom);

    store.set(setLayerVisibilityActionAtom, {
      layerId: "weatherRadar",
      visible: true
    });

    const after = store.get(layerVisibilityAtom);
    expect(after).not.toBe(before);
    expect(before.weatherRadar).toBe(false);
    expect(after.weatherRadar).toBe(true);

    const unchangedLayerIds: LayerId[] = [
      "atmosphere",
      "terrain",
      "labels",
      "buildings",
      "newsHeatmap",
      "sound"
    ];
    for (const layerId of unchangedLayerIds) {
      expect(after[layerId]).toBe(before[layerId]);
    }
  });

  it("updates one layer availability without mutating unrelated layers", () => {
    const store = createStore();
    const before = store.get(layerAvailabilityAtom);
    const availability: LayerAvailability = {
      status: "failed",
      reason: "RainViewer metadata unavailable",
      recoverable: true
    };

    store.set(setLayerAvailabilityActionAtom, {
      layerId: "weatherRadar",
      availability
    });

    const after = store.get(layerAvailabilityAtom);
    expect(after).not.toBe(before);
    expect(after.weatherRadar).toEqual(availability);
    expect(after.buildings).toEqual(before.buildings);
  });

  it("rejects invalid location selection and preserves the existing selection", () => {
    const store = createStore();
    const validLocations = [createLocation("mount-everest")];

    const selected = store.set(selectLocationActionAtom, {
      locationId: "mount-everest",
      validLocationIds: validLocations
    });
    expect(selected).toEqual({
      status: "selected",
      locationId: "mount-everest"
    });

    const rejected = store.set(selectLocationActionAtom, {
      locationId: "unknown-location",
      validLocationIds: validLocations
    });

    expect(rejected).toEqual({
      status: "rejected",
      reason: "unknown-location",
      locationId: "unknown-location"
    });
    expect(store.get(selectedLocationIdAtom)).toBe("mount-everest");
  });

  it("clears the selected location through an action helper", () => {
    const store = createStore();
    const validLocationIds = new Set(["mount-everest"]);

    store.set(selectLocationActionAtom, {
      locationId: "mount-everest",
      validLocationIds
    });
    store.set(clearSelectedLocationActionAtom);

    expect(store.get(selectedLocationIdAtom)).toBeUndefined();
  });

  it("keeps atom defaults serializable and rejects Cesium-like objects", () => {
    const store = createStore();
    const defaults = [
      store.get(loadingPhaseAtom),
      store.get(cameraModeAtom),
      store.get(selectedLocationIdAtom),
      store.get(visualModeAtom),
      store.get(qualityModeAtom),
      store.get(effectiveQualityAtom),
      store.get(layerVisibilityAtom),
      store.get(layerAvailabilityAtom),
      store.get(tourStateAtom),
      store.get(soundStateAtom),
      store.get(weatherStateAtom),
      store.get(newsStateAtom),
      store.get(accessibilityAtom)
    ];

    for (const value of defaults) {
      expect(isSerializableAtomValue(value)).toBe(true);
    }

    const cesiumLikeViewer = {
      scene: {},
      destroy: () => undefined
    };

    expect(isSerializableAtomValue(cesiumLikeViewer)).toBe(false);
    expectTypeOf<typeof defaultLayerVisibility>().toExtend<SerializableAtomValue>();
    expectTypeOf<typeof defaultQualityProfile>().toExtend<SerializableAtomValue>();
    expectTypeOf<{ destroy: () => void }>().not.toExtend<SerializableAtomValue>();
  });

  it("selects known news countries and rejects unknown countries", () => {
    const store = createStore();

    store.set(setNewsReadyActionAtom, {
      snapshot: createNewsSnapshot(),
      stale: false
    });

    expect(store.set(selectNewsCountryActionAtom, { countryCode: "US" })).toEqual(
      expect.objectContaining({ countryCode: "us", countryName: "United States" })
    );
    expect(store.get(newsStateAtom)).toMatchObject({
      status: "ready",
      selectedCountryCode: "us"
    });

    expect(
      store.set(selectNewsCountryActionAtom, { countryCode: "unknown" })
    ).toBeUndefined();
    expect(store.get(layerVisibilityAtom).weatherRadar).toBe(false);
  });
});
