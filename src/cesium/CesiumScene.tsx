import { useEffect, useRef, useState } from "react";
import { createCameraController } from "../camera/cameraController";
import { createLayerController } from "../layers/layerController";
import { defaultQualityProfile } from "../performance/qualityController";
import type {
  AppConfig,
  AppError,
  CameraCommand,
  CameraMode,
  LayerAvailability,
  LayerId,
  QualityMode,
  VisualModeId
} from "../shared/domain";
import { createMyEarthViewer, destroyMyEarthViewer } from "./viewerLifecycle";
import styles from "./CesiumScene.module.css";

export type CesiumSceneProps = {
  config: AppConfig;
  visualMode: VisualModeId;
  layers: Record<LayerId, boolean>;
  qualityMode: QualityMode;
  selectedLocationId?: string;
  cameraCommand?: CameraCommand;
  onViewerReady: () => void;
  onFirstFrame: () => void;
  onCameraModeChange: (mode: CameraMode) => void;
  onLayerAvailabilityChange: (
    id: LayerId,
    availability: LayerAvailability
  ) => void;
  onError: (error: AppError) => void;
};

export function CesiumScene(props: CesiumSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>();
  const cameraRef = useRef<ReturnType<typeof createCameraController>>();
  const layersRef = useRef<ReturnType<typeof createLayerController>>();
  const createdRef = useRef(false);
  const firstFrameRef = useRef(false);
  const lastCommandRef = useRef<CameraCommand>();
  const [missingTokenMessage, setMissingTokenMessage] = useState<string>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || createdRef.current) {
      return;
    }

    let cancelled = false;
    createdRef.current = true;

    void createMyEarthViewer({
      token: props.config.cesiumIonToken,
      container,
      initialQuality: defaultQualityProfile
    }).then((result) => {
      if (cancelled) {
        return;
      }

      if (result.status === "missingToken") {
        setMissingTokenMessage(result.message);
        props.onError({
          code: "missing-cesium-token",
          severity: "info",
          publicMessage: result.message,
          recoverable: true
        });
        props.onViewerReady();
        queueFirstFrame();
        return;
      }

      if (result.status === "failed") {
        props.onError(result.error);
        return;
      }

      viewerRef.current = result.viewer;
      cameraRef.current = createCameraController({
        viewer: result.viewer,
        reducedMotion: false,
        onModeChange: props.onCameraModeChange,
        onBuildingsOpportunity: () =>
          props.onLayerAvailabilityChange("buildings", { status: "available" })
      });
      layersRef.current = createLayerController({
        viewer: result.viewer,
        onAvailabilityChange: props.onLayerAvailabilityChange
      });
      props.onViewerReady();
      void layersRef.current.setVisualMode(props.visualMode);
      for (const [id, visible] of Object.entries(props.layers) as Array<
        [LayerId, boolean]
      >) {
        void layersRef.current.setLayerVisibility(id, visible);
      }
      void cameraRef.current.execute({ type: "startIntroOrbit" });
      queueFirstFrame();
    });

    const handleManual = () => {
      cameraRef.current?.notifyManualInteraction();
      props.onCameraModeChange("manual");
    };
    container.addEventListener("pointerdown", handleManual);
    container.addEventListener("wheel", handleManual, { passive: true });
    container.addEventListener("touchstart", handleManual, { passive: true });

    const queueFirstFrame = () => {
      if (firstFrameRef.current) {
        return;
      }
      firstFrameRef.current = true;
      requestAnimationFrame(() => props.onFirstFrame());
    };

    return () => {
      cancelled = true;
      container.removeEventListener("pointerdown", handleManual);
      container.removeEventListener("wheel", handleManual);
      container.removeEventListener("touchstart", handleManual);
      cameraRef.current?.dispose();
      layersRef.current?.dispose();
      if (viewerRef.current) {
        destroyMyEarthViewer(viewerRef.current);
      }
    };
    // The Cesium Viewer must be created once per mounted DOM container.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void layersRef.current?.setVisualMode(props.visualMode);
  }, [props.visualMode]);

  useEffect(() => {
    for (const [id, visible] of Object.entries(props.layers) as Array<
      [LayerId, boolean]
    >) {
      void layersRef.current?.setLayerVisibility(id, visible);
    }
  }, [props.layers]);

  useEffect(() => {
    if (props.cameraCommand && props.cameraCommand !== lastCommandRef.current) {
      lastCommandRef.current = props.cameraCommand;
      void cameraRef.current?.execute(props.cameraCommand);
    }
  }, [props.cameraCommand]);

  return (
    <div className={styles.scene} data-testid="cesium-scene">
      <div ref={containerRef} className={styles.container} />
      {missingTokenMessage ? (
        <div className={styles.demoEarth} data-testid="missing-token-fallback">
          <div className={styles.planet} aria-hidden="true" />
          <div className={styles.missingToken}>
            <strong>Limited demo mode</strong>
            <p>
              Set <code>VITE_CESIUM_ION_TOKEN</code> to enable the live Cesium
              globe, terrain, geocoding, night lights, and buildings.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
