import { useEffect } from "react";
import { announceStatus } from "../accessibility/liveRegion";
import type { AppError } from "../shared/domain";
import styles from "./ErrorFallback.module.css";

export function ErrorFallback({
  error,
  onRetry
}: {
  error: AppError;
  onRetry?: () => void;
}) {
  useEffect(() => {
    announceStatus(error.publicMessage);
  }, [error.publicMessage]);

  const title =
    error.code === "missing-cesium-token"
      ? "Cesium Token Needed"
      : "3D View Unavailable";

  return (
    <main className={styles.fallback} role="alert" data-testid="error-fallback">
      <section className={styles.panel}>
        <h1>{title}</h1>
        <p>{error.publicMessage}</p>
        {error.code === "missing-cesium-token" ? (
          <p className={styles.status}>
            Add <code>VITE_CESIUM_ION_TOKEN</code> locally or in Vercel
            environment variables. Token values are never displayed by MyEarth.
          </p>
        ) : null}
        {error.recoverable && onRetry ? (
          <div className={styles.actions}>
            <button type="button" onClick={onRetry}>
              Retry
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export function RecoverableStatus({ error }: { error: AppError }) {
  useEffect(() => {
    announceStatus(error.publicMessage);
  }, [error.publicMessage]);

  return (
    <div className={styles.status} role="status">
      {error.publicMessage}
    </div>
  );
}
