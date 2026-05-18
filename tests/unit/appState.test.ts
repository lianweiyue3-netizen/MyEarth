import { createStore } from "jotai/vanilla";
import { describe, expect, expectTypeOf, it } from "vitest";
import {
  accessibilityAtom,
  cameraModeAtom,
  defaultAccessibilityState,
  defaultLayerAvailability,
  defaultLayerVisibility,
  defaultQualityProfile,
  defaultSoundState,
  defaultTourState,
  defaultWeatherState,
  effectiveQualityAtom,
  isSerializableAtomValue,
  layerAvailabilityAtom,
  layerVisibilityAtom,
  loadingPhaseAtom,
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
  setLayerAvailabilityActionAtom,
  setLayerVisibilityActionAtom
} from "../../src/app/appActions";
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
    sourceNoteIds: ["test-source"],
    buildingDescentPreferred: false
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
    expect(store.get(layerAvailabilityAtom)).toEqual(defaultLayerAvailability);
    expect(store.get(tourStateAtom)).toEqual(defaultTourState);
    expect(store.get(soundStateAtom)).toEqual(defaultSoundState);
    expect(store.get(weatherStateAtom)).toEqual(defaultWeatherState);
    expect(store.get(accessibilityAtom)).toEqual(defaultAccessibilityState);
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
      "clouds",
      "atmosphere",
      "terrain",
      "labels",
      "buildings",
      "aurora",
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
    expect(after.clouds).toEqual(before.clouds);
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
});
