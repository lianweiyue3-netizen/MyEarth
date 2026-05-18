import { afterEach, describe, expect, it, vi } from "vitest";
import { readAppConfig } from "../../src/config/env";
import {
  CESIUM_ION_TOKEN_ENV_KEY,
  RAINVIEWER_METADATA_URL
} from "../../src/config/constants";

function createEnv(overrides: Record<string, string | undefined> = {}) {
  return {
    BASE_URL: "/",
    DEV: true,
    MODE: "test",
    PROD: false,
    SSR: false,
    ...overrides
  } as ImportMetaEnv;
}

describe("readAppConfig", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses a valid Cesium ion token", () => {
    const config = readAppConfig(
      createEnv({
        [CESIUM_ION_TOKEN_ENV_KEY]: " test-token ",
        VITE_APP_ENV: "production"
      })
    );

    expect(config).toMatchObject({
      cesiumIonToken: "test-token",
      appEnv: "production"
    });
  });

  it("handles a missing Cesium ion token without throwing", () => {
    expect(() => readAppConfig(createEnv())).not.toThrow();

    const config = readAppConfig(createEnv());

    expect(config.cesiumIonToken).toBeUndefined();
    expect(config.appEnv).toBe("development");
  });

  it("disables telemetry by default and ignores the endpoint", () => {
    const config = readAppConfig(
      createEnv({
        VITE_TELEMETRY_ENDPOINT: "https://telemetry.example/events"
      })
    );

    expect(config.telemetry).toEqual({ enabled: false });
  });

  it("enables telemetry only with the explicit flag and a valid endpoint", () => {
    const config = readAppConfig(
      createEnv({
        VITE_TELEMETRY_ENABLED: "true",
        VITE_TELEMETRY_ENDPOINT: "https://telemetry.example/events"
      })
    );

    expect(config.telemetry).toEqual({
      enabled: true,
      endpoint: "https://telemetry.example/events"
    });

    const uppercaseFlagConfig = readAppConfig(
      createEnv({
        VITE_TELEMETRY_ENABLED: "TRUE",
        VITE_TELEMETRY_ENDPOINT: "https://telemetry.example/events"
      })
    );

    expect(uppercaseFlagConfig.telemetry).toEqual({ enabled: false });
  });

  it("falls back unsupported app environments to development", () => {
    const config = readAppConfig(
      createEnv({
        VITE_APP_ENV: "staging"
      })
    );

    expect(config.appEnv).toBe("development");
  });

  it("disables telemetry for an invalid endpoint without exposing token values", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const secretToken = "secret-token-that-must-not-leak";

    expect(() =>
      readAppConfig(
        createEnv({
          [CESIUM_ION_TOKEN_ENV_KEY]: secretToken,
          VITE_TELEMETRY_ENABLED: "true",
          VITE_TELEMETRY_ENDPOINT: "not-a-url"
        })
      )
    ).not.toThrow();

    const config = readAppConfig(
      createEnv({
        [CESIUM_ION_TOKEN_ENV_KEY]: secretToken,
        VITE_TELEMETRY_ENABLED: "true",
        VITE_TELEMETRY_ENDPOINT: "not-a-url"
      })
    );

    expect(config.telemetry).toEqual({ enabled: false });
    expect(warn).toHaveBeenCalledWith(
      "Invalid VITE_TELEMETRY_ENDPOINT; telemetry has been disabled."
    );
    expect(warn.mock.calls.flat().join(" ")).not.toContain(secretToken);
  });
});

describe("configuration constants", () => {
  it("exposes the RainViewer metadata URL", () => {
    expect(RAINVIEWER_METADATA_URL).toBe(
      "https://api.rainviewer.com/public/weather-maps.json"
    );
  });
});
