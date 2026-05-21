import { useEffect, useState } from "react";
import { moveFocusToPanel } from "../accessibility/focusManagement";
import { getLearningContentForLocation } from "../content/learningContent";
import type { LayerId } from "../shared/domain";
import styles from "./LearningPanel.module.css";

export const LEARNING_PANEL_ID = "myearth-learning-panel";

const layerLabels: Partial<Record<LayerId, string>> = {
  atmosphere: "atmosphere",
  terrain: "terrain",
  labels: "labels",
  weatherRadar: "radar",
  sound: "sound"
};

export function LearningPanel({
  selectedLocationId,
  layers = {},
  onLayerRequest
}: {
  selectedLocationId?: string;
  layers?: Partial<Record<LayerId, boolean>>;
  onLayerRequest: (id: LayerId) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const content = getLearningContentForLocation(selectedLocationId);

  useEffect(() => {
    if (selectedLocationId) {
      moveFocusToPanel(LEARNING_PANEL_ID);
    }
  }, [selectedLocationId]);

  return (
    <section
      id={LEARNING_PANEL_ID}
      className={styles.panel}
      aria-label="Learning panel"
    >
      <div className={styles.header}>
        <h2>{content.title}</h2>
        <button
          type="button"
          className={styles.collapse}
          aria-expanded={expanded}
          aria-controls={`${LEARNING_PANEL_ID}-body`}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Hide" : "Show"}
        </button>
      </div>
      <div
        id={`${LEARNING_PANEL_ID}-body`}
        className={`${styles.body} ${expanded ? "" : styles.collapsed}`}
      >
        <p className={styles.summary}>{content.summary}</p>
        {content.sections.map((section) => (
          <div key={section.heading} className={styles.section}>
            <strong>{section.heading}</strong>
            <p>{section.body}</p>
          </div>
        ))}
        <ul className={styles.facts}>
          {content.facts.map((fact) => (
            <li key={fact} className={styles.fact}>
              {fact}
            </li>
          ))}
        </ul>
        {content.illustrativeDisclaimer ? (
          <p className={styles.disclaimer}>{content.illustrativeDisclaimer}</p>
        ) : null}
        <div className={styles.layers} aria-label="Suggested layers">
          {content.suggestedLayers.map((layerId) => {
            const layerLabel = layerLabels[layerId];
            if (!layerLabel) {
              return null;
            }
            const enabled = Boolean(layers[layerId]);

            return (
              <button
                key={layerId}
                type="button"
                disabled={enabled}
                onClick={() => onLayerRequest(layerId)}
              >
                {enabled ? "Enabled" : "Enable"} {layerLabel}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
