import type { AppConfig, LayerId } from "../shared/domain";
import type { TelemetryClient, TelemetryEvent } from "./telemetryTypes";

type TelemetryConfig = AppConfig["telemetry"];
type RawTelemetryConfig = Partial<TelemetryConfig> | null | undefined;

type TelemetryClientOptions = {
  transport?: typeof fetch;
};

type SerializedTelemetryEvent = TelemetryEvent;

const validLayerIds: ReadonlySet<LayerId> = new Set([
  "atmosphere",
  "terrain",
  "labels",
  "buildings",
  "weatherRadar",
  "sound"
]);

const frameHealthBuckets = new Set(["good", "fair", "poor"]);
const safeTokenPattern = /^[a-zA-Z0-9_.:-]{1,80}$/;

export const defaultTelemetryClient: TelemetryClient = {
  track: () => undefined
};

export function createNoopTelemetryClient(): TelemetryClient {
  return defaultTelemetryClient;
}

export function createTelemetryClient(
  config: TelemetryConfig | Pick<AppConfig, "telemetry">,
  options: TelemetryClientOptions = {}
): TelemetryClient {
  const telemetryConfig = normalizeTelemetryConfig(config);

  if (!isEnabledEndpointConfig(telemetryConfig)) {
    return defaultTelemetryClient;
  }

  const endpoint = telemetryConfig.endpoint.trim();
  const transport = options.transport ?? globalThis.fetch?.bind(globalThis);

  if (!transport) {
    return defaultTelemetryClient;
  }

  return {
    track: (event) => {
      const payload = serializeTelemetryEvent(event);

      if (!payload) {
        return;
      }

      try {
        void Promise.resolve(
          transport(endpoint, {
            method: "POST",
            headers: {
              "content-type": "application/json"
            },
            keepalive: true,
            body: JSON.stringify(payload)
          })
        ).catch(() => undefined);
      } catch {
        // Telemetry must never affect the application path.
      }
    }
  };
}

function normalizeTelemetryConfig(
  config: TelemetryConfig | Pick<AppConfig, "telemetry">
): RawTelemetryConfig {
  if (!config || typeof config !== "object") {
    return undefined;
  }

  if ("telemetry" in config) {
    return config.telemetry;
  }

  return config;
}

function isEnabledEndpointConfig(
  config: RawTelemetryConfig
): config is TelemetryConfig & { endpoint: string } {
  return config?.enabled === true && isValidEndpoint(config.endpoint);
}

function isValidEndpoint(endpoint: string | undefined): endpoint is string {
  if (!endpoint) {
    return false;
  }

  const trimmed = endpoint.trim();

  if (trimmed.length === 0) {
    return false;
  }

  if (trimmed.startsWith("/")) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);

    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function serializeTelemetryEvent(
  event: TelemetryEvent
): SerializedTelemetryEvent | null {
  switch (event.type) {
    case "app_load_timing":
      return { type: event.type, bucket: sanitizeToken(event.bucket) };
    case "cesium_init_failure":
      return { type: event.type, category: sanitizeToken(event.category) };
    case "layer_load_failure":
      if (!validLayerIds.has(event.layerId)) {
        return null;
      }

      return {
        type: event.type,
        layerId: event.layerId,
        category: sanitizeToken(event.category)
      };
    case "runtime_error":
      return { type: event.type, category: sanitizeToken(event.category) };
    case "frame_health":
      if (!frameHealthBuckets.has(event.bucket)) {
        return null;
      }

      return { type: event.type, bucket: event.bucket };
    case "browser_capability":
      return { type: event.type, bucket: sanitizeToken(event.bucket) };
    default:
      return null;
  }
}

function sanitizeToken(value: string): string {
  const trimmed = value.trim();

  if (!safeTokenPattern.test(trimmed)) {
    return "other";
  }

  return trimmed;
}
