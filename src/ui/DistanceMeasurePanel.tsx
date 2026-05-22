import type { DistanceMeasurement } from "../shared/domain";
import { formatDistanceMeters } from "../measurement/distanceMeasurement";
import styles from "./DistanceMeasurePanel.module.css";

export function DistanceMeasurePanel({
  measurement,
  disabled = false,
  onStart,
  onClear
}: {
  measurement: DistanceMeasurement;
  disabled?: boolean;
  onStart: () => void;
  onClear: () => void;
}) {
  const status = getStatusLabel(measurement);
  const distance =
    measurement.distanceMeters === undefined
      ? undefined
      : formatDistanceMeters(measurement.distanceMeters);

  return (
    <section className={styles.panel} aria-label="Distance measurement">
      <div className={styles.header}>
        <div>
          <h2>Distance</h2>
          <p>Measure map distance</p>
        </div>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.button} ${measurement.active ? styles.active : ""}`}
          aria-pressed={measurement.active}
          disabled={disabled}
          onClick={onStart}
        >
          Measure
        </button>
        <button
          type="button"
          className={styles.button}
          disabled={disabled || (!measurement.active && measurement.points.length === 0)}
          onClick={onClear}
        >
          Clear
        </button>
      </div>
      <span className={styles.primary}>{distance ?? status}</span>
      {distance ? <span className={styles.secondary}>{status}</span> : null}
    </section>
  );
}

function getStatusLabel(measurement: DistanceMeasurement) {
  if (!measurement.active) {
    return "Ready";
  }

  if (measurement.points.length === 0) {
    return "Point A";
  }

  if (measurement.points.length === 1) {
    return "Point B";
  }

  return "2 points";
}
