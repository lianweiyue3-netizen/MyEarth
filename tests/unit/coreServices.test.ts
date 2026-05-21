import { afterEach, describe, expect, it, vi } from "vitest";
import { createCameraController } from "../../src/camera/cameraController";
import { createLayerController } from "../../src/layers/layerController";
import { createBuildingsLayerAdapter } from "../../src/layers/buildingsLayer";
import { createWeatherRadarLayerAdapter } from "../../src/layers/weatherRadarLayer";
import { createWeatherRadarService } from "../../src/layers/weatherRadarService";
import { getVisualMode } from "../../src/layers/visualModes";
import { defaultQualityProfile, computeQualityProfile, downgradeQuality } from "../../src/performance/qualityController";
import { createFrameHealthMonitor } from "../../src/performance/frameHealthMonitor";
import { createCesiumGeocoderAdapter } from "../../src/search/cesiumGeocoderAdapter";
import { createSearchService, type SearchAdapter } from "../../src/search/searchService";
import { createSoundscape } from "../../src/sound/soundscape";
import { createTourController } from "../../src/tour/tourController";
import { createMyEarthViewer, destroyMyEarthViewer } from "../../src/cesium/viewerLifecycle";

function createViewer() {
  return {
    camera: {
      flyTo: vi.fn(),
      setView: vi.fn(),
      rotateRight: vi.fn(),
      positionCartographic: {
        longitude: 2,
        latitude: 0.6,
        height: 8_000_000
      },
      pickEllipsoid: vi.fn(() => ({ cartesian: "center" }))
    },
    scene: {
      canvas: {
        clientWidth: 1200,
        clientHeight: 900
      },
      globe: {
        ellipsoid: { earth: true }
      },
      primitives: {
        add: vi.fn((item) => item),
        remove: vi.fn(() => true)
      },
      requestRender: vi.fn()
    },
    imageryLayers: {
      addImageryProvider: vi.fn((provider) => ({ provider })),
      remove: vi.fn(() => true)
    },
    __myEarthCesium: {
      Cartesian3: {
        fromDegrees: vi.fn((longitude, latitude, height) => ({
          longitude,
          latitude,
          height
        })),
        fromRadians: vi.fn((longitude, latitude, height) => ({
          longitude,
          latitude,
          height,
          radians: true
        }))
      },
      Cartesian2: vi.fn(function (
        this: { x: number; y: number },
        x: number,
        y: number
      ) {
        this.x = x;
        this.y = y;
      }),
      Cartographic: {
        fromCartesian: vi.fn(() => ({
          longitude: 1.25,
          latitude: 0.35
        }))
      },
      Math: {
        toRadians: (degrees: number) => (degrees * Math.PI) / 180
      }
    }
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("camera controller", () => {
  it("flies to selected places without resuming orbit", async () => {
    const requestAnimationFrame = vi.fn(() => 1);
    vi.stubGlobal("requestAnimationFrame", requestAnimationFrame);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const viewer = createViewer();
    const onModeChange = vi.fn();
    const controller = createCameraController({
      viewer,
      reducedMotion: false,
      onModeChange
    });

    await controller.execute({
      type: "flyToLocation",
      locationId: "mount-everest",
      source: "wonder"
    });
    expect(viewer.camera.flyTo).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: expect.any(Number)
      })
    );
    expect(controller.getMode()).toBe("manual");
    expect(requestAnimationFrame).not.toHaveBeenCalled();

    await controller.execute({
      type: "flyToLocation",
      locationId: "tokyo",
      source: "city"
    });
    expect(controller.getMode()).toBe("manual");

    await controller.execute({
      type: "flyToCoordinates",
      latitude: 35.6764,
      longitude: 139.65
    });
    expect(controller.getMode()).toBe("manual");
    expect(requestAnimationFrame).not.toHaveBeenCalled();

    controller.notifyManualInteraction();
    expect(controller.getMode()).toBe("manual");
    expect(onModeChange).toHaveBeenCalledWith("manual");
  });

  it("uses reset preset and rejects unknown locations safely", async () => {
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const viewer = createViewer();
    const controller = createCameraController({
      viewer,
      reducedMotion: true
    });

    await controller.execute({ type: "resetView" });
    expect(viewer.__myEarthCesium.Cartesian3.fromDegrees).toHaveBeenCalledWith(
      0,
      0,
      22_000_000
    );

    await expect(
      controller.execute({
        type: "flyToLocation",
        locationId: "missing",
        source: "wonder"
      })
    ).rejects.toThrow("Unknown location id");
  });

  it("recenters and levels manual wheel zoom views", () => {
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 12;
    });
    vi.stubGlobal("requestAnimationFrame", requestAnimationFrame);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const viewer = createViewer();
    const onModeChange = vi.fn();
    const controller = createCameraController({
      viewer,
      reducedMotion: false,
      onModeChange
    });

    controller.notifyManualZoom(240);

    expect(requestAnimationFrame).toHaveBeenCalledOnce();
    expect(viewer.camera.pickEllipsoid).toHaveBeenCalledWith(
      { x: 600, y: 450 },
      viewer.scene.globe.ellipsoid
    );
    expect(viewer.__myEarthCesium.Cartographic.fromCartesian).toHaveBeenCalledWith(
      { cartesian: "center" },
      viewer.scene.globe.ellipsoid
    );
    expect(viewer.__myEarthCesium.Cartesian3.fromRadians).toHaveBeenCalledWith(
      1.25,
      0.35,
      8_000_000
    );
    expect(viewer.camera.setView).toHaveBeenCalledWith(
      expect.objectContaining({
        orientation: expect.objectContaining({
          heading: 0,
          pitch: -Math.PI / 2,
          roll: 0
        })
      })
    );
    expect(viewer.scene.requestRender).toHaveBeenCalledOnce();
    expect(controller.getMode()).toBe("manual");
    expect(onModeChange).toHaveBeenCalledWith("manual");
  });

  it("levels wheel zoom-in gestures too", () => {
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 12;
    });
    vi.stubGlobal("requestAnimationFrame", requestAnimationFrame);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const viewer = createViewer();
    const controller = createCameraController({
      viewer,
      reducedMotion: false
    });

    controller.notifyManualZoom(-120);

    expect(requestAnimationFrame).toHaveBeenCalledOnce();
    expect(viewer.camera.setView).toHaveBeenCalledWith(
      expect.objectContaining({
        orientation: expect.objectContaining({
          pitch: -Math.PI / 2
        })
      })
    );
    expect(controller.getMode()).toBe("manual");
  });
});

