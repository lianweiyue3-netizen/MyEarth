import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CesiumSceneProps } from "../../src/cesium/CesiumScene";
import { CesiumScene } from "../../src/cesium/CesiumScene";

const mocks = vi.hoisted(() => {
  const cameraController = {
    execute: vi.fn().mockResolvedValue(undefined),
    notifyManualInteraction: vi.fn(),
    notifyManualZoom: vi.fn(),
    getMode: vi.fn(() => "introOrbit"),
    dispose: vi.fn()
  };
  const layerController = {
    setVisualMode: vi.fn().mockResolvedValue(undefined),
    setLayerVisibility: vi.fn().mockResolvedValue(undefined),
    applyQuality: vi.fn().mockResolvedValue(undefined),
    dispose: vi.fn()
  };

  return {
    createMyEarthViewer: vi.fn(),
    destroyMyEarthViewer: vi.fn(),
    createCameraController: vi.fn(() => cameraController),
    createLayerController: vi.fn(() => layerController),
    cameraController,
    layerController
  };
});

vi.mock("../../src/cesium/viewerLifecycle", () => ({
  createMyEarthViewer: mocks.createMyEarthViewer,
  destroyMyEarthViewer: mocks.destroyMyEarthViewer
}));

vi.mock("../../src/camera/cameraController", () => ({
  createCameraController: mocks.createCameraController
}));

vi.mock("../../src/layers/layerController", () => ({
  createLayerController: mocks.createLayerController
}));

const baseLayers = {
  atmosphere: true,
  terrain: true,
  labels: true,
  buildings: false,
  weatherRadar: false,
  sound: false
};

