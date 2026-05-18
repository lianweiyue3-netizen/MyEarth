import type { QualityProfile } from "../shared/domain";
import styles from "./QualityIndicator.module.css";

export function QualityIndicator({ profile }: { profile: QualityProfile }) {
  return (
    <span className={styles.quality} aria-label="Quality status">
      Quality: {profile.mode} / {profile.effectiveTier}
    </span>
  );
}
