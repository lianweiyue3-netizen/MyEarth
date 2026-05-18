import type { TourState } from "../shared/domain";
import styles from "./TourControls.module.css";

export function TourControls({
  state,
  onStart,
  onPause,
  onNext,
  onPrevious,
  disabled = false
}: {
  state: TourState;
  onStart: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  disabled?: boolean;
}) {
  return (
    <section className={styles.tour} aria-label="Natural wonders tour">
      <div className={styles.buttons}>
        <button
          type="button"
          className={styles.primary}
          disabled={disabled}
          onClick={onStart}
        >
          Start
        </button>
        <button type="button" disabled={disabled} onClick={onPrevious}>
          Back
        </button>
        <button type="button" disabled={disabled} onClick={onNext}>
          Next
        </button>
        <button type="button" disabled={disabled} onClick={onPause}>
          Pause
        </button>
      </div>
      <p className={styles.status}>
        Tour {state.status}, stop {state.currentIndex + 1} of 8
      </p>
    </section>
  );
}
