import { useEffect, useState } from "react";
import { moveFocusToPanel } from "../accessibility/focusManagement";
import { getLearningContentForLocation } from "../content/learningContent";
import type { LayerId } from "../shared/domain";
import styles from "./LearningPanel.module.css";

export const LEARNING_PANEL_ID = "myearth-learning-panel";

export function LearningPanel({
  selectedLocationId,
  onLayerRequest
}: {
  selectedLocationId?: string;
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
          {content.suggestedLayers.map((layerId) => (
            <button
              key={layerId}
              type="button"
              onClick={() => onLayerRequest(layerId)}
            >
              Enable {layerId}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
