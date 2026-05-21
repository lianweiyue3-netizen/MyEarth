import type { LayerId, VisualModeId } from "../shared/domain";
import styles from "./AttributionBar.module.css";

export function AttributionBar({
  layers,
  visualMode,
  newsActive = false,
  locationLookupActive = false
}: {
  layers: Record<LayerId, boolean>;
  visualMode: VisualModeId;
  newsActive?: boolean;
  locationLookupActive?: boolean;
}) {
  return (
    <footer className={styles.bar} aria-label="Map attribution">
      <span>CesiumJS and Cesium ion credits remain visible.</span>
      {layers.weatherRadar ? (
        <a href="https://www.rainviewer.com/" target="_blank" rel="noreferrer">
          RainViewer
        </a>
      ) : null}
      {visualMode === "nightLights" ? <span>NASA Black Marble</span> : null}
      {newsActive ? <span>GNews</span> : null}
      {locationLookupActive ? (
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          OpenStreetMap
        </a>
      ) : null}
    </footer>
  );
}