describe("layer adapters", () => {
  it("loads buildings opportunistically and reports failures as recoverable", async () => {
    const viewer = createViewer();
    (viewer.__myEarthCesium as any).createOsmBuildingsAsync = vi
      .fn()
      .mockRejectedValue(new Error("offline"));

    const availability = await createBuildingsLayerAdapter().setVisible(
      {
        viewer,
        quality: computeQualityProfile("high"),
        reducedMotion: false
      },
      true
    );

    expect(availability).toMatchObject({
      status: "failed",
      recoverable: true
    });
  });

  it("routes layer controller availability updates", async () => {
    const viewer = createViewer();
    const onAvailabilityChange = vi.fn();
    const controller = createLayerController({
      viewer,
      onAvailabilityChange,
      adapters: [
        {
          id: "weatherRadar",
          setVisible: vi.fn().mockResolvedValue({ status: "available" })
        }
      ]
    });

    await controller.setLayerVisibility("weatherRadar", true);
    expect(onAvailabilityChange).toHaveBeenCalledWith("weatherRadar", {
      status: "available"
    });
  });

  it("treats RainViewer failure as a non-fatal layer failure", async () => {
    const adapter = createWeatherRadarLayerAdapter({
      getLatestFrame: vi.fn().mockRejectedValue(new Error("offline")),
      clearCache: vi.fn()
    });

    await expect(
      adapter.setVisible(
        {
          viewer: createViewer(),
          quality: defaultQualityProfile,
          reducedMotion: false
        },
        true
      )
    ).resolves.toMatchObject({
      status: "failed",
      recoverable: true
    });
  });

  it("styles RainViewer imagery so the radar layer is visible when active", async () => {
    const viewer = createViewer();
    (viewer.__myEarthCesium as any).UrlTemplateImageryProvider = vi
      .fn()
      .mockImplementation((options) => ({ options }));
    const adapter = createWeatherRadarLayerAdapter({
      getLatestFrame: vi.fn().mockResolvedValue({
        host: "https://tiles.example",
        path: "/radar/latest",
        time: 3
      }),
      clearCache: vi.fn()
    });

    await expect(
      adapter.setVisible(
        {
          viewer,
          quality: defaultQualityProfile,
          reducedMotion: false
        },
        true
      )
    ).resolves.toEqual({ status: "available" });

    const layer = viewer.imageryLayers.addImageryProvider.mock.results[0]?.value;
    expect(layer).toMatchObject({
      alpha: expect.any(Number),
      brightness: expect.any(Number),
      contrast: expect.any(Number),
      saturation: expect.any(Number),
      show: true
    });
    expect(layer.alpha).toBeGreaterThan(0.5);
    expect(layer.brightness).toBeGreaterThan(1);
    expect(
      (viewer.__myEarthCesium as any).UrlTemplateImageryProvider
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        maximumLevel: 7,
        url: "https://tiles.example/radar/latest/256/{z}/{x}/{y}/2/1_1.png"
      })
    );

    await adapter.applyVisualMode?.(
      {
        viewer,
        quality: defaultQualityProfile,
        reducedMotion: false
      },
      getVisualMode("nightLights")
    );
    expect(layer.alpha).toBeCloseTo(0.528);
  });

  it("removes RainViewer imagery when radar is toggled off", async () => {
    const viewer = createViewer();
    (viewer.__myEarthCesium as any).UrlTemplateImageryProvider = vi
      .fn()
      .mockImplementation((options) => ({ options }));
    const adapter = createWeatherRadarLayerAdapter({
      getLatestFrame: vi.fn().mockResolvedValue({
        host: "https://tiles.example",
        path: "/radar/latest",
        time: 3
      }),
      clearCache: vi.fn()
    });
    const context = {
      viewer,
      quality: defaultQualityProfile,
      reducedMotion: false
    };

    await adapter.setVisible(context, true);
    const layer = viewer.imageryLayers.addImageryProvider.mock.results[0]?.value;

    await expect(adapter.setVisible(context, false)).resolves.toEqual({
      status: "available"
    });

    expect(layer.show).toBe(false);
    expect(viewer.imageryLayers.remove).toHaveBeenCalledWith(layer, true);
    expect(viewer.scene.requestRender).toHaveBeenCalled();
  });

  it("does not add late RainViewer imagery after radar is toggled off", async () => {
    const viewer = createViewer();
    (viewer.__myEarthCesium as any).UrlTemplateImageryProvider = vi
      .fn()
      .mockImplementation((options) => ({ options }));
    type RadarFrame = { host: string; path: string; time: number };
    let resolveFrame: (frame: RadarFrame) => void = () => undefined;
    const adapter = createWeatherRadarLayerAdapter({
      getLatestFrame: vi.fn(
        () =>
          new Promise<RadarFrame>((resolve) => {
            resolveFrame = resolve;
          })
      ),
      clearCache: vi.fn()
    });
    const context = {
      viewer,
      quality: defaultQualityProfile,
      reducedMotion: false
    };

    const enablePromise = adapter.setVisible(context, true);
    await adapter.setVisible(context, false);
    resolveFrame({
      host: "https://tiles.example",
      path: "/radar/latest",
      time: 3
    });
    await expect(enablePromise).resolves.toEqual({ status: "available" });

    expect(viewer.imageryLayers.addImageryProvider).not.toHaveBeenCalled();
    expect(viewer.imageryLayers.remove).not.toHaveBeenCalled();
  });
});

