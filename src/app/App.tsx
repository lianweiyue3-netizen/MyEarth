import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "../accessibility/reducedMotion";
import { CesiumScene } from "../cesium/CesiumScene";
import { readAppConfig } from "../config/env";
import { earthLocations } from "../content/locations";
import { createCesiumGeocoderAdapter } from "../search/cesiumGeocoderAdapter";
import { createReverseGeocoder } from "../search/reverseGeocoder";
import { createSearchService } from "../search/searchService";
import { getVisualMode } from "../layers/visualModes";
import {
  addDistancePoint,
  emptyDistanceMeasurement
} from "../measurement/distanceMeasurement";
import { getNewsCountry } from "../news/newsCountries";
import { createNewsClient } from "../news/newsClient";
import { getPublicNewsUnavailableMessage } from "../news/newsTypes";
import { createSoundscape } from "../sound/soundscape";
import { createPreferencesStore } from "../persistence/preferences";
import { createTelemetryClient } from "../telemetry/telemetry";
import type {
  AppError,
  CameraCommand,
  DistanceMeasurement,
  EarthLocation,
  FocusedLocation,
  GlobeFocusPoint,
  LayerAvailability,
  LayerId,
  MapMeasurePoint,
  SearchResult,
  Soundscape
} from "../shared/domain";
import {
  accessibilityAtom,
  cameraModeAtom,
  layerAvailabilityAtom,
  layerVisibilityAtom,
  loadingPhaseAtom,
  newsStateAtom,
  qualityModeAtom,
  selectedLocationIdAtom,
  soundStateAtom,
  visualModeAtom
} from "./appAtoms";
import {
  clearSelectedNewsCountryActionAtom,
  selectLocationActionAtom,
  setLayerAvailabilityActionAtom,
  setLayerVisibilityActionAtom,
  selectNewsCountryActionAtom
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
  const [selectedLocationId] = useAtom(selectedLocationIdAtom);
  const [visualMode, setVisualMode] = useAtom(visualModeAtom);
  const [qualityMode, setQualityMode] = useAtom(qualityModeAtom);
  const [layers, setLayers] = useAtom(layerVisibilityAtom);
  const [layerAvailability] = useAtom(layerAvailabilityAtom);
  const [newsState, setNewsState] = useAtom(newsStateAtom);
  const [soundState, setSoundState] = useAtom(soundStateAtom);
  const [accessibility, setAccessibility] = useAtom(accessibilityAtom);
  const setLayerVisibility = useSetAtom(setLayerVisibilityActionAtom);
  const setLayerAvailability = useSetAtom(setLayerAvailabilityActionAtom);
  const selectLocation = useSetAtom(selectLocationActionAtom);
  const selectNewsCountry = useSetAtom(selectNewsCountryActionAtom);
  const clearSelectedNewsCountry = useSetAtom(clearSelectedNewsCountryActionAtom);
  const [fatalError, setFatalError] = useState<AppError>();
  const [cameraCommand, setCameraCommand] = useState<CameraCommand>();
  const [newsPanelRequest, setNewsPanelRequest] = useState(0);
  const [focusPoint, setFocusPoint] = useState<GlobeFocusPoint>();
  const [distanceMeasurement, setDistanceMeasurement] =
    useState<DistanceMeasurement>(emptyDistanceMeasurement);
  const [focusedLocation, setFocusedLocation] = useState<FocusedLocation>({
    status: "idle"
  });
  const didLoadPreferencesRef = useRef(false);
  const newsLoadControllerRef = useRef<AbortController>();
  const soundscapeRef = useRef<Soundscape>();

  if (!soundscapeRef.current) {
    soundscapeRef.current = createSoundscape(setSoundState);
  }

  const searchService = useMemo(
    () =>
      createSearchService(
        createCesiumGeocoderAdapter(config.cesiumIonToken),
        Boolean(config.cesiumIonToken)
      ),
    [config.cesiumIonToken]
  );
  const reverseGeocoder = useMemo(() => createReverseGeocoder(), []);
  const newsClient = useMemo(() => createNewsClient(), []);

  const disableNewsLayer = useCallback(
    (reason: string) => {
      setLayerAvailability({
        layerId: "newsHeatmap",
        availability: { status: "disabled", reason }
      });
      setLayerVisibility({ layerId: "newsHeatmap", visible: false });
      setLayers((current) =>
        current.newsHeatmap ? { ...current, newsHeatmap: false } : current
      );
    },
    [setLayerAvailability, setLayerVisibility, setLayers]
  );

  const loadNewsSnapshot = useCallback(() => {
    if (newsState.status === "loading" || newsState.status === "ready") {
      return;
    }

    newsLoadControllerRef.current?.abort();
    const controller = new AbortController();
    newsLoadControllerRef.current = controller;
    setNewsState({ status: "loading" });

    void newsClient
      .loadSnapshot(controller.signal)
      .then((response) => {
        if (controller.signal.aborted) {
          return;
        }

        if (response.status === "ready") {
          setNewsState({
            status: "ready",
            snapshot: response.snapshot,
            stale: response.stale,
            ...(response.message ? { message: response.message } : {})
          });
          const hasHeadlines = Object.values(response.snapshot.countries).some(
            (country) => country.headlineCount > 0
          );
          setLayerAvailability({
            layerId: "newsHeatmap",
            availability: hasHeadlines
              ? { status: "available" }
              : {
                  status: "disabled",
                  reason: "No current headlines are available."
                }
          });
          if (!hasHeadlines) {
            setLayerVisibility({ layerId: "newsHeatmap", visible: false });
            setLayers((current) =>
              current.newsHeatmap ? { ...current, newsHeatmap: false } : current
            );
          }
          return;
        }

        const message = getPublicNewsUnavailableMessage(
          response.reason,
          response.message
        );
        setNewsState({
          status: "unavailable",
          reason: response.reason,
          message
        });
        disableNewsLayer(message);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          const message = getPublicNewsUnavailableMessage("provider-failed");
          setNewsState({
            status: "unavailable",
            reason: "provider-failed",
            message
          });
          disableNewsLayer(message);
        }
      });
  }, [
    disableNewsLayer,
    newsClient,
    newsState.status,
    setLayerAvailability,
    setLayerVisibility,
    setLayers,
    setNewsState
  ]);

  useEffect(() => {
    if (loadingPhase === "ready" && newsState.status === "idle") {
      loadNewsSnapshot();
    }
  }, [loadingPhase, loadNewsSnapshot, newsState.status]);

  useEffect(() => () => newsLoadControllerRef.current?.abort(), []);

  useEffect(() => {
    if (!focusPoint) {
      setFocusedLocation({ status: "idle" });
      return;
    }

    const controller = new AbortController();
    setFocusedLocation({ status: "loading", point: focusPoint });
    void reverseGeocoder
      .reverse(focusPoint, controller.signal)
      .then((location) => {
        if (controller.signal.aborted) {
          return;
        }

        setFocusedLocation(
          location ?? {
            status: "failed",
            point: focusPoint,
            reason: "Address unavailable for this point."
          }
        );
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setFocusedLocation({
            status: "failed",
            point: focusPoint,
            reason: "Address lookup unavailable."
          });
        }
      });

    return () => controller.abort();
  }, [focusPoint, reverseGeocoder]);

  useEffect(() => {
    if (didLoadPreferencesRef.current) {
      return;
    }
    didLoadPreferencesRef.current = true;
    setLoadingPhase("config");
    const stored = preferences.load();
    if (stored.visualMode) {
      setVisualMode(stored.visualMode);
      const defaultLayers = getVisualMode(stored.visualMode).defaultLayers;
      setLayers((current) => ({ ...current, ...defaultLayers }));
      for (const [layerId, visible] of Object.entries(defaultLayers) as Array<
        [LayerId, boolean]
      >) {
        setLayerVisibility({ layerId, visible });
      }
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
    setLayerVisibility,
    setLayers,
    setLoadingPhase,
    setQualityMode,
    setSoundState,
    setVisualMode
  ]);

  useEffect(() => {
    setAccessibility((current) => ({ ...current, reducedMotion }));
  }, [reducedMotion, setAccessibility]);

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

  useEffect(
    () => () => {
      soundscapeRef.current?.dispose();
      soundscapeRef.current = undefined;
    },
    []
  );

  useEffect(() => {
    if (loadingPhase !== "ready" || soundState.status !== "notPrompted") {
      return;
    }

    const prompt = (event: PointerEvent | KeyboardEvent) => {
      if (
        event.type === "pointerdown" &&
        event.target instanceof Element &&
        event.target.closest("[data-sound-control]")
      ) {
        return;
      }

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
    setFocusPoint({
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
      cameraHeightMeters: location.coordinates.heightMeters ?? 0
    });
  };

  const handleSearchSelect = (result: SearchResult) => {
    setCameraCommand({
      type: "flyToCoordinates",
      latitude: result.latitude,
      longitude: result.longitude,
      heightMeters: result.heightMeters
    });
    setFocusPoint({
      latitude: result.latitude,
      longitude: result.longitude,
      cameraHeightMeters: result.heightMeters ?? 0
    });
  };

  const handleLayerToggle = (id: LayerId, visible: boolean) => {
    setLayerVisibility({ layerId: id, visible });
    setLayers((current) => ({ ...current, [id]: visible }));
  };

  const handleNewsCountrySelect = (countryCode: string) => {
    const selectedCountry = selectNewsCountry({ countryCode });
    const country = getNewsCountry(countryCode);
    if (!selectedCountry || !country) {
      return;
    }

    setCameraCommand({
      type: "flyToCoordinates",
      latitude: country.centroid.latitude,
      longitude: country.centroid.longitude,
      heightMeters: country.cameraHeightMeters
    });
    setFocusPoint({
      latitude: country.centroid.latitude,
      longitude: country.centroid.longitude,
      cameraHeightMeters: country.cameraHeightMeters
    });
    setNewsPanelRequest((current) => current + 1);
  };

  const handleMeasureStart = () => {
    setDistanceMeasurement((current) => ({
      active: true,
      points: current.points.length === 2 ? [] : current.points,
      distanceMeters: current.points.length === 2 ? undefined : current.distanceMeters
    }));
  };

  const handleMeasurePoint = (point: MapMeasurePoint) => {
    setDistanceMeasurement((current) =>
      current.active ? addDistancePoint(current, point) : current
    );
  };

  const handleMeasureClear = () => {
    setDistanceMeasurement(emptyDistanceMeasurement);
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

  const handleLayerAvailabilityChange = (
    layerId: LayerId,
    availability: LayerAvailability
  ) => {
    if (
      layerId === "newsHeatmap" &&
      availability.status === "disabled" &&
      availability.reason === "Layer adapter is not registered."
    ) {
      return;
    }

    setLayerAvailability({ layerId, availability });
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
        onLayerAvailabilityChange={handleLayerAvailabilityChange}
        onFocusPointChange={setFocusPoint}
        distanceMeasurement={distanceMeasurement}
        onMeasurePoint={handleMeasurePoint}
        newsSnapshot={newsState.status === "ready" ? newsState.snapshot : undefined}
        selectedNewsCountryCode={
          newsState.status === "ready" ? newsState.selectedCountryCode : undefined
        }
        onNewsCountrySelect={handleNewsCountrySelect}
        onError={handleError}
      />
      <GlobeLoadingScreen phase={loadingPhase} visible={!ready} />
      <CommandOverlay
        ready={ready}
        visualMode={visualMode}
        layers={layers}
        layerAvailability={layerAvailability}
        onLayerToggle={handleLayerToggle}
        selectedLocationId={selectedLocationId}
        onSelectLocation={handleSelectLocation}
        searchService={searchService}
        onSearchSelect={handleSearchSelect}
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
        distanceMeasurement={distanceMeasurement}
        onMeasureStart={handleMeasureStart}
        onMeasureClear={handleMeasureClear}
        newsState={newsState}
        newsLayerEnabled={layers.newsHeatmap}
        newsPanelRequest={newsPanelRequest}
        onNewsPanelOpen={loadNewsSnapshot}
        onNewsLayerToggle={(visible) => handleLayerToggle("newsHeatmap", visible)}
        onSelectNewsCountry={handleNewsCountrySelect}
        onClearNewsCountry={clearSelectedNewsCountry}
        focusedLocation={focusedLocation}
        onReset={() => {
          setCameraCommand({ type: "resetView" });
          setFocusPoint(undefined);
        }}
      />
      <span hidden data-testid="camera-mode">
        {cameraMode}
      </span>
    </>
  );
}
