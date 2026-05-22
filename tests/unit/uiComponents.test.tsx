import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LayerTogglePanel } from "../../src/ui/LayerTogglePanel";
import { LearningPanel } from "../../src/ui/LearningPanel";
import { LocationList } from "../../src/ui/LocationList";
import { NewsPanel } from "../../src/ui/NewsPanel";
import { SearchControl } from "../../src/ui/SearchControl";
import { AttributionBar } from "../../src/ui/AttributionBar";
import { CommandOverlay } from "../../src/ui/CommandOverlay";
import { ErrorFallback } from "../../src/ui/ErrorFallback";
import { FocusLocationReadout } from "../../src/ui/FocusLocationReadout";
import { RadarStatusPanel } from "../../src/ui/RadarStatusPanel";
import { defaultLayerAvailability, defaultLayerVisibility } from "../../src/app/appAtoms";
import type { SearchService } from "../../src/search/searchService";
import { DistanceMeasurePanel } from "../../src/ui/DistanceMeasurePanel";
import type { NewsState } from "../../src/news/newsTypes";

const readyNewsState: NewsState = {
  status: "ready",
  snapshot: {
    provider: "GNews",
    category: "general",
    language: "en",
    lastUpdated: "2026-05-21T00:00:00.000Z",
    countries: {
      us: {
        countryCode: "us",
        countryName: "United States",
        headlineCount: 1,
        articles: [
          {
            id: "us-0-test",
            title: "Market update",
            summary: "Provider supplied summary.",
            url: "https://example.com/story",
            imageUrl: "https://example.com/image.jpg",
            sourceName: "Example News",
            publishedAt: "2026-05-21T01:30:00.000Z"
          }
        ]
      },
      jp: {
        countryCode: "jp",
        countryName: "Japan",
        headlineCount: 0,
        articles: []
      }
    }
  }
};

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

    expect(screen.queryByRole("button", { name: "Clouds" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Aurora" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Atmosphere" }));
    expect(onToggle).toHaveBeenCalledWith("atmosphere", false);
    expect(screen.getByText(/RainViewer offline/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "3D Buildings" })).not.toBeInTheDocument();
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

  it("renders the News layer toggle disabled until headlines are available", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onSoundToggle = vi.fn();

    const { rerender } = render(
      <LayerTogglePanel
        layers={defaultLayerVisibility}
        availability={defaultLayerAvailability}
        onToggle={onToggle}
        onSoundToggle={onSoundToggle}
      />
    );

    expect(screen.getByRole("button", { name: "News" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(screen.getByRole("button", { name: "News" })).toBeDisabled();
    expect(screen.getByText(/News headlines have not loaded/)).toBeInTheDocument();

    rerender(
      <LayerTogglePanel
        layers={defaultLayerVisibility}
        availability={{
          ...defaultLayerAvailability,
          newsHeatmap: { status: "available" }
        }}
        onToggle={onToggle}
        onSoundToggle={onSoundToggle}
      />
    );

    await user.click(screen.getByRole("button", { name: "News" }));
    expect(onToggle).toHaveBeenCalledWith("newsHeatmap", true);
    expect(onSoundToggle).not.toHaveBeenCalled();
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
        layers={{ ...defaultLayerVisibility, atmosphere: false }}
        onLayerRequest={onLayer}
      />
    );

    expect(screen.getByRole("heading", { name: "Aurora Region" })).toBeInTheDocument();
    expect(screen.getByText(/space-weather events/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Enable aurora" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Enable atmosphere" }));
    expect(onLayer).toHaveBeenCalledWith("atmosphere");
  });

  it("marks suggested layers that are already enabled", () => {
    render(
      <LearningPanel
        selectedLocationId="tokyo"
        layers={{ ...defaultLayerVisibility, labels: true }}
        onLayerRequest={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: "Enabled labels" })
    ).toBeDisabled();
  });

  it("renders attribution for active services", () => {
    render(
      <AttributionBar
        layers={{
          ...defaultLayerVisibility,
          weatherRadar: true
        }}
        visualMode="nightLights"
      />
    );

    expect(screen.queryByText(/OpenStreetMap/)).not.toBeInTheDocument();
    expect(screen.getByText("RainViewer")).toBeInTheDocument();
    expect(screen.getByText("NASA Black Marble")).toBeInTheDocument();
  });

  it("shows GNews attribution only for active ready news", () => {
    const { rerender } = render(
      <AttributionBar
        layers={{ ...defaultLayerVisibility, newsHeatmap: true }}
        visualMode="satellite"
        newsActive
      />
    );

    expect(screen.getByText("GNews")).toBeInTheDocument();

    rerender(
      <AttributionBar
        layers={{ ...defaultLayerVisibility, newsHeatmap: false }}
        visualMode="satellite"
      />
    );

    expect(screen.queryByText("GNews")).not.toBeInTheDocument();
  });

  it("renders news loading, unavailable, and selected country headlines", async () => {
    const user = userEvent.setup();
    const onLayerToggle = vi.fn();
    const onSelectCountry = vi.fn();

    const { rerender, container } = render(
      <NewsPanel
        state={{ status: "loading" }}
        layerEnabled={false}
        onLayerToggle={onLayerToggle}
        onSelectCountry={onSelectCountry}
        onClearCountry={vi.fn()}
      />
    );

    expect(screen.getByText("Loading country headlines.")).toBeInTheDocument();

    rerender(
      <NewsPanel
        state={{
          status: "unavailable",
          reason: "missing-api-key",
          message: "News needs GNEWS_API_KEY on the server."
        }}
        layerEnabled={false}
        onLayerToggle={onLayerToggle}
        onSelectCountry={onSelectCountry}
        onClearCountry={vi.fn()}
      />
    );
    expect(screen.getByText("News needs GNEWS_API_KEY on the server.")).toBeInTheDocument();

    rerender(
      <NewsPanel
        state={readyNewsState}
        layerEnabled={false}
        onLayerToggle={onLayerToggle}
        onSelectCountry={onSelectCountry}
        onClearCountry={vi.fn()}
      />
    );
    expect(screen.getByText(/Last updated/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /United States/ }));
    expect(onSelectCountry).toHaveBeenCalledWith("us");
    await user.click(screen.getByRole("button", { name: "Show Map" }));
    expect(onLayerToggle).toHaveBeenCalledWith(true);

    rerender(
      <NewsPanel
        state={{ ...readyNewsState, selectedCountryCode: "us" }}
        layerEnabled
        onLayerToggle={onLayerToggle}
        onSelectCountry={onSelectCountry}
        onClearCountry={vi.fn()}
      />
    );
    expect(screen.getByRole("heading", { name: "United States" })).toBeInTheDocument();
    expect(screen.getByText("Market update")).toBeInTheDocument();
    expect(screen.getByText("Provider supplied summary.")).toBeInTheDocument();
    expect(screen.getByText(/Example News/)).toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://example.com/image.jpg"
    );
    const link = screen.getByRole("link", { name: /Read article: Market update/ });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
    const videoLink = screen.getByRole("link", {
      name: /Find related YouTube video: Market update/
    });
    expect(videoLink.getAttribute("href")).toContain("youtube.com");
    expect(videoLink).toHaveAttribute("target", "_blank");
    const onClearCountry = vi.fn();
    rerender(
      <NewsPanel
        state={{ ...readyNewsState, selectedCountryCode: "us" }}
        layerEnabled
        onLayerToggle={onLayerToggle}
        onSelectCountry={onSelectCountry}
        onClearCountry={onClearCountry}
      />
    );
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(onClearCountry).toHaveBeenCalledOnce();
  });

  it("renders empty selected country news state", () => {
    render(
      <NewsPanel
        state={{ ...readyNewsState, selectedCountryCode: "jp" }}
        layerEnabled={false}
        onLayerToggle={vi.fn()}
        onSelectCountry={vi.fn()}
        onClearCountry={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: "Japan" })).toBeInTheDocument();
    expect(
      screen.getByText("No current headlines are available for this country.")
    ).toBeInTheDocument();
  });

  it("shows active radar status and intensity legend", () => {
    render(<RadarStatusPanel />);

    expect(screen.getByTestId("radar-status")).toBeInTheDocument();
    expect(screen.getByText("Radar active")).toBeInTheDocument();
    expect(screen.getByText("Recent RainViewer precipitation")).toBeInTheDocument();
    expect(screen.getByLabelText("Radar intensity")).toHaveTextContent(
      "LightMediumHeavy"
    );
  });

  it("starts and clears distance measurement", async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    const onClear = vi.fn();

    render(
      <DistanceMeasurePanel
        measurement={{
          active: true,
          points: [
            { latitude: 0, longitude: 0 },
            { latitude: 0, longitude: 1 }
          ],
          distanceMeters: 111_195
        }}
        onStart={onStart}
        onClear={onClear}
      />
    );

    expect(screen.getByText("111.2 km")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Measure" }));
    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(onStart).toHaveBeenCalledOnce();
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("renders street and state for a focused map point", () => {
    render(
      <FocusLocationReadout
        location={{
          status: "ready",
          point: {
            latitude: 40.758,
            longitude: -73.9855,
            cameraHeightMeters: 3200
          },
          streetName: "7th Avenue",
          localityName: "New York",
          stateName: "New York",
          countryName: "United States",
          displayName: "7th Avenue, New York, United States",
          source: "OpenStreetMap"
        }}
      />
    );

    expect(screen.getByText("7th Avenue")).toBeInTheDocument();
    expect(screen.getByText("New York, United States")).toBeInTheDocument();
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
        layers={defaultLayerVisibility}
        layerAvailability={defaultLayerAvailability}
        onLayerToggle={vi.fn()}
        selectedLocationId="mount-everest"
        onSelectLocation={vi.fn()}
        searchService={service}
        onSearchSelect={vi.fn()}
        soundState={{ status: "notPrompted" }}
        onSoundEnable={vi.fn()}
        onSoundDisable={vi.fn()}
        onSoundVolume={vi.fn()}
        onSoundToggle={vi.fn()}
        distanceMeasurement={{ active: false, points: [] }}
        onMeasureStart={vi.fn()}
        onMeasureClear={vi.fn()}
        onReset={onReset}
      />
    );

    expect(screen.getByRole("heading", { name: "MyEarth" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Satellite" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Night" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clean" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Tour idle/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Distance/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Measure" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Quality:/)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Mount Everest" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Places/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Search/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^News/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Layers/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mount Everest" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Search Earth")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Atmosphere" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Places/ }));
    expect(screen.getByRole("button", { name: "Mount Everest" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Search/ }));
    expect(screen.getByLabelText("Search Earth")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^News/ }));
    expect(screen.getByTestId("news-panel")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Layers/ }));
    expect(screen.getByRole("button", { name: "Atmosphere" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Radar" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Distance/ }));
    expect(screen.getByRole("button", { name: "Measure" })).toBeInTheDocument();
    expect(screen.queryByTestId("radar-status")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reset View" }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});
