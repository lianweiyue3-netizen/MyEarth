import { atom } from "jotai";
import type {
  CameraMode,
  LayerAvailability,
  LayerId,
  LoadingPhase,
  QualityMode,
  QualityProfile,
  SoundState,
  TourState,
  VisualModeId,
  WeatherState
} from "../shared/domain";
import type { NewsState } from "../news/newsTypes";

export type SerializableAtomPrimitive =
  | string
  | number
  | boolean
  | null
  | undefined;

export type SerializableAtomValue =
  | SerializableAtomPrimitive
  | readonly SerializableAtomValue[]
  | { readonly [key: string]: SerializableAtomValue };

export type AccessibilityState = {
  reducedMotion: boolean;
  reducedUi: boolean;
};

export const layerIds = [
  "atmosphere",
  "terrain",
  "labels",
  "buildings",
  "weatherRadar",
  "newsHeatmap",
  "sound"
] as const satisfies readonly LayerId[];

export const defaultQualityProfile: QualityProfile = {
  mode: "auto",
  effectiveTier: "balanced",
  starDensity: "medium",
  cinematicGlow: "reduced",
  radar: "reducedOpacity",
  buildings: "off",
  terrainDetail: "normal",
  transitionScale: 1
};

export const defaultLayerVisibility: Record<LayerId, boolean> = {
  atmosphere: true,
  terrain: true,
  labels: false,
  buildings: false,
  weatherRadar: false,
  newsHeatmap: false,
  sound: false
};

export const defaultLayerAvailability: Record<LayerId, LayerAvailability> = {
  atmosphere: { status: "available" },
  terrain: { status: "available" },
  labels: { status: "available" },
  buildings: {
    status: "disabled",
    reason: "3D buildings are hidden to keep the view unobstructed."
  },
  weatherRadar: { status: "available" },
  newsHeatmap: {
    status: "disabled",
    reason: "News headlines have not loaded."
  },
  sound: { status: "available" }
};

export const defaultTourState: TourState = {
  status: "idle",
  currentIndex: 0
};

export const defaultSoundState: SoundState = { status: "notPrompted" };

export const defaultWeatherState: WeatherState = { status: "idle" };

export const defaultNewsState: NewsState = { status: "idle" };

export const defaultAccessibilityState: AccessibilityState = {
  reducedMotion: false,
  reducedUi: false
};

export function createSerializableAtom<T extends SerializableAtomValue>(
  initialValue: T
) {
  return atom<T>(initialValue);
}

export function isSerializableAtomValue(
  value: unknown
): value is SerializableAtomValue {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string" || typeof value === "boolean") {
    return true;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.every(isSerializableAtomValue);
  }

  if (typeof value !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    return false;
  }

  return Object.values(value).every(isSerializableAtomValue);
}

export const loadingPhaseAtom =
  createSerializableAtom<LoadingPhase>("boot");

export const cameraModeAtom =
  createSerializableAtom<CameraMode>("introOrbit");

export const selectedLocationIdAtom =
  createSerializableAtom<string | undefined>(undefined);

export const visualModeAtom =
  createSerializableAtom<VisualModeId>("satellite");

export const qualityModeAtom = createSerializableAtom<QualityMode>("auto");

export const effectiveQualityAtom =
  createSerializableAtom<QualityProfile>(defaultQualityProfile);

export const layerVisibilityAtom =
  createSerializableAtom<Record<LayerId, boolean>>(defaultLayerVisibility);

export const layerAvailabilityAtom =
  createSerializableAtom<Record<LayerId, LayerAvailability>>(
    defaultLayerAvailability
  );

export const tourStateAtom = createSerializableAtom<TourState>(defaultTourState);

export const soundStateAtom =
  createSerializableAtom<SoundState>(defaultSoundState);

export const weatherStateAtom =
  createSerializableAtom<WeatherState>(defaultWeatherState);

export const newsStateAtom =
  createSerializableAtom<NewsState>(defaultNewsState);

export const accessibilityAtom =
  createSerializableAtom<AccessibilityState>(defaultAccessibilityState);
