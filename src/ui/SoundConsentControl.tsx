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
  const unavailable = state.status === "unavailable";
  const handleToggle = () => {
    if (enabled) {
      onDisable();
    } else {
      onEnable();
    }
  };
  const handleVolumeChange = (volume: number) => {
    if (!enabled) {
      onEnable();
    }
    onVolume(volume);
  };

  return (
    <section className={styles.sound} aria-label="Sound controls" data-sound-control>
      <button
        type="button"
        onPointerDown={(event) => event.stopPropagation()}
        onMouseDown={(event) => {
          event.stopPropagation();
          event.preventDefault();
          handleToggle();
        }}
        onClick={(event) => {
          if (event.detail === 0) {
            handleToggle();
          }
        }}
      >
        {enabled ? "Sound Off" : "Sound On"}
      </button>
      <input
        aria-label="Sound volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
        disabled={unavailable}
        value={enabled ? state.volume : 0}
        onInput={(event) => handleVolumeChange(Number(event.currentTarget.value))}
      />
      <span className={styles.status}>
        {state.status === "unavailable"
          ? state.reason
          : enabled
            ? "Music enabled"
            : `Sound ${state.status}`}
      </span>
    </section>
  );
}
