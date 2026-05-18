import type { SoundState } from "../shared/domain";
import styles from "./SoundConsentControl.module.css";

export function SoundConsentControl({
  state,
  onEnable,
  onDisable,
  onVolume
}: {
  state: SoundState;
  onEnable: () => void;
  onDisable: () => void;
  onVolume: (volume: number) => void;
}) {
  const enabled = state.status === "enabled";
  return (
    <section className={styles.sound} aria-label="Sound controls">
      <button type="button" onClick={enabled ? onDisable : onEnable}>
        {enabled ? "Sound Off" : "Sound On"}
      </button>
      <input
        aria-label="Sound volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        disabled={!enabled}
        value={enabled ? state.volume : 0}
        onChange={(event) => onVolume(Number(event.target.value))}
      />
      <span className={styles.status}>
        {state.status === "unavailable" ? state.reason : `Sound ${state.status}`}
      </span>
    </section>
  );
}
