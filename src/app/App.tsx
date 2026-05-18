import { useAtom, useSetAtom } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "../accessibility/reducedMotion";
import { CesiumScene } from "../cesium/CesiumScene";
import { readAppConfig } from "../config/env";
import { earthLocations } from "../content/locations";
import { createCesiumGeocoderAdapter } from "../search/cesiumGeocoderAdapter";
import { createSearchService } from "../search/searchService";
import { createSoundscape } from "../sound/soundscape";
import { createTourController } from "../tour/tourController";
import { computeQualityProfile } from "../performance/qualityController";
import { createPreferencesStore } from "../persistence/preferences";
import { createTelemetryClient } from "../telemetry/telemetry";
import type {
  AppError,
  CameraCommand,
  EarthLocation,
  LayerId,
  SearchResult,
  Soundscape,
  TourController
} from "../shared/domain";
import {
  accessibilityAtom,
  cameraModeAtom,
  effectiveQualityAtom,
  layerAvailabilityAtom,
  layerVisibilityAtom,
  loadingPhaseAtom,
  qualityModeAtom,
  selectedLocationIdAtom,
  soundStateAtom,
  tourStateAtom,
  visualModeAtom
} from "./appAtoms";
import {
  selectLocationActionAtom,
  setLayerAvailabilityActionAtom,
  setLayerVisibilityActionAtom
} from "./appActions";
import { AppErrorBoundary } from "./AppErrorBoundary";
import { CommandOverlay } from "../ui/CommandOverlay";
import { ErrorFallback } from "../ui/ErrorFallback";
import { GlobeLoadingScreen } from "../ui/GlobeLoadingScreen";

export function App() {
  return (
    <AppErrorBoundary>
      <MyEarthApp />
    </AppErrorBoundary>
  );
}

