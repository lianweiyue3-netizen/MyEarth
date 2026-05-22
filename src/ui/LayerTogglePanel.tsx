import type { LayerAvailability, LayerId } from "../shared/domain";
import styles from "./LayerTogglePanel.module.css";

const visibleLayerIds = [
  "atmosphere",
  "terrain",
  "labels",
  "weatherRadar",
  "sound"
] as const satisfies readonly LayerId[];

type VisibleLayerId = (typeof visibleLayerIds)[number];

const layerLabels: Record<VisibleLayerId, string> = {
  atmosphere: "Atmosphere",
  terrain: "Terrain",
  labels: "Labels",
  weatherRadar: "Radar",
  sound: "Sound"
};

export function LayerTogglePanel({
  layers,
  availability,
  onToggle,
  onSoundToggle,
  disabled = false
}: {
  layers: Record<LayerId, boolean>;
  availability: Record<LayerId, LayerAvailability>;
  onToggle: (id: LayerId, visible: boolean) => void;
  onSoundToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <section className={styles.panel} aria-label="Layer toggles">
      <div className={styles.grid}>
        {visibleLayerIds.map((id) => {
          const layerAvailability = availability[id];
          const unavailable = layerAvailability.status !== "available";
          const reason =
            layerAvailability.status === "disabled" ||
            layerAvailability.status === "failed"
              ? layerAvailability.reason
              : "";
          const active = layers[id];

          return (
            <button
              key={id}
              type="button"
              className={`${styles.toggle} ${active ? styles.active : ""}`}
              aria-pressed={active}
              disabled={disabled || unavailable}
              title={reason || layerLabels[id]}
              onClick={() =>
                id === "sound" ? onSoundToggle() : onToggle(id, !active)
              }
            >
              {layerLabels[id]}
            </button>
          );
        })}
      </div>
      {visibleLayerIds.map((id) => {
        const entry = availability[id];
        return entry.status === "available" ? null : (
          <p key={id} className={styles.reason}>
            {layerLabels[id]}: {entry.reason}
          </p>
        );
      })}
    </section>
  );
}
