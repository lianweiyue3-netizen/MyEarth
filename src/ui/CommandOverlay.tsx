import { useState } from "react";
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
import type { SearchService } from "../search/searchService";
import { AttributionBar } from "./AttributionBar";
import { DistanceMeasurePanel } from "./DistanceMeasurePanel";
import { FocusLocationReadout } from "./FocusLocationReadout";
import { LayerTogglePanel } from "./LayerTogglePanel";
import { LocationList } from "./LocationList";
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
  focusedLocation?: FocusedLocation;
  onReset: () => void;
}) {
  const disabled = !ready;
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [distanceOpen, setDistanceOpen] = useState(false);

  return (
    <div
      className={`${styles.overlay} ${ready ? styles.ready : ""}`}
      data-testid="command-overlay"
    >
      <div className={styles.top}>
        <header className={styles.brand}>
          <h1>MyEarth</h1>
          <p>Natural wonders command center</p>
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
        locationLookupActive={focusedLocation.status === "ready"}
      />
    </div>
  );
}
