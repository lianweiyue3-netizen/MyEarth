import type { LayerId, VisualModeId } from "../shared/domain";
import styles from "./AttributionBar.module.css";

export function AttributionBar({
  layers,
  visualMode
}: {
  layers: Record<LayerId, boolean>;
  visualMode: VisualModeId;
}) {
  return (
    <footer className={styles.bar} aria-label="Map attribution">
      <span>CesiumJS and Cesium ion credits remain visible.</span>
      {layers.buildings ? <span>OpenStreetMap contributors</span> : null}
      {layers.weatherRadar ? (
        <a href="https://www.rainviewer.com/" target="_blank" rel="noreferrer">
          RainViewer
        </a>
      ) : null}
      {visualMode === "nightLights" ? <span>NASA Black Marble</span> : null}
    </footer>
  );
}
