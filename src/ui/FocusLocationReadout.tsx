import type { FocusedLocation } from "../shared/domain";
import styles from "./FocusLocationReadout.module.css";

export function FocusLocationReadout({
  location
}: {
  location: FocusedLocation;
}) {
  if (location.status === "idle" || location.status === "failed") {
    return null;
  }

  if (location.status === "loading") {
    return (
      <section className={styles.readout} aria-label="Focused map location">
        <span className={styles.kicker}>Focused Location</span>
        <strong className={styles.primary}>Reading address...</strong>
      </section>
    );
  }

  const primary =
    location.streetName ??
    location.localityName ??
    location.stateName ??
    location.countryName ??
    location.displayName;
  const secondary = [location.stateName, location.countryName]
    .filter(Boolean)
    .join(", ");

  return (
    <section
      className={styles.readout}
      aria-label="Focused map location"
      aria-live="polite"
    >
      <span className={styles.kicker}>Focused Location</span>
      <strong className={styles.primary}>{primary}</strong>
      {secondary ? <span className={styles.secondary}>{secondary}</span> : null}
    </section>
  );
}
