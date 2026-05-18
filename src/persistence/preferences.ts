import type {
  PreferencesStore,
  QualityMode,
  UserPreferences,
  VisualModeId
} from "../shared/domain";

export type { PreferencesStore, UserPreferences } from "../shared/domain";

export const PREFERENCE_STORAGE_KEYS = {
  soundPreference: "myearth.soundPreference",
  qualityMode: "myearth.qualityMode",
  visualMode: "myearth.visualMode",
  reducedUi: "myearth.reducedUi"
} as const satisfies Record<keyof UserPreferences, string>;

const soundPreferences = new Set<string>(["enabled", "disabled"]);

const qualityModes = new Set<QualityMode>(["auto", "high", "balanced", "low"]);

const visualModes = new Set<VisualModeId>([
  "satellite",
  "political",
  "nightLights",
  "terrainEmphasis",
  "cleanGlobe"
]);

export function createPreferencesStore(storage = getBrowserLocalStorage()): PreferencesStore {
  return {
    load(): UserPreferences {
      if (!storage) {
        return {};
      }

      return {
        ...loadPreference(
          storage,
          "soundPreference",
          isSoundPreference
        ),
        ...loadPreference(storage, "qualityMode", isQualityMode),
        ...loadPreference(storage, "visualMode", isVisualMode),
        ...loadPreference(storage, "reducedUi", isBoolean)
      };
    },

    save(next: UserPreferences): void {
      if (!storage) {
        return;
      }

      writePreference(
        storage,
        "soundPreference",
        next.soundPreference,
        isSoundPreference
      );
      writePreference(storage, "qualityMode", next.qualityMode, isQualityMode);
      writePreference(storage, "visualMode", next.visualMode, isVisualMode);
      writePreference(storage, "reducedUi", next.reducedUi, isBoolean);
    },

    clear(): void {
      if (!storage) {
        return;
      }

      removePreference(storage, "soundPreference");
      removePreference(storage, "qualityMode");
      removePreference(storage, "visualMode");
      removePreference(storage, "reducedUi");
    }
  };
}

export const preferencesStore = createPreferencesStore();

function getBrowserLocalStorage(): Storage | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function loadPreference<Key extends keyof UserPreferences>(
  storage: Storage,
  key: Key,
  isValid: (value: unknown) => value is NonNullable<UserPreferences[Key]>
): Pick<UserPreferences, Key> | Record<string, never> {
  const raw = readPreference(storage, key);

  if (raw === undefined) {
    return {};
  }

  const parsed = parsePreference(raw);

  if (!isValid(parsed)) {
    return {};
  }

  return { [key]: parsed } as Pick<UserPreferences, Key>;
}

function readPreference<Key extends keyof UserPreferences>(
  storage: Storage,
  key: Key
): string | undefined {
  try {
    return storage.getItem(PREFERENCE_STORAGE_KEYS[key]) ?? undefined;
  } catch {
    return undefined;
  }
}

function writePreference<Key extends keyof UserPreferences>(
  storage: Storage,
  key: Key,
  value: unknown,
  isValid: (value: unknown) => value is NonNullable<UserPreferences[Key]>
): void {
  if (value === undefined) {
    removePreference(storage, key);
    return;
  }

  if (!isValid(value)) {
    removePreference(storage, key);
    return;
  }

  try {
    storage.setItem(PREFERENCE_STORAGE_KEYS[key], JSON.stringify(value));
  } catch {
    // Preference persistence is best-effort; callers should keep using in-memory state.
  }
}

function removePreference<Key extends keyof UserPreferences>(
  storage: Storage,
  key: Key
): void {
  try {
    storage.removeItem(PREFERENCE_STORAGE_KEYS[key]);
  } catch {
    // Preference persistence is best-effort; callers should keep using in-memory state.
  }
}

function parsePreference(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function isSoundPreference(
  value: unknown
): value is NonNullable<UserPreferences["soundPreference"]> {
  return typeof value === "string" && soundPreferences.has(value);
}

function isQualityMode(value: unknown): value is QualityMode {
  return typeof value === "string" && qualityModes.has(value as QualityMode);
}

function isVisualMode(value: unknown): value is VisualModeId {
  return typeof value === "string" && visualModes.has(value as VisualModeId);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}
