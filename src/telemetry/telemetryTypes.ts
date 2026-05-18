import type { LayerId } from "../shared/domain";

export type TelemetryEvent =
  | { type: "app_load_timing"; bucket: string }
  | { type: "cesium_init_failure"; category: string }
  | { type: "layer_load_failure"; layerId: LayerId; category: string }
  | { type: "runtime_error"; category: string }
  | { type: "frame_health"; bucket: "good" | "fair" | "poor" }
  | { type: "browser_capability"; bucket: string };

export type TelemetryClient = {
  track(event: TelemetryEvent): void;
};
