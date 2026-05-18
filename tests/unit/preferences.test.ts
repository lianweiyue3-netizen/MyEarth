import { describe, expect, it } from "vitest";
import type { UserPreferences } from "../../src/persistence/preferences";
import {
  createPreferencesStore,
  PREFERENCE_STORAGE_KEYS
} from "../../src/persistence/preferences";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

class ThrowingStorage extends MemoryStorage {
  override getItem(): string | null {
    throw new Error("localStorage unavailable");
  }

  override removeItem(): void {
    throw new Error("localStorage unavailable");
  }

  override setItem(): void {
    throw new Error("localStorage unavailable");
  }
}

describe("PreferencesStore", () => {
  it("loads valid preferences from the allowed storage keys", () => {
    const storage = new MemoryStorage();
    storage.setItem(PREFERENCE_STORAGE_KEYS.soundPreference, '"enabled"');
    storage.setItem(PREFERENCE_STORAGE_KEYS.qualityMode, '"balanced"');
    storage.setItem(PREFERENCE_STORAGE_KEYS.visualMode, '"nightLights"');
    storage.setItem(PREFERENCE_STORAGE_KEYS.reducedUi, "true");

    expect(createPreferencesStore(storage).load()).toEqual({
      soundPreference: "enabled",
      qualityMode: "balanced",
      visualMode: "nightLights",
      reducedUi: true
    });
  });

  it("saves only valid preference fields to the allowed storage keys", () => {
    const storage = new MemoryStorage();

    createPreferencesStore(storage).save({
      soundPreference: "disabled",
      qualityMode: "high",
      visualMode: "terrainEmphasis",
      reducedUi: false
    });

    expect(storage.getItem(PREFERENCE_STORAGE_KEYS.soundPreference)).toBe(
      '"disabled"'
    );
    expect(storage.getItem(PREFERENCE_STORAGE_KEYS.qualityMode)).toBe('"high"');
    expect(storage.getItem(PREFERENCE_STORAGE_KEYS.visualMode)).toBe(
      '"terrainEmphasis"'
    );
    expect(storage.getItem(PREFERENCE_STORAGE_KEYS.reducedUi)).toBe("false");
    expect(storage.length).toBe(4);
  });

  it("removes previously saved allowed keys when saving undefined values", () => {
    const storage = new MemoryStorage();
    const store = createPreferencesStore(storage);

    store.save({
      soundPreference: "enabled",
      qualityMode: "low",
      visualMode: "cleanGlobe",
      reducedUi: true
    });
    store.save({});

    expect(store.load()).toEqual({});
    expect(storage.length).toBe(0);
  });

  it("rejects invalid enum and boolean values", () => {
    const storage = new MemoryStorage();
    storage.setItem(PREFERENCE_STORAGE_KEYS.soundPreference, '"muted"');
    storage.setItem(PREFERENCE_STORAGE_KEYS.qualityMode, '"maximum"');
    storage.setItem(PREFERENCE_STORAGE_KEYS.visualMode, '"streetView"');
    storage.setItem(PREFERENCE_STORAGE_KEYS.reducedUi, '"true"');

    expect(createPreferencesStore(storage).load()).toEqual({});
  });

  it("does not save invalid runtime values for allowed keys", () => {
    const storage = new MemoryStorage();
    const store = createPreferencesStore(storage);

    store.save({
      soundPreference: "enabled",
      qualityMode: "balanced",
      visualMode: "satellite",
      reducedUi: true
    });
    store.save({
      soundPreference: "muted",
      qualityMode: "maximum",
      visualMode: "streetView",
      reducedUi: "yes"
    } as unknown as UserPreferences);

    expect(store.load()).toEqual({});
    expect(storage.length).toBe(0);
  });

  it("ignores corrupt JSON values without failing the whole load", () => {
    const storage = new MemoryStorage();
    storage.setItem(PREFERENCE_STORAGE_KEYS.soundPreference, "{enabled");
    storage.setItem(PREFERENCE_STORAGE_KEYS.qualityMode, '"auto"');
    storage.setItem(PREFERENCE_STORAGE_KEYS.visualMode, "nightLights");
    storage.setItem(PREFERENCE_STORAGE_KEYS.reducedUi, "true");

    expect(createPreferencesStore(storage).load()).toEqual({
      qualityMode: "auto",
      reducedUi: true
    });
  });

  it("falls back to empty preferences when local storage is unavailable", () => {
    const store = createPreferencesStore(new ThrowingStorage());

    expect(store.load()).toEqual({});
    expect(() =>
      store.save({
        soundPreference: "enabled",
        qualityMode: "auto",
        visualMode: "satellite",
        reducedUi: true
      })
    ).not.toThrow();
    expect(() => store.clear()).not.toThrow();
  });

  it("does not support disallowed search, location, or telemetry keys", () => {
    const storage = new MemoryStorage();
    const disallowedPreferences = {
      soundPreference: "enabled",
      searchQuery: "everest",
      preciseLocation: { latitude: 35.681236, longitude: 139.767125 },
      telemetryId: "abc-123"
    } as unknown as UserPreferences;

    createPreferencesStore(storage).save(disallowedPreferences);

    expect(storage.getItem(PREFERENCE_STORAGE_KEYS.soundPreference)).toBe(
      '"enabled"'
    );
    expect(storage.getItem("myearth.searchQuery")).toBeNull();
    expect(storage.getItem("myearth.preciseLocation")).toBeNull();
    expect(storage.getItem("myearth.telemetryId")).toBeNull();
    expect(storage.length).toBe(1);
  });
});
