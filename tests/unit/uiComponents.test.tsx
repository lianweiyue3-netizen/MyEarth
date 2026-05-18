import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LayerTogglePanel } from "../../src/ui/LayerTogglePanel";
import { LearningPanel } from "../../src/ui/LearningPanel";
import { LocationList } from "../../src/ui/LocationList";
import { SearchControl } from "../../src/ui/SearchControl";
import { VisualModeSelector } from "../../src/ui/VisualModeSelector";
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

  it("changes visual mode through the segmented tabs", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<VisualModeSelector value="satellite" onChange={onChange} />);
    await user.click(screen.getByRole("tab", { name: "Night" }));

    expect(onChange).toHaveBeenCalledWith("nightLights");
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
});
