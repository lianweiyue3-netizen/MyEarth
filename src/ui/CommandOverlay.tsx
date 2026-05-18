import type {
  EarthLocation,
  LayerAvailability,
  LayerId,
  QualityProfile,
  SearchResult,
  SoundState,
  TourState,
  VisualModeId
} from "../shared/domain";
import type { SearchService } from "../search/searchService";
import { AttributionBar } from "./AttributionBar";
import { LayerTogglePanel } from "./LayerTogglePanel";
import { LearningPanel } from "./LearningPanel";
import { LocationList } from "./LocationList";
import { QualityIndicator } from "./QualityIndicator";
import { SearchControl } from "./SearchControl";
import { SoundConsentControl } from "./SoundConsentControl";
import { TourControls } from "./TourControls";
import { VisualModeSelector } from "./VisualModeSelector";
import styles from "./CommandOverlay.module.css";

export function CommandOverlay({
  ready,
  visualMode,
  onVisualModeChange,
  layers,
  layerAvailability,
  onLayerToggle,
  selectedLocationId,
  onSelectLocation,
  searchService,
  onSearchSelect,
  tourState,
  onTourStart,
  onTourPause,
  onTourNext,
  onTourPrevious,
  soundState,
  onSoundEnable,
  onSoundDisable,
  onSoundVolume,
  onSoundToggle,
  qualityProfile,
  onReset
}: {
  ready: boolean;
  visualMode: VisualModeId;
  onVisualModeChange: (mode: VisualModeId) => void;
  layers: Record<LayerId, boolean>;
  layerAvailability: Record<LayerId, LayerAvailability>;
  onLayerToggle: (id: LayerId, visible: boolean) => void;
  selectedLocationId?: string;
  onSelectLocation: (location: EarthLocation) => void;
  searchService: SearchService;
  onSearchSelect: (result: SearchResult) => void;
  tourState: TourState;
  onTourStart: () => void;
  onTourPause: () => void;
  onTourNext: () => void;
  onTourPrevious: () => void;
  soundState: SoundState;
  onSoundEnable: () => void;
  onSoundDisable: () => void;
  onSoundVolume: (volume: number) => void;
  onSoundToggle: () => void;
  qualityProfile: QualityProfile;
  onReset: () => void;
}) {
  const disabled = !ready;

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
        <div className={styles.panel}>
          <SearchControl
            service={searchService}
            onSelectResult={onSearchSelect}
            disabled={disabled}
          />
        </div>
        <div className={styles.panel}>
          <VisualModeSelector
            value={visualMode}
            onChange={onVisualModeChange}
            disabled={disabled}
          />
        </div>
      </div>
      <div className={styles.main}>
        <aside className={styles.left}>
          <div className={styles.panel}>
            <TourControls
              state={tourState}
              onStart={onTourStart}
              onPause={onTourPause}
              onNext={onTourNext}
              onPrevious={onTourPrevious}
              disabled={disabled}
            />
          </div>
          <div className={styles.panel}>
            <LocationList
              selectedLocationId={selectedLocationId}
              onSelectLocation={onSelectLocation}
              disabled={disabled}
            />
          </div>
        </aside>
        <div aria-hidden="true" />
        <aside className={styles.right}>
          <div className={styles.panel}>
            <LearningPanel
              selectedLocationId={selectedLocationId}
              onLayerRequest={(id) => onLayerToggle(id, true)}
            />
          </div>
          <div className={styles.panel}>
            <LayerTogglePanel
              layers={layers}
              availability={layerAvailability}
              onToggle={onLayerToggle}
              onSoundToggle={onSoundToggle}
              disabled={disabled}
            />
          </div>
        </aside>
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
        <QualityIndicator profile={qualityProfile} />
      </div>
      <AttributionBar layers={layers} visualMode={visualMode} />
    </div>
  );
}
