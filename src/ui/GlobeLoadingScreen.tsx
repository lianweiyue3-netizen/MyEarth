import type { LoadingPhase } from "../shared/domain";
import styles from "./GlobeLoadingScreen.module.css";

const phaseText: Record<LoadingPhase, string> = {
  boot: "Preparing command systems.",
  config: "Reading local configuration.",
  cesiumAssets: "Loading Cesium assets.",
  viewer: "Starting the 3D Earth view.",
  firstFrame: "Composing the first Earth frame.",
  ready: "Earth view ready.",
  failed: "The Earth view could not start."
};

export function GlobeLoadingScreen({
  phase,
  visible
}: {
  phase: LoadingPhase;
  visible: boolean;
}) {
  return (
    <div
      className={`${styles.loading} ${visible ? "" : styles.hidden}`}
      aria-hidden={!visible}
      data-testid="loading-screen"
    >
      <div className={styles.panel}>
        <h1 className={styles.title}>MyEarth</h1>
        <p className={styles.status}>{phaseText[phase]}</p>
      </div>
    </div>
  );
}