function MyEarthApp() {
  const config = useMemo(() => readAppConfig(import.meta.env), []);
  const telemetry = useMemo(() => createTelemetryClient(config), [config]);
  const preferences = useMemo(() => createPreferencesStore(), []);
  const reducedMotion = useReducedMotion();
  const [loadingPhase, setLoadingPhase] = useAtom(loadingPhaseAtom);
  const [cameraMode, setCameraMode] = useAtom(cameraModeAtom);
  const [selectedLocationId, setSelectedLocationId] = useAtom(selectedLocationIdAtom);
  const [visualMode, setVisualMode] = useAtom(visualModeAtom);
  const [qualityMode, setQualityMode] = useAtom(qualityModeAtom);
  const [effectiveQuality, setEffectiveQuality] = useAtom(effectiveQualityAtom);
  const [layers, setLayers] = useAtom(layerVisibilityAtom);
  const [layerAvailability] = useAtom(layerAvailabilityAtom);
  const [tourState, setTourState] = useAtom(tourStateAtom);
  const [soundState, setSoundState] = useAtom(soundStateAtom);
  const [accessibility, setAccessibility] = useAtom(accessibilityAtom);
  const setLayerVisibility = useSetAtom(setLayerVisibilityActionAtom);
  const setLayerAvailability = useSetAtom(setLayerAvailabilityActionAtom);
  const selectLocation = useSetAtom(selectLocationActionAtom);
  const [fatalError, setFatalError] = useState<AppError>();
  const [cameraCommand, setCameraCommand] = useState<CameraCommand>();
  const didLoadPreferencesRef = useRef(false);
  const tourControllerRef = useRef<TourController>();
  const soundscapeRef = useRef<Soundscape>();

  const searchService = useMemo(
    () =>
      createSearchService(
        createCesiumGeocoderAdapter(config.cesiumIonToken),
        Boolean(config.cesiumIonToken)
      ),
    [config.cesiumIonToken]
  );

  useEffect(() => {
    if (didLoadPreferencesRef.current) {
      return;
    }
    didLoadPreferencesRef.current = true;
    setLoadingPhase("config");
    const stored = preferences.load();
    if (stored.visualMode) {
      setVisualMode(stored.visualMode);
    }
    if (stored.qualityMode) {
      setQualityMode(stored.qualityMode);
    }
    if (stored.soundPreference === "disabled") {
      setSoundState({ status: "disabled" });
    }
    setAccessibility({
      reducedMotion,
      reducedUi: stored.reducedUi ?? false
    });
    setLoadingPhase("viewer");
  }, [
    preferences,
    reducedMotion,
    setAccessibility,
    setLoadingPhase,
    setQualityMode,
    setSoundState,
    setVisualMode
  ]);

  useEffect(() => {
    setAccessibility((current) => ({ ...current, reducedMotion }));
  }, [reducedMotion, setAccessibility]);

  useEffect(() => {
    setEffectiveQuality(computeQualityProfile(qualityMode, undefined, reducedMotion));
  }, [qualityMode, reducedMotion, setEffectiveQuality]);

  useEffect(() => {
    const existing = preferences.load();
    const soundPreference =
      soundState.status === "enabled"
        ? "enabled"
        : soundState.status === "disabled"
          ? "disabled"
          : existing.soundPreference;

    preferences.save({
      ...existing,
      visualMode,
      qualityMode,
      soundPreference,
      reducedUi: accessibility.reducedUi
    });
  }, [accessibility.reducedUi, preferences, qualityMode, soundState.status, visualMode]);

  useEffect(() => {
    soundscapeRef.current = createSoundscape(setSoundState);
    return () => soundscapeRef.current?.dispose();
  }, [setSoundState]);

  useEffect(() => {
    tourControllerRef.current = createTourController({
      onStateChange: setTourState,
      onSelectLocation: setSelectedLocationId,
      onCameraCommand: async (command) => setCameraCommand({ ...command }),
      onError: () =>
        setLayerAvailability({
          layerId: "terrain",
          availability: {
            status: "failed",
            reason: "Tour camera transition failed.",
            recoverable: true
          }
        })
    });
  }, [setLayerAvailability, setSelectedLocationId, setTourState]);

  useEffect(() => {
    if (loadingPhase !== "ready" || soundState.status !== "notPrompted") {
      return;
    }

    const prompt = () => {
      soundscapeRef.current?.prompt();
      window.removeEventListener("pointerdown", prompt);
      window.removeEventListener("keydown", prompt);
    };
    window.addEventListener("pointerdown", prompt, { once: true });
    window.addEventListener("keydown", prompt, { once: true });
    return () => {
      window.removeEventListener("pointerdown", prompt);
      window.removeEventListener("keydown", prompt);
    };
  }, [loadingPhase, soundState.status]);

  const validLocationIds = useMemo(
    () => new Set(earthLocations.map((location) => location.id)),
    []
  );

  const handleSelectLocation = (location: EarthLocation) => {
    selectLocation({ locationId: location.id, validLocationIds });
    setCameraCommand({
      type: "flyToLocation",
      locationId: location.id,
      source: location.kind
    });
    if (location.kind === "city") {
      handleLayerToggle("buildings", true);
    }
  };

  const handleSearchSelect = (result: SearchResult) => {
    setCameraCommand({
      type: "flyToCoordinates",
      latitude: result.latitude,
      longitude: result.longitude,
      heightMeters: result.heightMeters
    });
  };

  const handleLayerToggle = (id: LayerId, visible: boolean) => {
    setLayerVisibility({ layerId: id, visible });
    setLayers((current) => ({ ...current, [id]: visible }));
  };

  const handleError = (error: AppError) => {
    if (error.severity === "fatal") {
      setFatalError(error);
      telemetry.track({
        type: "cesium_init_failure",
        category: error.code
      });
    }
  };

  const ready = loadingPhase === "ready";

  if (fatalError) {
    return <ErrorFallback error={fatalError} />;
  }

  return (
    <>
      <CesiumScene
        config={config}
        visualMode={visualMode}
        layers={layers}
        qualityMode={qualityMode}
        selectedLocationId={selectedLocationId}
        cameraCommand={cameraCommand}
        onViewerReady={() => setLoadingPhase("firstFrame")}
        onFirstFrame={() => setLoadingPhase("ready")}
        onCameraModeChange={setCameraMode}
        onLayerAvailabilityChange={(layerId, availability) =>
          setLayerAvailability({ layerId, availability })
        }
        onError={handleError}
      />
      <GlobeLoadingScreen phase={loadingPhase} visible={!ready} />
      <CommandOverlay
        ready={ready}
        visualMode={visualMode}
        onVisualModeChange={setVisualMode}
        layers={layers}
        layerAvailability={layerAvailability}
        onLayerToggle={handleLayerToggle}
        selectedLocationId={selectedLocationId}
        onSelectLocation={handleSelectLocation}
        searchService={searchService}
        onSearchSelect={handleSearchSelect}
        tourState={tourState}
        onTourStart={() => tourControllerRef.current?.start()}
        onTourPause={() => tourControllerRef.current?.pause()}
        onTourNext={() => tourControllerRef.current?.next()}
        onTourPrevious={() => tourControllerRef.current?.previous()}
        soundState={soundState}
        onSoundEnable={() => {
          void soundscapeRef.current?.enable();
          handleLayerToggle("sound", true);
        }}
        onSoundDisable={() => {
          void soundscapeRef.current?.disable();
          handleLayerToggle("sound", false);
        }}
        onSoundVolume={(volume) => soundscapeRef.current?.setVolume(volume)}
        onSoundToggle={() => {
          if (soundState.status === "enabled") {
            void soundscapeRef.current?.disable();
            handleLayerToggle("sound", false);
          } else {
            void soundscapeRef.current?.enable();
            handleLayerToggle("sound", true);
          }
        }}
        qualityProfile={effectiveQuality}
        onReset={() => setCameraCommand({ type: "resetView" })}
      />
      <span hidden data-testid="camera-mode">
        {cameraMode}
      </span>
    </>
  );
}
