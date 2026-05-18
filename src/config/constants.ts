import type { AppConfig } from "../shared/domain";

export const CESIUM_ION_TOKEN_ENV_KEY = "VITE_CESIUM_ION_TOKEN";
export const APP_ENV_ENV_KEY = "VITE_APP_ENV";
export const TELEMETRY_ENABLED_ENV_KEY = "VITE_TELEMETRY_ENABLED";
export const TELEMETRY_ENDPOINT_ENV_KEY = "VITE_TELEMETRY_ENDPOINT";

export const RAINVIEWER_METADATA_URL =
  "https://api.rainviewer.com/public/weather-maps.json";

export const SUPPORTED_APP_ENVS = [
  "development",
  "preview",
  "production"
] as const satisfies readonly AppConfig["appEnv"][];
