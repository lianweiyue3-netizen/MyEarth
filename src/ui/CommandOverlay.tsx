import { useEffect, useRef, useState } from "react";
import { moveFocusToPanel } from "../accessibility/focusManagement";
import type {
  DistanceMeasurement,
  EarthLocation,
  FocusedLocation,
  LayerAvailability,
  LayerId,
  SearchResult,
  SoundState,
  VisualModeId
} from "../shared/domain";
import type { NewsState } from "../news/newsTypes";
import type { SearchService } from "../search/searchService";
import { AttributionBar } from "./AttributionBar";
import { DistanceMeasurePanel } from "./DistanceMeasurePanel";
import { FocusLocationReadout } from "./FocusLocationReadout";
import { LayerTogglePanel } from "./LayerTogglePanel";
import { LocationList } from "./LocationList";
import { NewsPanel } from "./NewsPanel";
import { RadarStatusPanel } from "./RadarStatusPanel";
import { SearchControl } from "./SearchControl";
import { SoundConsentControl } from "./SoundConsentControl";
import styles from "./CommandOverlay.module.css";

export function CommandOverlay({
  ready,
  visualMode,
  layers,
  layerAvailability,
  onLayerToggle,
  selectedLocationId,
  onSelectLocation,
  searchService,
  onSearchSelect,
  soundState,
  onSoundEnable,
  onSoundDisable,
  onSoundVolume,
  onSoundToggle,
  distanceMeasurement,
  onMeasureStart,
  onMeasureClear,
  newsState = { status: "idle" },
  newsPanelRequest = 0,
  onNewsPanelOpen,
  onSelectNewsCountry = () => undefined,
  onClearNewsCountry = () => undefined,
  focusedLocation = { status: "idle" },
  onReset
}: {
  ready: boolean;
  visualMode: VisualModeId;
  layers: Record<LayerId, boolean>;
  layerAvailability: Record<LayerId, LayerAvailability>;
  onLayerToggle: (id: LayerId, visible: boolean) => void;
  selectedLocationId?: string;
  onSelectLocation: (location: EarthLocation) => void;
  searchService: SearchService;
  onSearchSelect: (result: SearchResult) => void;
  soundState: SoundState;
  onSoundEnable: () => void;
  onSoundDisable: () => void;
  onSoundVolume: (volume: number) => void;
  onSoundToggle: () => void;
  distanceMeasurement: DistanceMeasurement;
  onMeasureStart: () => void;
  onMeasureClear: () => void;
  newsState?: NewsState;
  newsPanelRequest?: number;
  onNewsPanelOpen?: () => void;
  onSelectNewsCountry?: (countryCode: string) => void;
  onClearNewsCountry?: () => void;
  focusedLocation?: FocusedLocation;
  onReset: () => void;
}) {
  const disabled = !ready;
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [distanceOpen, setDistanceOpen] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);
  const [newsPanelExpanded, setNewsPanelExpanded] = useState(false);
  const handledNewsPanelRequestRef = useRef(newsPanelRequest);

  useEffect(() => {
    if (
      newsPanelRequest === 0 ||
      newsPanelRequest === handledNewsPanelRequestRef.current
    ) {
      return;
    }

    handledNewsPanelRequestRef.current = newsPanelRequest;
    setNewsOpen(true);
    setNewsPanelExpanded(true);
    window.setTimeout(() => moveFocusToPanel("news-panel"), 0);
  }, [newsPanelRequest]);

  const newsUnavailable = newsState.status === "unavailable";
  const newsMeta = newsUnavailable
    ? "Open details"
    : newsOpen
      ? "Close headlines"
      : "World headlines";

  return (
    <div
      className={`${styles.overlay} ${ready ? styles.ready : ""}`}
      data-testid="command-overlay"
    >
      <div className={styles.top}>
        <header className={styles.brand}>
          <h1>MyEarth</h1>
        </header>
      </div>
      <div className={styles.main}>
        <aside className={styles.left}>
          <button
            type="button"
            className={`${styles.placesButton} ${locationsOpen ? styles.open : ""}`}
            aria-expanded={locationsOpen}
            aria-controls="location-shortcuts-panel"
            disabled={disabled}
            onClick={() => setLocationsOpen((open) => !open)}
          >
            <span className={styles.placesTitle}>
              {locationsOpen ? "Hide Places" : "Places"}
            </span>
            <span className={styles.placesMeta}>
              {locationsOpen ? "Close shortcuts" : "Wonders and cities"}
            </span>
          </button>
          {locationsOpen ? (
            <div className={styles.panel} id="location-shortcuts-panel">
              <LocationList
                selectedLocationId={selectedLocationId}
                onSelectLocation={onSelectLocation}
                disabled={disabled}
              />
            </div>
          ) : null}
          <button
            type="button"
            className={`${styles.placesButton} ${searchOpen ? styles.open : ""}`}
            aria-expanded={searchOpen}
            aria-controls="search-panel"
            disabled={disabled}
            onClick={() => setSearchOpen((open) => !open)}
          >
            <span className={styles.placesTitle}>
              {searchOpen ? "Hide Search" : "Search"}
            </span>
            <span className={styles.placesMeta}>
              {searchOpen ? "Close finder" : "Find a place"}
            </span>
          </button>
          {searchOpen ? (
            <div className={styles.panel} id="search-panel">
              <SearchControl
                service={searchService}
                onSelectResult={onSearchSelect}
                disabled={disabled}
              />
            </div>
          ) : null}
          <button
            type="button"
            className={`${styles.placesButton} ${newsOpen ? styles.open : ""}`}
            aria-expanded={newsOpen}
            aria-controls="news-panel"
            disabled={disabled}
            onClick={() => {
              setNewsOpen((open) => {
                const nextOpen = !open;
                if (nextOpen) {
                  onNewsPanelOpen?.();
                  setNewsPanelExpanded(false);
                } else {
                  setNewsPanelExpanded(false);
                }
                return nextOpen;
              });
            }}
          >
            <span className={styles.placesTitle}>
              {newsOpen
                ? "Hide News"
                : newsUnavailable
                  ? "News unavailable"
                  : "News"}
            </span>
            <span className={styles.placesMeta}>{newsMeta}</span>
          </button>
          <button
            type="button"
            className={`${styles.placesButton} ${layersOpen ? styles.open : ""}`}
            aria-expanded={layersOpen}
            aria-controls="layer-controls-panel"
            disabled={disabled}
            onClick={() => setLayersOpen((open) => !open)}
          >
            <span className={styles.placesTitle}>
              {layersOpen ? "Hide Layers" : "Layers"}
            </span>
            <span className={styles.placesMeta}>
              {layersOpen ? "Close controls" : "Map controls"}
            </span>
          </button>
          {layersOpen ? (
            <div className={styles.panel} id="layer-controls-panel">
              <LayerTogglePanel
                layers={layers}
                availability={layerAvailability}
                onToggle={onLayerToggle}
                onSoundToggle={onSoundToggle}
                disabled={disabled}
              />
            </div>
          ) : null}
          <button
            type="button"
            className={`${styles.placesButton} ${distanceOpen ? styles.open : ""}`}
            aria-expanded={distanceOpen}
            aria-controls="distance-tool-panel"
            disabled={disabled}
            onClick={() => setDistanceOpen((open) => !open)}
          >
            <span className={styles.placesTitle}>
              {distanceOpen ? "Hide Distance" : "Distance"}
            </span>
            <span className={styles.placesMeta}>
              {distanceOpen ? "Close tool" : "Map distance"}
            </span>
          </button>
          {distanceOpen ? (
            <div className={styles.panel} id="distance-tool-panel">
              <DistanceMeasurePanel
                measurement={distanceMeasurement}
                disabled={disabled}
                onStart={onMeasureStart}
                onClear={onMeasureClear}
              />
            </div>
          ) : null}
        </aside>
        <div aria-hidden="true" />
      </div>
      {newsOpen ? (
        <aside
          className={styles.newsRail}
          aria-label="World news panel"
          data-testid="news-right-rail"
        >
          {newsPanelExpanded ? (
            <div className={`${styles.panel} ${styles.newsPanelShell}`} id="news-panel-shell">
              <NewsPanel
                state={newsState}
                disabled={disabled}
                onSelectCountry={onSelectNewsCountry}
                onClearCountry={onClearNewsCountry}
              />
            </div>
          ) : (
            <button
              type="button"
              id="news-panel-shell"
              className={`${styles.panel} ${styles.newsPanelShell} ${styles.newsCollapsed}`}
              aria-expanded="false"
              aria-controls="news-panel"
              data-testid="news-collapsed-panel"
              onClick={() => {
                setNewsPanelExpanded(true);
                window.setTimeout(() => moveFocusToPanel("news-panel"), 0);
              }}
            >
              <span className={styles.newsCollapsedTitle}>World News</span>
              <span className={styles.newsCollapsedMeta}>
                {getCollapsedNewsMeta(newsState)}
              </span>
            </button>
          )}
        </aside>
      ) : null}
      <div className={styles.bottom}>
        <button type="button" className={styles.reset} disabled={disabled} onClick={onReset}>
          Reset View
        </button>
        <SoundConsentControl
          state={soundState}
          onEnable={onSoundEnable}
          onDisable={onSoundDisable}
          onVolume={onSoundVolume}
        />
        <FocusLocationReadout location={focusedLocation} />
        {layers.weatherRadar ? (
          <RadarStatusPanel availability={layerAvailability.weatherRadar} />
        ) : null}
      </div>
      <AttributionBar
        layers={layers}
        visualMode={visualMode}
        newsActive={newsPanelExpanded && newsState.status === "ready"}
        locationLookupActive={focusedLocation.status === "ready"}
      />
    </div>
  );
}

function getCollapsedNewsMeta(state: NewsState) {
  if (state.status === "unavailable") {
    return state.message;
  }

  if (state.status === "ready") {
    const selectedCountry = state.selectedCountryCode
      ? state.snapshot.countries[state.selectedCountryCode]
      : undefined;

    if (selectedCountry) {
      return selectedCountry.countryName;
    }

    return `Last updated ${formatNewsRailDateTime(state.snapshot.lastUpdated)}`;
  }

  return "Loading headlines";
}

function formatNewsRailDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(parsed);
}
