import { afterEach, describe, expect, it, vi } from "vitest";
import { createCameraController } from "../../src/camera/cameraController";
import { createLayerController } from "../../src/layers/layerController";
import { createAuroraLayerAdapter } from "../../src/layers/auroraLayer";
import { createBuildingsLayerAdapter } from "../../src/layers/buildingsLayer";
import { createProceduralCloudLayerAdapter } from "../../src/layers/proceduralCloudLayer";
import { createWeatherRadarLayerAdapter } from "../../src/layers/weatherRadarLayer";
import { createWeatherRadarService } from "../../src/layers/weatherRadarService";
import { defaultQualityProfile, computeQualityProfile, downgradeQuality } from "../../src/performance/qualityController";
import { createFrameHealthMonitor } from "../../src/performance/frameHealthMonitor";
import { createSearchService, type SearchAdapter } from "../../src/search/searchService";
import { createSoundscape } from "../../src/sound/soundscape";
import { createTourController } from "../../src/tour/tourController";
import { createMyEarthViewer, destroyMyEarthViewer } from "../../src/cesium/viewerLifecycle";

function createViewer() {
  return {
    camera: {
      flyTo: vi.fn(),
      setView: vi.fn(),
      rotateRight: vi.fn()
    },
    scene: {
      globe: {},
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
  it("flies to wonder and city presets and pauses on manual interaction", async () => {
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const viewer = createViewer();
    const onBuildingsOpportunity = vi.fn();
    const onModeChange = vi.fn();
    const controller = createCameraController({
      viewer,
      reducedMotion: false,
      onBuildingsOpportunity,
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

    await controller.execute({
      type: "flyToLocation",
      locationId: "tokyo",
      source: "city"
    });
    expect(onBuildingsOpportunity).toHaveBeenCalledWith("tokyo");

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
});

describe("layer adapters", () => {
  it("toggles clouds and aurora without network sources and respects low quality", async () => {
    const viewer = createViewer();
    const lowQuality = computeQualityProfile("low");
    const context = {
      viewer,
      quality: lowQuality,
      reducedMotion: true
    };

    await expect(
      createProceduralCloudLayerAdapter().setVisible(context, true)
    ).resolves.toMatchObject({ status: "disabled" });
    await expect(
      createAuroraLayerAdapter().setVisible(context, true)
    ).resolves.toMatchObject({ status: "disabled" });
  });

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
          id: "clouds",
          setVisible: vi.fn().mockResolvedValue({ status: "available" })
        }
      ]
    });

    await controller.setLayerVisibility("clouds", true);
    expect(onAvailabilityChange).toHaveBeenCalledWith("clouds", {
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
    const AudioCtor = vi.fn().mockImplementation(() => ({
      createGain: () => ({
        gain: { value: 0 },
        connect: vi.fn()
      }),
      createOscillator: () => ({
        type: "sine",
        frequency: { value: 0 },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn()
      }),
      destination: {},
      resume: vi.fn().mockResolvedValue(undefined),
      suspend: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined)
    }));
    const soundscape = createSoundscape(
      (state) => states.push(state),
      AudioCtor as unknown as typeof AudioContext
    );

    soundscape.prompt();
    expect(AudioCtor).not.toHaveBeenCalled();

    await expect(soundscape.enable()).resolves.toMatchObject({
      status: "enabled"
    });
    expect(AudioCtor).toHaveBeenCalledTimes(1);
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
