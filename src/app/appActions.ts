import { atom } from "jotai";
import type { EarthLocation, LayerAvailability, LayerId } from "../shared/domain";
import {
  layerAvailabilityAtom,
  layerVisibilityAtom,
  selectedLocationIdAtom
} from "./appAtoms";

export type LayerVisibilityUpdate = {
  layerId: LayerId;
  visible: boolean;
};

export type LayerAvailabilityUpdate = {
  layerId: LayerId;
  availability: LayerAvailability;
};

export type LocationIdSource =
  | ReadonlySet<string>
  | readonly EarthLocation[]
  | ((locationId: string) => boolean);

export type SelectLocationInput = {
  locationId: string;
  validLocationIds: LocationIdSource;
};

export type SelectLocationResult =
  | { status: "selected"; locationId: string }
  | {
      status: "rejected";
      reason: "unknown-location";
      locationId: string;
    };

function isLocationIdSet(
  validLocationIds: ReadonlySet<string> | readonly EarthLocation[]
): validLocationIds is ReadonlySet<string> {
  return typeof (validLocationIds as ReadonlySet<string>).has === "function";
}

export function updateLayerVisibility(
  current: Record<LayerId, boolean>,
  layerId: LayerId,
  visible: boolean
): Record<LayerId, boolean> {
  return {
    ...current,
    [layerId]: visible
  };
}

export function updateLayerAvailability(
  current: Record<LayerId, LayerAvailability>,
  layerId: LayerId,
  availability: LayerAvailability
): Record<LayerId, LayerAvailability> {
  return {
    ...current,
    [layerId]: availability
  };
}

export function isValidLocationId(
  locationId: string,
  validLocationIds: LocationIdSource
): boolean {
  if (locationId.length === 0) {
    return false;
  }

  if (typeof validLocationIds === "function") {
    return validLocationIds(locationId);
  }

  if (isLocationIdSet(validLocationIds)) {
    return validLocationIds.has(locationId);
  }

  return validLocationIds.some((location) => location.id === locationId);
}

export const setLayerVisibilityActionAtom = atom(
  null,
  (_get, set, update: LayerVisibilityUpdate) => {
    set(layerVisibilityAtom, (current) =>
      updateLayerVisibility(current, update.layerId, update.visible)
    );
  }
);

export const setLayerAvailabilityActionAtom = atom(
  null,
  (_get, set, update: LayerAvailabilityUpdate) => {
    set(layerAvailabilityAtom, (current) =>
      updateLayerAvailability(current, update.layerId, update.availability)
    );
  }
);

export const selectLocationActionAtom = atom(
  null,
  (_get, set, input: SelectLocationInput): SelectLocationResult => {
    if (!isValidLocationId(input.locationId, input.validLocationIds)) {
      return {
        status: "rejected",
        reason: "unknown-location",
        locationId: input.locationId
      };
    }

    set(selectedLocationIdAtom, input.locationId);
    return { status: "selected", locationId: input.locationId };
  }
);

export const clearSelectedLocationActionAtom = atom(null, (_get, set) => {
  set(selectedLocationIdAtom, undefined);
});
