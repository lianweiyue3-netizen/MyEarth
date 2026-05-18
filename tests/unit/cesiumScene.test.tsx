import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CesiumSceneProps } from "../../src/cesium/CesiumScene";
import { CesiumScene } from "../../src/cesium/CesiumScene";

const mocks = vi.hoisted(() => {
  const cameraController = {
    execute: vi.fn().mockResolvedValue(undefined),
    notifyManualInteraction: vi.fn(),
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
  clouds: true,
  atmosphere: true,
  terrain: true,
  labels: true,
  buildings: false,
  weatherRadar: false,
  aurora: false,
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
});
