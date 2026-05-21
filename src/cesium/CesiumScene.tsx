import { useEffect, useRef, useState } from "react";
import { createCameraController } from "../camera/cameraController";
import { createLayerController } from "../layers/layerController";
import {
  clearNewsHeatmapLayer,
  pickNewsCountry,
  syncNewsHeatmapLayer
} from "../layers/newsHeatmapLayer";
import { defaultQualityProfile } from "../performance/qualityController";
import type { NewsSnapshot } from "../news/newsTypes";
import type {
  AppConfig,
  AppError,
  CameraCommand,
  CameraMode,
  DistanceMeasurement,
  GlobeFocusPoint,
  LayerAvailability,
  LayerId,
  MapMeasurePoint,
  QualityMode,
  VisualModeId
} from "../shared/domain";
import { formatDistanceMeters } from "../measurement/distanceMeasurement";
import { createMyEarthViewer, destroyMyEarthViewer } from "./viewerLifecycle";
import styles from "./CesiumScene.module.css";

export const FOCUS_LOCATION_MAX_CAMERA_HEIGHT_METERS = 80_000;

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
  onFocusPointChange?: (point: GlobeFocusPoint | undefined) => void;
  distanceMeasurement?: DistanceMeasurement;
  onMeasurePoint?: (point: MapMeasurePoint) => void;
  newsSnapshot?: NewsSnapshot;
  selectedNewsCountryCode?: string;
  onNewsCountrySelect?: (countryCode: string) => void;
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
  const distanceMeasurementRef = useRef<DistanceMeasurement | undefined>(
    props.distanceMeasurement
  );
  const onMeasurePointRef = useRef<CesiumSceneProps["onMeasurePoint"]>(
    props.onMeasurePoint
  );
  const measurementEntitiesRef = useRef<any[]>([]);
  const onNewsCountrySelectRef = useRef<CesiumSceneProps["onNewsCountrySelect"]>(
    props.onNewsCountrySelect
  );
  const [missingTokenMessage, setMissingTokenMessage] = useState<string>();

  useEffect(() => {
    distanceMeasurementRef.current = props.distanceMeasurement;
    syncDistanceMeasurementEntities(
      viewerRef.current,
      props.distanceMeasurement,
      measurementEntitiesRef.current
    );
  }, [props.distanceMeasurement]);

  useEffect(() => {
    onMeasurePointRef.current = props.onMeasurePoint;
  }, [props.onMeasurePoint]);

  useEffect(() => {
    onNewsCountrySelectRef.current = props.onNewsCountrySelect;
  }, [props.onNewsCountrySelect]);

  useEffect(() => {
    if (!viewerRef.current) {
      return;
    }

    syncNewsHeatmapLayer(viewerRef.current, {
      visible: props.layers.newsHeatmap,
      snapshot: props.newsSnapshot,
      selectedCountryCode: props.selectedNewsCountryCode
    });
  }, [props.layers.newsHeatmap, props.newsSnapshot, props.selectedNewsCountryCode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || createdRef.current) {
      return;
    }

    let cancelled = false;
    let removeCameraMoveEndListener: (() => void) | undefined;
    let focusPointTimer: number | undefined;
    let firstFrameFallbackTimer: number | undefined;
    let firstFrameDelivered = false;
    let lastFocusPointKey = "";
    createdRef.current = true;

    const publishFocusPoint = () => {
      const point = getCenteredFocusPoint(viewerRef.current);
      const key = point
        ? `${point.latitude.toFixed(4)},${point.longitude.toFixed(4)}`
        : "none";

      if (key === lastFocusPointKey) {
        return;
      }

      lastFocusPointKey = key;
      props.onFocusPointChange?.(point);
    };

    const scheduleFocusPoint = () => {
      if (focusPointTimer !== undefined) {
        window.clearTimeout(focusPointTimer);
      }
      focusPointTimer = window.setTimeout(publishFocusPoint, 450);
    };

    void createMyEarthViewer({
      token: props.config.cesiumIonToken,
      container,
      initialQuality: defaultQualityProfile
    }).then((result) => {
      if (cancelled) {
        if (result.status === "ready") {
          destroyMyEarthViewer(result.viewer);
        }
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
      removeCameraMoveEndListener =
        result.viewer.camera?.moveEnd?.addEventListener?.(scheduleFocusPoint);
      cameraRef.current = createCameraController({
        viewer: result.viewer,
        reducedMotion: false,
        onModeChange: props.onCameraModeChange
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
        if (id === "newsHeatmap") {
          continue;
        }
        void layersRef.current.setLayerVisibility(id, visible);
      }
      void cameraRef.current.execute({ type: "startIntroOrbit" });
      syncDistanceMeasurementEntities(
        result.viewer,
        distanceMeasurementRef.current,
        measurementEntitiesRef.current
      );
      scheduleFocusPoint();
      queueFirstFrame();
    });

    const handleManual = () => {
      cameraRef.current?.notifyManualInteraction();
      props.onCameraModeChange("manual");
    };
    const handleWheel = (event: WheelEvent) => {
      cameraRef.current?.notifyManualZoom(event.deltaY);
      props.onCameraModeChange("manual");
    };
    const handleMeasureClick = (event: MouseEvent) => {
      if (!distanceMeasurementRef.current?.active) {
        return;
      }

      const point = pickMapMeasurePoint(viewerRef.current, event);
      if (point) {
        onMeasurePointRef.current?.(point);
      }
    };
    const handleNewsClick = (event: MouseEvent) => {
      if (distanceMeasurementRef.current?.active) {
        return;
      }

      if (!viewerRef.current) {
        return;
      }

      const pick = pickNewsCountry(viewerRef.current, event);
      if (pick) {
        onNewsCountrySelectRef.current?.(pick.countryCode);
      }
    };
    container.addEventListener("pointerdown", handleManual);
    container.addEventListener("wheel", handleWheel, { passive: true });
    container.addEventListener("touchstart", handleManual, { passive: true });
    container.addEventListener("click", handleMeasureClick);
    container.addEventListener("click", handleNewsClick);

    const queueFirstFrame = () => {
      if (firstFrameRef.current) {
        return;
      }
      firstFrameRef.current = true;
      const deliverFirstFrame = () => {
        if (firstFrameDelivered) {
          return;
        }

        firstFrameDelivered = true;
        props.onFirstFrame();
      };

      requestAnimationFrame(deliverFirstFrame);
      firstFrameFallbackTimer = window.setTimeout(deliverFirstFrame, 800);
    };

    return () => {
      cancelled = true;
      createdRef.current = false;
      firstFrameRef.current = false;
      container.removeEventListener("pointerdown", handleManual);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleManual);
      container.removeEventListener("click", handleMeasureClick);
      container.removeEventListener("click", handleNewsClick);
      removeCameraMoveEndListener?.();
      if (focusPointTimer !== undefined) {
        window.clearTimeout(focusPointTimer);
      }
      if (firstFrameFallbackTimer !== undefined) {
        window.clearTimeout(firstFrameFallbackTimer);
      }
      cameraRef.current?.dispose();
      layersRef.current?.dispose();
      clearDistanceMeasurementEntities(
        viewerRef.current,
        measurementEntitiesRef.current
      );
      clearNewsHeatmapLayer(viewerRef.current);
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
      if (id === "newsHeatmap") {
        continue;
      }
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
              globe, terrain, geocoding, and night lights.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getCenteredFocusPoint(viewer: any): GlobeFocusPoint | undefined {
  const height = viewer?.camera?.positionCartographic?.height;
  if (
    !Number.isFinite(height) ||
    height > FOCUS_LOCATION_MAX_CAMERA_HEIGHT_METERS
  ) {
    return undefined;
  }

  const cartographic =
    viewer?.camera?.positionCartographic ?? getCenteredCartographic(viewer);
  if (!cartographic) {
    return undefined;
  }

  const toDegrees =
    viewer.__myEarthCesium?.Math?.toDegrees ??
    ((radians: number) => (radians * 180) / Math.PI);
  const latitude = toDegrees(cartographic.latitude);
  const longitude = normalizeLongitude(toDegrees(cartographic.longitude));

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return undefined;
  }

  return {
    latitude,
    longitude,
    cameraHeightMeters: height
  };
}

export function pickMapMeasurePoint(
  viewer: any,
  event: Pick<MouseEvent, "clientX" | "clientY">
): MapMeasurePoint | undefined {
  const canvas = viewer?.scene?.canvas;
  const Cartesian2 = viewer?.__myEarthCesium?.Cartesian2;
  const Cartographic = viewer?.__myEarthCesium?.Cartographic;
  const ellipsoid = viewer?.scene?.globe?.ellipsoid;

  if (!canvas || !Cartesian2 || !Cartographic?.fromCartesian) {
    return undefined;
  }

  const rect = canvas.getBoundingClientRect?.() ?? { left: 0, top: 0 };
  const windowPosition = new Cartesian2(
    event.clientX - rect.left,
    event.clientY - rect.top
  );
  const scenePicked =
    viewer.scene?.pickPositionSupported && viewer.scene?.pickPosition
      ? viewer.scene.pickPosition(windowPosition)
      : viewer.camera?.pickEllipsoid?.(windowPosition, ellipsoid);
  const picked =
    scenePicked ?? viewer.camera?.pickEllipsoid?.(windowPosition, ellipsoid);

  if (!picked) {
    return undefined;
  }

  const cartographic = Cartographic.fromCartesian(picked, ellipsoid);
  const toDegrees =
    viewer.__myEarthCesium?.Math?.toDegrees ??
    ((radians: number) => (radians * 180) / Math.PI);
  const latitude = toDegrees(cartographic.latitude);
  const longitude = normalizeLongitude(toDegrees(cartographic.longitude));

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return undefined;
  }

  return { latitude, longitude };
}

function syncDistanceMeasurementEntities(
  viewer: any,
  measurement: DistanceMeasurement | undefined,
  existingEntities: any[]
) {
  clearDistanceMeasurementEntities(viewer, existingEntities);

  if (!viewer?.entities?.add || !measurement?.active || measurement.points.length === 0) {
    return;
  }

  const Cesium = viewer.__myEarthCesium;
  const Cartesian3 = Cesium?.Cartesian3;
  const Color = Cesium?.Color;
  const Cartesian2 = Cesium?.Cartesian2;

  if (!Cartesian3?.fromDegrees || !Color) {
    return;
  }

  const positions = measurement.points.map((point) =>
    Cartesian3.fromDegrees(point.longitude, point.latitude, 0)
  );

  measurement.points.forEach((point, index) => {
    const label = index === 0 ? "A" : "B";
    existingEntities.push(
      viewer.entities.add({
        name: `Distance point ${label}`,
        position: positions[index],
        point: {
          pixelSize: 11,
          color: Color.CYAN,
          outlineColor: Color.WHITE,
          outlineWidth: 2,
          heightReference: Cesium?.HeightReference?.CLAMP_TO_GROUND
        },
        label: {
          text: label,
          fillColor: Color.WHITE,
          showBackground: true,
          backgroundColor: Color.BLACK?.withAlpha?.(0.65) ?? Color.BLACK,
          pixelOffset: Cartesian2 ? new Cartesian2(0, -22) : undefined,
          verticalOrigin: Cesium?.VerticalOrigin?.BOTTOM,
          heightReference: Cesium?.HeightReference?.CLAMP_TO_GROUND
        }
      })
    );
  });

  if (positions.length === 2) {
    existingEntities.push(
      viewer.entities.add({
        name: "Distance line",
        polyline: {
          positions,
          width: 3,
          material: Color.CYAN,
          clampToGround: true
        }
      })
    );

    if (measurement.distanceMeters !== undefined) {
      const midpoint = getMeasurementMidpoint(measurement.points[0], measurement.points[1]);
      existingEntities.push(
        viewer.entities.add({
          name: "Distance label",
          position: Cartesian3.fromDegrees(midpoint.longitude, midpoint.latitude, 0),
          label: {
            text: formatDistanceMeters(measurement.distanceMeters),
            fillColor: Color.WHITE,
            showBackground: true,
            backgroundColor: Color.BLACK?.withAlpha?.(0.72) ?? Color.BLACK,
            pixelOffset: Cartesian2 ? new Cartesian2(0, -18) : undefined,
            verticalOrigin: Cesium?.VerticalOrigin?.BOTTOM,
            heightReference: Cesium?.HeightReference?.CLAMP_TO_GROUND
          }
        })
      );
    }
  }

  viewer.scene?.requestRender?.();
}

function clearDistanceMeasurementEntities(viewer: any, entities: any[]) {
  if (!viewer?.entities?.remove) {
    entities.length = 0;
    return;
  }

  for (const entity of entities) {
    viewer.entities.remove(entity);
  }
  entities.length = 0;
}

function getMeasurementMidpoint(
  start: MapMeasurePoint,
  end: MapMeasurePoint
): MapMeasurePoint {
  return {
    latitude: (start.latitude + end.latitude) / 2,
    longitude: normalizeLongitude((start.longitude + end.longitude) / 2)
  };
}

function getCenteredCartographic(viewer: any) {
  const canvas = viewer?.scene?.canvas;
  const Cartesian2 = viewer?.__myEarthCesium?.Cartesian2;
  const Cartographic = viewer?.__myEarthCesium?.Cartographic;
  const ellipsoid = viewer?.scene?.globe?.ellipsoid;
  const center =
    canvas && Cartesian2
      ? new Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2)
      : undefined;
  const picked =
    center && viewer?.camera?.pickEllipsoid
      ? viewer.camera.pickEllipsoid(center, ellipsoid)
      : undefined;

  if (picked && Cartographic?.fromCartesian) {
    return Cartographic.fromCartesian(picked, ellipsoid);
  }

  return viewer?.camera?.positionCartographic;
}

function normalizeLongitude(longitude: number) {
  if (longitude < -180 || longitude > 180) {
    return ((((longitude + 180) % 360) + 360) % 360) - 180;
  }

  return longitude;
}