function createProps(overrides: Partial<CesiumSceneProps> = {}): CesiumSceneProps {
  return {
    config: {
      cesiumIonToken: "token",
      appEnv: "development",
      telemetry: { enabled: false }
    },
    visualMode: "satellite",
    layers: baseLayers,
    qualityMode: "auto",
    onViewerReady: vi.fn(),
    onFirstFrame: vi.fn(),
    onCameraModeChange: vi.fn(),
    onLayerAvailabilityChange: vi.fn(),
    onError: vi.fn(),
    ...overrides
  };
}

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("CesiumScene", () => {
  it("destroys a viewer that resolves after unmount", async () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    let resolveViewer: (value: { status: "ready"; viewer: { id: string } }) => void =
      () => undefined;
    const viewer = { id: "late-viewer" };
    mocks.createMyEarthViewer.mockReturnValue(
      new Promise((resolve) => {
        resolveViewer = resolve;
      })
    );

    const { unmount } = render(<CesiumScene {...createProps()} />);
    unmount();
    resolveViewer({ status: "ready", viewer });
    await Promise.resolve();

    expect(mocks.destroyMyEarthViewer).toHaveBeenCalledWith(viewer);
  });

  it("creates the viewer once, responds to updates, and cleans up", async () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    const viewer = { id: "viewer" };
    mocks.createMyEarthViewer.mockResolvedValue({ status: "ready", viewer });
    const props = createProps();

    const { rerender, unmount } = render(<CesiumScene {...props} />);

    await waitFor(() => expect(props.onViewerReady).toHaveBeenCalledOnce());
    await waitFor(() => expect(props.onFirstFrame).toHaveBeenCalledOnce());

    rerender(<CesiumScene {...props} visualMode="nightLights" />);
    await waitFor(() =>
      expect(mocks.layerController.setVisualMode).toHaveBeenCalledWith("nightLights")
    );
    expect(mocks.createMyEarthViewer).toHaveBeenCalledTimes(1);

    rerender(
      <CesiumScene
        {...props}
        layers={{ ...baseLayers, weatherRadar: true }}
      />
    );
    await waitFor(() =>
      expect(mocks.layerController.setLayerVisibility).toHaveBeenCalledWith(
        "weatherRadar",
        true
      )
    );
    expect(mocks.createMyEarthViewer).toHaveBeenCalledTimes(1);

    fireEvent.pointerDown(
      document.querySelector("[data-testid='cesium-scene'] > div")!
    );
    expect(mocks.cameraController.notifyManualInteraction).toHaveBeenCalledOnce();
    expect(props.onCameraModeChange).toHaveBeenCalledWith("manual");

    fireEvent.wheel(document.querySelector("[data-testid='cesium-scene'] > div")!, {
      deltaY: 120
    });
    expect(mocks.cameraController.notifyManualZoom).toHaveBeenCalledWith(120);

    unmount();
    expect(mocks.cameraController.dispose).toHaveBeenCalledOnce();
    expect(mocks.layerController.dispose).toHaveBeenCalledOnce();
    expect(mocks.destroyMyEarthViewer).toHaveBeenCalledWith(viewer);
  });

  it("reports missing token without throwing", async () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    mocks.createMyEarthViewer.mockResolvedValue({
      status: "missingToken",
      message: "Missing token"
    });
    const props = createProps({
      config: {
        appEnv: "development",
        telemetry: { enabled: false }
      }
    });

    render(<CesiumScene {...props} />);

    await waitFor(() =>
      expect(props.onError).toHaveBeenCalledWith(
        expect.objectContaining({ code: "missing-cesium-token" })
      )
    );
  });

  it("captures map clicks while measuring and draws distance entities", async () => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    const viewer = createMeasurementViewer();
    mocks.createMyEarthViewer.mockResolvedValue({ status: "ready", viewer });
    const onMeasurePoint = vi.fn();
    const props = createProps({
      distanceMeasurement: { active: true, points: [] },
      onMeasurePoint
    });

    const { rerender } = render(<CesiumScene {...props} />);

    await waitFor(() => expect(props.onViewerReady).toHaveBeenCalledOnce());
    fireEvent.click(document.querySelector("[data-testid='cesium-scene'] > div")!, {
      clientX: 110,
      clientY: 70
    });

    expect(viewer.camera.pickEllipsoid).toHaveBeenCalledWith(
      expect.objectContaining({ x: 100, y: 50 }),
      viewer.scene.globe.ellipsoid
    );
    expect(onMeasurePoint).toHaveBeenCalledWith({
      latitude: 10,
      longitude: 20
    });

    rerender(
      <CesiumScene
        {...props}
        distanceMeasurement={{
          active: true,
          points: [
            { latitude: 0, longitude: 0 },
            { latitude: 0, longitude: 1 }
          ],
          distanceMeters: 111_195
        }}
      />
    );

    await waitFor(() => expect(viewer.entities.add).toHaveBeenCalledTimes(4));
    expect(viewer.entities.add).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Distance line" })
    );
    expect(viewer.entities.add).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Distance label" })
    );
    expect(viewer.scene.requestRender).toHaveBeenCalled();
  });
});

function createMeasurementViewer() {
  const ellipsoid = { id: "ellipsoid" };
  const Cartesian2 = class {
    x: number;
    y: number;

    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  };

  return {
    id: "measurement-viewer",
    camera: {
      moveEnd: { addEventListener: vi.fn(() => vi.fn()) },
      positionCartographic: { height: 20_000, latitude: 0, longitude: 0 },
      pickEllipsoid: vi.fn(() => ({ id: "picked" }))
    },
    scene: {
      canvas: {
        clientWidth: 1000,
        clientHeight: 500,
        getBoundingClientRect: () => ({ left: 10, top: 20 })
      },
      globe: { ellipsoid },
      pickPositionSupported: false,
      requestRender: vi.fn()
    },
    entities: {
      add: vi.fn((entity) => entity),
      remove: vi.fn()
    },
    __myEarthCesium: {
      Cartesian2,
      Cartesian3: {
        fromDegrees: vi.fn((longitude, latitude, height) => ({
          longitude,
          latitude,
          height
        }))
      },
      Cartographic: {
        fromCartesian: vi.fn(() => ({
          latitude: Math.PI / 18,
          longitude: Math.PI / 9
        }))
      },
      Math: {
        toDegrees: (radians: number) => (radians * 180) / Math.PI
      },
      Color: {
        CYAN: "cyan",
        WHITE: "white",
        BLACK: { withAlpha: vi.fn(() => "black") }
      },
      HeightReference: { CLAMP_TO_GROUND: "clamp-to-ground" },
      VerticalOrigin: { BOTTOM: "bottom" }
    }
  };
}
