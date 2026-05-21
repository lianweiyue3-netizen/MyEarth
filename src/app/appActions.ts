import { atom } from "jotai";
import type { EarthLocation, LayerAvailability, LayerId } from "../shared/domain";
import type {
  NewsCountrySummary,
  NewsSnapshot,
  NewsUnavailableReason
} from "../news/newsTypes";
import {
  layerAvailabilityAtom,
  layerVisibilityAtom,
  newsStateAtom,
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

export type SelectNewsCountryInput = {
  countryCode: string;
};

export type SetNewsReadyInput = {
  snapshot: NewsSnapshot;
  stale?: boolean;
  message?: string;
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

export const setNewsLoadingActionAtom = atom(null, (_get, set) => {
  set(newsStateAtom, { status: "loading" });
});

export const setNewsReadyActionAtom = atom(
  null,
  (get, set, input: SetNewsReadyInput) => {
    const current = get(newsStateAtom);
    const selectedCountryCode =
      current.status === "ready" &&
      current.selectedCountryCode &&
      input.snapshot.countries[current.selectedCountryCode]
        ? current.selectedCountryCode
        : undefined;

    set(newsStateAtom, {
      status: "ready",
      snapshot: input.snapshot,
      ...(selectedCountryCode ? { selectedCountryCode } : {}),
      ...(input.stale === undefined ? {} : { stale: input.stale }),
      ...(input.message ? { message: input.message } : {})
    });
  }
);

export const setNewsUnavailableActionAtom = atom(
  null,
  (
    _get,
    set,
    input: { reason: NewsUnavailableReason; message: string }
  ) => {
    set(newsStateAtom, {
      status: "unavailable",
      reason: input.reason,
      message: input.message
    });
  }
);

export const selectNewsCountryActionAtom = atom(
  null,
  (get, set, input: SelectNewsCountryInput): NewsCountrySummary | undefined => {
    const current = get(newsStateAtom);
    if (current.status !== "ready") {
      return undefined;
    }

    const countryCode = input.countryCode.trim().toLowerCase();
    const country = current.snapshot.countries[countryCode];
    if (!country) {
      return undefined;
    }

    set(newsStateAtom, {
      ...current,
      selectedCountryCode: countryCode
    });
    return country;
  }
);

export const clearSelectedNewsCountryActionAtom = atom(null, (get, set) => {
  const current = get(newsStateAtom);

  if (current.status !== "ready" || !current.selectedCountryCode) {
    return;
  }

  set(newsStateAtom, {
    status: "ready",
    snapshot: current.snapshot,
    ...(current.stale === undefined ? {} : { stale: current.stale }),
    ...(current.message ? { message: current.message } : {})
  });
});