describe("weather radar service", () => {
  it("uses the latest past radar frame and caches metadata", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        host: "https://tiles.example",
        radar: {
          past: [
            { path: "/old", time: 1 },
            { path: "/latest", time: 2 }
          ]
        }
      })
    });
    const service = createWeatherRadarService(fetcher as unknown as typeof fetch, () => 1000);

    await expect(service.getLatestFrame()).resolves.toEqual({
      host: "https://tiles.example",
      path: "/latest",
      time: 2
    });
    await service.getLatestFrame();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

describe("search service", () => {
  it("normalizes Cesium geocoder city bbox responses for close search zoom", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        features: [
          {
            properties: { label: "Tokyo, Japan" },
            bbox: [139.079681, 35.328815, 140.459503, 36.02158]
          }
        ]
      })
    });
    const adapter = createCesiumGeocoderAdapter(
      "test-token",
      fetcher as unknown as typeof fetch
    );

    const results = await adapter?.search("Tokyo");

    expect(results).toHaveLength(1);
    expect(results?.[0]).toEqual(
      expect.objectContaining({
        id: "Tokyo, Japan-0",
        label: "Tokyo, Japan",
        heightMeters: 6500
      })
    );
    expect(results?.[0]?.longitude).toBeCloseTo(139.769592, 6);
    expect(results?.[0]?.latitude).toBeCloseTo(35.6751975, 7);
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("keeps broad geocoder bbox responses at regional search zoom", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        features: [
          {
            properties: { label: "Japan" },
            bbox: [122.9, 24.0, 153.9, 45.6]
          }
        ]
      })
    });
    const adapter = createCesiumGeocoderAdapter(
      "test-token",
      fetcher as unknown as typeof fetch
    );

    const results = await adapter?.search("Japan");

    expect(results?.[0]?.heightMeters).toBeGreaterThan(1_000_000);
  });

  it("short circuits empty and disabled searches", async () => {
    const adapter: SearchAdapter = { search: vi.fn() };

    await expect(createSearchService(adapter, true).search("  ")).resolves.toEqual([]);
    await expect(createSearchService(adapter, false).search("Tokyo")).resolves.toEqual([]);
    expect(adapter.search).not.toHaveBeenCalled();
  });

  it("ignores stale request results", async () => {
    let resolveFirst: (value: any) => void = () => undefined;
    let resolveSecond: (value: any) => void = () => undefined;
    const adapter: SearchAdapter = {
      search: vi
        .fn()
        .mockImplementationOnce(
          () => new Promise((resolve) => (resolveFirst = resolve))
        )
        .mockImplementationOnce(
          () => new Promise((resolve) => (resolveSecond = resolve))
        )
    };
    const service = createSearchService(adapter, true);

    const first = service.search("Tokyo");
    const second = service.search("Paris");
    resolveSecond([{ id: "paris", label: "Paris", latitude: 48.8, longitude: 2.3 }]);
    resolveFirst([{ id: "tokyo", label: "Tokyo", latitude: 35.6, longitude: 139.6 }]);

    await expect(second).resolves.toHaveLength(1);
    await expect(first).resolves.toEqual([]);
  });
});

