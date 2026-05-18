import type { AppConfig } from "../shared/domain";
import {
  APP_ENV_ENV_KEY,
  CESIUM_ION_TOKEN_ENV_KEY,
  SUPPORTED_APP_ENVS,
  TELEMETRY_ENABLED_ENV_KEY,
  TELEMETRY_ENDPOINT_ENV_KEY
} from "./constants";

type AppEnv = AppConfig["appEnv"];

const DEFAULT_APP_ENV: AppEnv = "development";

export function readAppConfig(env: ImportMetaEnv): AppConfig {
  const cesiumIonToken = readOptionalEnvString(env[CESIUM_ION_TOKEN_ENV_KEY]);

  return {
    ...(cesiumIonToken ? { cesiumIonToken } : {}),
    appEnv: parseAppEnv(env[APP_ENV_ENV_KEY]),
    telemetry: parseTelemetryConfig(env)
  };
}

function parseAppEnv(value: string | undefined): AppEnv {
  return isSupportedAppEnv(value) ? value : DEFAULT_APP_ENV;
}

function parseTelemetryConfig(env: ImportMetaEnv): AppConfig["telemetry"] {
  if (env[TELEMETRY_ENABLED_ENV_KEY] !== "true") {
    return { enabled: false };
  }

  const endpoint = readOptionalEnvString(env[TELEMETRY_ENDPOINT_ENV_KEY]);

  if (!endpoint) {
    return { enabled: true };
  }

  if (!isValidTelemetryEndpoint(endpoint)) {
    console.warn(
      `Invalid ${TELEMETRY_ENDPOINT_ENV_KEY}; telemetry has been disabled.`
    );

    return { enabled: false };
  }

  return {
    enabled: true,
    endpoint
  };
}

function readOptionalEnvString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function isSupportedAppEnv(value: string | undefined): value is AppEnv {
  return SUPPORTED_APP_ENVS.includes(value as AppEnv);
}

function isValidTelemetryEndpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
