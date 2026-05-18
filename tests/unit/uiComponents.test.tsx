import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LayerTogglePanel } from "../../src/ui/LayerTogglePanel";
import { LearningPanel } from "../../src/ui/LearningPanel";
import { LocationList } from "../../src/ui/LocationList";
import { SearchControl } from "../../src/ui/SearchControl";
import { VisualModeSelector } from "../../src/ui/VisualModeSelector";
import { AttributionBar } from "../../src/ui/AttributionBar";
import { CommandOverlay } from "../../src/ui/CommandOverlay";
import { ErrorFallback } from "../../src/ui/ErrorFallback";
import { defaultLayerAvailability, defaultLayerVisibility } from "../../src/app/appAtoms";
import type { SearchService } from "../../src/search/searchService";

describe("UI components", () => {
  it("supports keyboard search selection with a mocked service", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const service: SearchService = {
      isEnabled: () => true,
      search: vi.fn().mockResolvedValue([
        {
          id: "tokyo",
          label: "Tokyo, Japan",
          latitude: 35.6762,
          longitude: 139.6503
        }
      ])
    };

    render(<SearchControl service={service} onSelectResult={onSelect} />);
    await user.type(screen.getByLabelText("Search Earth"), "tokyo");
    await screen.findByRole("option", { name: "Tokyo, Japan" });
    await user.keyboard("{Enter}");

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ label: "Tokyo, Japan" })
    );
    expect(service.search).toHaveBeenCalledTimes(1);
  });

  it("announces search failure and closes results with Escape", async () => {
    const user = userEvent.setup();
    const service: SearchService = {
      isEnabled: () => true,
      search: vi.fn().mockRejectedValue(new Error("offline"))
    };

    render(<SearchControl service={service} onSelectResult={vi.fn()} />);
    await user.type(screen.getByLabelText("Search Earth"), "nowhere");

    expect(
      (await screen.findAllByText("Search failed. Try another place name.")).length
    ).toBeGreaterThan(0);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("changes visual mode through the segmented tabs", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<VisualModeSelector value="satellite" onChange={onChange} />);
    await user.click(screen.getByRole("tab", { name: "Night" }));

    expect(onChange).toHaveBeenCalledWith("nightLights");
  });

  it("supports visual mode keyboard navigation", async () => {
    const onChange = vi.fn();

    render(<VisualModeSelector value="satellite" onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("tablist", { name: "Visual mode" }), {
      key: "ArrowRight"
    });

    expect(onChange).toHaveBeenCalledWith("political");
  });

  it("emits layer ids and displays disabled reasons", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <LayerTogglePanel
        layers={defaultLayerVisibility}
        availability={{
          ...defaultLayerAvailability,
          weatherRadar: { status: "failed", reason: "RainViewer offline", recoverable: true }
        }}
        onToggle={onToggle}
        onSoundToggle={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Clouds" }));
    expect(onToggle).toHaveBeenCalledWith("clouds", false);
    expect(screen.getByText(/RainViewer offline/)).toBeInTheDocument();
  });

  it("routes sound toggle separately from Cesium layer toggles", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onSoundToggle = vi.fn();

    render(
      <LayerTogglePanel
        layers={defaultLayerVisibility}
        availability={defaultLayerAvailability}
        onToggle={onToggle}
        onSoundToggle={onSoundToggle}
      />
    );

    await user.click(screen.getByRole("button", { name: "Sound" }));
    expect(onSoundToggle).toHaveBeenCalledOnce();
    expect(onToggle).not.toHaveBeenCalledWith("sound", expect.any(Boolean));
  });

  it("renders wonders before city shortcuts", () => {
    render(
      <LocationList
        selectedLocationId="mount-everest"
        onSelectLocation={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Mount Everest" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Singapore" })).toBeInTheDocument();
  });

  it("renders learning content and suggested layer actions", async () => {
    const user = userEvent.setup();
    const onLayer = vi.fn();

    render(
      <LearningPanel
        selectedLocationId="aurora-region"
        onLayerRequest={onLayer}
      />
    );

    expect(screen.getByRole("heading", { name: "Aurora Region" })).toBeInTheDocument();
    expect(screen.getByText(/not a live space-weather forecast/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Enable aurora" }));
    expect(onLayer).toHaveBeenCalledWith("aurora");
  });

  it("renders attribution for active services", () => {
    render(
      <AttributionBar
        layers={{
          ...defaultLayerVisibility,
          buildings: true,
          weatherRadar: true
        }}
        visualMode="nightLights"
      />
    );

    expect(screen.getByText(/OpenStreetMap/)).toBeInTheDocument();
    expect(screen.getByText("RainViewer")).toBeInTheDocument();
    expect(screen.getByText("NASA Black Marble")).toBeInTheDocument();
  });

  it("renders safe missing-token fallback messaging", () => {
    render(
      <ErrorFallback
        error={{
          code: "missing-cesium-token",
          severity: "info",
          publicMessage: "Missing token",
          recoverable: true
        }}
      />
    );

    expect(screen.getByText(/VITE_CESIUM_ION_TOKEN/)).toBeInTheDocument();
    expect(screen.queryByText("secret-token")).not.toBeInTheDocument();
  });

  it("composes command overlay controls and emits reset", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const service: SearchService = {
      isEnabled: () => false,
      search: vi.fn()
    };

    render(
      <CommandOverlay
        ready
        visualMode="satellite"
        onVisualModeChange={vi.fn()}
        layers={defaultLayerVisibility}
        layerAvailability={defaultLayerAvailability}
        onLayerToggle={vi.fn()}
        selectedLocationId="mount-everest"
        onSelectLocation={vi.fn()}
        searchService={service}
        onSearchSelect={vi.fn()}
        tourState={{ status: "idle", currentIndex: 0 }}
        onTourStart={vi.fn()}
        onTourPause={vi.fn()}
        onTourNext={vi.fn()}
        onTourPrevious={vi.fn()}
        soundState={{ status: "notPrompted" }}
        onSoundEnable={vi.fn()}
        onSoundDisable={vi.fn()}
        onSoundVolume={vi.fn()}
        onSoundToggle={vi.fn()}
        qualityProfile={{
          mode: "auto",
          effectiveTier: "balanced",
          starDensity: "medium",
          cinematicGlow: "reduced",
          clouds: "simple",
          aurora: "simple",
          radar: "reducedOpacity",
          buildings: "off",
          terrainDetail: "normal",
          transitionScale: 1
        }}
        onReset={onReset}
      />
    );

    expect(screen.getByRole("heading", { name: "MyEarth" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reset View" }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});