describe("tour controller", () => {
  it("starts at Mount Everest and keeps cities out of the primary tour", async () => {
    const onStateChange = vi.fn();
    const onSelectLocation = vi.fn();
    const onCameraCommand = vi.fn().mockResolvedValue(undefined);
    const controller = createTourController({
      onStateChange,
      onSelectLocation,
      onCameraCommand
    });

    controller.start();
    await Promise.resolve();

    expect(onSelectLocation).toHaveBeenCalledWith("mount-everest");
    expect(onCameraCommand).toHaveBeenCalledWith(
      expect.objectContaining({ locationId: "mount-everest" })
    );

    controller.next();
    await Promise.resolve();
    expect(onSelectLocation).toHaveBeenCalledWith("grand-canyon");
    expect(onSelectLocation).not.toHaveBeenCalledWith("tokyo");
  });
});

describe("soundscape", () => {
  it("does not create audio until explicit enable", async () => {
    const states: unknown[] = [];
    const createAudio = vi.fn(() => ({
      currentTime: 0,
      loop: false,
      pause: vi.fn(),
      play: vi.fn().mockResolvedValue(undefined),
      preload: "",
      src: "",
      volume: 0
    }));
    const soundscape = createSoundscape(
      (state) => states.push(state),
      createAudio
    );

    soundscape.prompt();
    expect(createAudio).not.toHaveBeenCalled();

    await expect(soundscape.enable()).resolves.toMatchObject({
      status: "enabled"
    });
    expect(createAudio).toHaveBeenCalledTimes(1);
    await expect(soundscape.disable()).resolves.toEqual({ status: "disabled" });
  });
});

describe("performance quality", () => {
  it("maps device profile and downgrade order deterministically", () => {
    expect(computeQualityProfile("auto", { mobile: true }).effectiveTier).toBe("low");
    expect(
      computeQualityProfile("auto", {
        memoryGb: 16,
        hardwareConcurrency: 8,
        mobile: false
      }).effectiveTier
    ).toBe("high");
    expect(downgradeQuality(computeQualityProfile("high")).effectiveTier).toBe(
      "balanced"
    );
    expect(downgradeQuality(computeQualityProfile("balanced")).effectiveTier).toBe(
      "low"
    );
  });

  it("buckets frame health", () => {
    const monitor = createFrameHealthMonitor(2);
    expect(monitor.recordFrame(16)).toBe("good");
    expect(monitor.recordFrame(50)).toBe("fair");
    expect(monitor.recordFrame(60)).toBe("poor");
  });
});

describe("viewer lifecycle", () => {
  it("returns missing token and destroys viewers idempotently", async () => {
    const container = document.createElement("div");

    await expect(
      createMyEarthViewer({
        container,
        initialQuality: defaultQualityProfile
      })
    ).resolves.toMatchObject({ status: "missingToken" });

    const viewer = {
      isDestroyed: vi.fn().mockReturnValue(false),
      destroy: vi.fn()
    };
    destroyMyEarthViewer(viewer);
    destroyMyEarthViewer(undefined);
    expect(viewer.destroy).toHaveBeenCalledOnce();
  });
});
