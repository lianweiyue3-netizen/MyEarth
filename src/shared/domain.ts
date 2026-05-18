export type CameraMode =
  | "introOrbit"
  | "idleOrbit"
  | "manual"
  | "flyingToWonder"
  | "flyingToCity"
  | "tour"
  | "resetting";

export type VisualModeId =
  | "satellite"
  | "political"
  | "nightLights"
  | "terrainEmphasis"
  | "cleanGlobe";

export type LayerId =
  | "clouds"
  | "atmosphere"
  | "terrain"
  | "labels"
  | "buildings"
  | "weatherRadar"
  | "aurora"
  | "sound";

export type QualityMode = "auto" | "high" | "balanced" | "low";

export type LoadingPhase =
  | "boot"
  | "config"
  | "cesiumAssets"
  | "viewer"
  | "firstFrame"
  | "ready"
  | "failed";

export type LayerAvailability =
  | { status: "available" }
  | { status: "disabled"; reason: string }
  | { status: "failed"; reason: string; recoverable: boolean };

export type AppError = {
  code:
    | "missing-cesium-token"
    | "webgl-unavailable"
    | "cesium-init-failed"
    | "terrain-failed"
    | "layer-failed"
    | "weather-unavailable"
    | "search-failed"
    | "sound-unavailable";
  severity: "info" | "warning" | "fatal";
  publicMessage: string;
  recoverable: boolean;
};

export type AppConfig = {
  cesiumIonToken?: string;
  appEnv: "development" | "preview" | "production";
  telemetry: {
    enabled: boolean;
    endpoint?: string;
  };
};

export type LearningTopic =
  | "terrain"
  | "climate"
  | "ecosystems"
  | "atmosphere"
  | "water"
  | "ice"
  | "human-impact"
  | "urbanization"
  | "geology"
  | "biodiversity";

export type EarthLocation = {
  id: string;
  name: string;
  kind: "wonder" | "city";
  category: string;
  coordinates: {
    latitude: number;
    longitude: number;
    heightMeters?: number;
  };
  cameraPresetId: string;
  summary: string;
  facts: string[];
  topics: LearningTopic[];
  suggestedLayers: LayerId[];
  sourceNoteIds: string[];
  buildingDescentPreferred: boolean;
};

export type LearningPanelContent = {
  id: string;
  title: string;
  summary: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
  facts: string[];
  topics: LearningTopic[];
  suggestedLayers: LayerId[];
  sourceNoteIds: string[];
  illustrativeDisclaimer?: string;
};

export type CameraPreset = {
  id: string;
  target: {
    latitude: number;
    longitude: number;
    heightMeters?: number;
  };
  destinationHeightMeters: number;
  orientation: {
    headingDegrees: number;
    pitchDegrees: number;
    rollDegrees: number;
  };
  durationSeconds: {
    default: number;
    reducedMotion: number;
  };
};

export type VisualModeDefinition = {
  id: VisualModeId;
  label: string;
  description: string;
  defaultLayers: Partial<Record<LayerId, boolean>>;
  imageryStrategy:
    | "cesiumWorldImagery"
    | "cesiumLabels"
    | "blackMarble"
    | "terrainEmphasis"
    | "minimal";
  terrainEmphasis: boolean;
  radarOpacity: number;
};

export type QualityProfile = {
  mode: QualityMode;
  effectiveTier: "high" | "balanced" | "low";
  starDensity: "high" | "medium" | "low";
  cinematicGlow: "full" | "reduced" | "minimal";
  clouds: "full" | "simple" | "off";
  aurora: "full" | "simple" | "off";
  radar: "full" | "reducedOpacity" | "off";
  buildings: "on" | "off";
  terrainDetail: "normal" | "reduced";
  transitionScale: number;
};

export type TourState = {
  status: "idle" | "playing" | "paused" | "complete";
  currentLocationId?: string;
  currentIndex: number;
};

export type SoundState =
  | { status: "notPrompted" }
  | { status: "promptVisible" }
  | { status: "enabled"; volume: number }
  | { status: "disabled" }
  | { status: "unavailable"; reason: string };

export type WeatherState = {
  status: "idle" | "loading" | "ready" | "failed";
  latestFrameTime?: number;
};

export type CameraCommand =
  | { type: "startIntroOrbit" }
  | { type: "startIdleOrbit" }
  | { type: "pauseOrbit"; reason: "user" | "tour" | "system" }
  | {
      type: "flyToLocation";
      locationId: string;
      source: "wonder" | "city" | "search";
    }
  | {
      type: "flyToCoordinates";
      latitude: number;
      longitude: number;
      heightMeters?: number;
    }
  | { type: "resetView" };

export type CameraController = {
  execute(command: CameraCommand): Promise<void>;
  notifyManualInteraction(): void;
  getMode(): CameraMode;
  dispose(): void;
};

export type LayerController = {
  setVisualMode(mode: VisualModeId): Promise<void>;
  setLayerVisibility(id: LayerId, visible: boolean): Promise<void>;
  applyQuality(profile: QualityProfile): Promise<void>;
  dispose(): void;
};

export type SearchResult = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  heightMeters?: number;
};

export type WeatherRadarService = {
  getLatestFrame(signal?: AbortSignal): Promise<{
    host: string;
    path: string;
    time: number;
  }>;
  clearCache(): void;
};

export type TourController = {
  start(): void;
  pause(): void;
  resume(): void;
  next(): void;
  previous(): void;
  stop(): void;
};

export type Soundscape = {
  prompt(): void;
  enable(): Promise<SoundState>;
  disable(): Promise<SoundState>;
  setVolume(volume: number): void;
  dispose(): void;
};

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

export type UserPreferences = {
  soundPreference?: "enabled" | "disabled";
  qualityMode?: QualityMode;
  visualMode?: VisualModeId;
  reducedUi?: boolean;
};

export type PreferencesStore = {
  load(): UserPreferences;
  save(next: UserPreferences): void;
  clear(): void;
};
