import type { KeyboardEvent } from "react";
import type { VisualModeId } from "../shared/domain";
import { visualModes } from "../layers/visualModes";
import styles from "./VisualModeSelector.module.css";

export function VisualModeSelector({
  value,
  onChange,
  disabled = false
}: {
  value: VisualModeId;
  onChange: (mode: VisualModeId) => void;
  disabled?: boolean;
}) {
  const selectedIndex = visualModes.findIndex((mode) => mode.id === value);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = (selectedIndex + delta + visualModes.length) % visualModes.length;
    onChange(visualModes[next].id);
  };

  return (
    <div
      className={styles.tabs}
      role="tablist"
      aria-label="Visual mode"
      onKeyDown={handleKeyDown}
    >
      {visualModes.map((mode) => (
        <button
          key={mode.id}
          type="button"
          role="tab"
          disabled={disabled}
          aria-selected={value === mode.id}
          className={`${styles.tab} ${value === mode.id ? styles.selected : ""}`}
          onClick={() => onChange(mode.id)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
