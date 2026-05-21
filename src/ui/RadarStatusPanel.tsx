import type { LayerAvailability } from "../shared/domain";
import styles from "./RadarStatusPanel.module.css";

const intensityBands = [
  { label: "Light", className: styles.light },
  { label: "Medium", className: styles.medium },
  { label: "Heavy", className: styles.heavy }
];

export function RadarStatusPanel({
  availability = { status: "available" }
}: {
  availability?: LayerAvailability;
}) {
  const unavailable = availability.status !== "available";
  const detail =
    availability.status === "available"
      ? "Recent RainViewer precipitation"
      : availability.reason;

  return (
    <aside
      className={styles.panel}
      aria-label="Radar status"
      data-testid="radar-status"
    >
      <span className={styles.kicker}>
        {unavailable ? "Radar unavailable" : "Radar active"}
      </span>
      <span className={styles.primary}>{detail}</span>
      {unavailable ? null : (
        <span className={styles.legend} aria-label="Radar intensity">
          {intensityBands.map((band) => (
            <span className={styles.item} key={band.label}>
              <span
                className={`${styles.swatch} ${band.className}`}
                aria-hidden="true"
              />
              {band.label}
            </span>
          ))}
        </span>
      )}
    </aside>
  );
}
