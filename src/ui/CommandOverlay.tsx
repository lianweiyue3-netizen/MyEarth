import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
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

type ActivePanel = "places" | "search" | "news" | "layers" | "distance";

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
  const [activePanel, setActivePanel] = useState<ActivePanel | undefined>();
  const [leftRailCollapsed, setLeftRailCollapsed] = useState(false);
  const handledNewsPanelRequestRef = useRef(newsPanelRequest);

  useEffect(() => {
    if (
      newsPanelRequest === 0 ||
      newsPanelRequest === handledNewsPanelRequestRef.current
    ) {
      return;
    }

    handledNewsPanelRequestRef.current = newsPanelRequest;
    setActivePanel("news");
    window.setTimeout(() => moveFocusToPanel("news-panel"), 0);
  }, [newsPanelRequest]);

  const locationsOpen = activePanel === "places";
  const searchOpen = activePanel === "search";
  const newsOpen = activePanel === "news";
  const layersOpen = activePanel === "layers";
  const distanceOpen = activePanel === "distance";
  const leftButtonDisabled = disabled || leftRailCollapsed;

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
      <div
        className={`${styles.leftRail} ${leftRailCollapsed ? styles.leftRailCollapsed : ""}`}
        data-testid="left-taskbar-rail"
      >
        <aside
          className={styles.left}
          id="left-taskbar"
          aria-hidden={leftRailCollapsed}
        >
          <button
            type="button"
            className={`${styles.placesButton} ${locationsOpen ? styles.open : ""}`}
            aria-expanded={locationsOpen}
            aria-controls="location-shortcuts-panel"
            disabled={leftButtonDisabled}
            onClick={() => togglePanel("places", setActivePanel)}
          >
            <span className={styles.placesTitle}>
              {locationsOpen ? "Hide Places" : "Places"}
            </span>
          </button>
          <button
            type="button"
            className={`${styles.placesButton} ${searchOpen ? styles.open : ""}`}
            aria-expanded={searchOpen}
            aria-controls="search-panel"
            disabled={leftButtonDisabled}
            onClick={() => togglePanel("search", setActivePanel)}
          >
            <span className={styles.placesTitle}>
              {searchOpen ? "Hide Search" : "Search"}
            </span>
          </button>
          <button
            type="button"
            className={`${styles.placesButton} ${newsOpen ? styles.open : ""}`}
            aria-expanded={newsOpen}
            aria-controls="news-panel"
            disabled={leftButtonDisabled}
            onClick={() => {
              setActivePanel((panel) => {
                if (panel === "news") {
                  return undefined;
                }

                onNewsPanelOpen?.();
                window.setTimeout(() => moveFocusToPanel("news-panel"), 0);
                return "news";
              });
            }}
          >
            <span className={styles.placesTitle}>
              {newsOpen ? "Hide News" : "News"}
            </span>
          </button>
          <button
            type="button"
            className={`${styles.placesButton} ${layersOpen ? styles.open : ""}`}
            aria-expanded={layersOpen}
            aria-controls="layer-controls-panel"
            disabled={leftButtonDisabled}
            onClick={() => togglePanel("layers", setActivePanel)}
          >
            <span className={styles.placesTitle}>
              {layersOpen ? "Hide Layers" : "Layers"}
            </span>
          </button>
          <button
            type="button"
            className={`${styles.placesButton} ${distanceOpen ? styles.open : ""}`}
            aria-expanded={distanceOpen}
            aria-controls="distance-tool-panel"
            disabled={leftButtonDisabled}
            onClick={() => togglePanel("distance", setActivePanel)}
          >
            <span className={styles.placesTitle}>
              {distanceOpen ? "Hide Distance" : "Distance"}
            </span>
          </button>
        </aside>
        <button
          type="button"
          className={styles.leftRailToggle}
          aria-label={leftRailCollapsed ? "Show task bar" : "Hide task bar"}
          aria-expanded={!leftRailCollapsed}
          aria-controls="left-taskbar"
          disabled={disabled}
          onClick={() => setLeftRailCollapsed((current) => !current)}
        >
          {leftRailCollapsed ? ">" : "<"}
        </button>
      </div>
      {activePanel ? (
        <aside
          className={styles.rightRail}
          aria-label={getRightRailLabel(activePanel)}
          data-testid={activePanel === "news" ? "news-right-rail" : "right-panel-rail"}
        >
          {activePanel === "places" ? (
            <div className={`${styles.panel} ${styles.toolPanelShell}`} id="location-shortcuts-panel">
              <LocationList
                selectedLocationId={selectedLocationId}
                onSelectLocation={onSelectLocation}
                disabled={disabled}
              />
            </div>
          ) : null}
          {activePanel === "search" ? (
            <div className={`${styles.panel} ${styles.toolPanelShell}`} id="search-panel">
              <SearchControl
                service={searchService}
                onSelectResult={onSearchSelect}
                disabled={disabled}
              />
            </div>
          ) : null}
          {activePanel === "news" ? (
            <div className={`${styles.panel} ${styles.newsPanelShell}`} id="news-panel-shell">
              <NewsPanel
                state={newsState}
                disabled={disabled}
                onSelectCountry={onSelectNewsCountry}
                onClearCountry={onClearNewsCountry}
              />
            </div>
          ) : null}
          {activePanel === "layers" ? (
            <div className={`${styles.panel} ${styles.toolPanelShell}`} id="layer-controls-panel">
              <LayerTogglePanel
                layers={layers}
                availability={layerAvailability}
                onToggle={onLayerToggle}
                onSoundToggle={onSoundToggle}
                disabled={disabled}
              />
            </div>
          ) : null}
          {activePanel === "distance" ? (
            <div className={`${styles.panel} ${styles.toolPanelShell}`} id="distance-tool-panel">
              <DistanceMeasurePanel
                measurement={distanceMeasurement}
                disabled={disabled}
                onStart={onMeasureStart}
                onClear={onMeasureClear}
              />
            </div>
          ) : null}
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
        newsActive={newsOpen && newsState.status === "ready"}
        locationLookupActive={focusedLocation.status === "ready"}
      />
    </div>
  );
}

function togglePanel(
  panel: ActivePanel,
  setActivePanel: Dispatch<SetStateAction<ActivePanel | undefined>>
): void {
  setActivePanel((current) => (current === panel ? undefined : panel));
}

function getRightRailLabel(panel: ActivePanel): string {
  switch (panel) {
    case "places":
      return "Places panel";
    case "search":
      return "Search panel";
    case "news":
      return "World news panel";
    case "layers":
      return "Layer controls panel";
    case "distance":
      return "Distance tool panel";
  }
}
