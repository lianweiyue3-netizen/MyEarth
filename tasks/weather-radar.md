# Weather Radar Tasks

## Purpose

Wrap RainViewer metadata fetching, caching, tile URL construction, and Cesium radar imagery creation.

## Dependencies

- [ ] Configuration constants include RainViewer metadata URL.
- [ ] Layer adapter interface is available.
- [ ] Attribution module interface is available.
- [ ] Quality profile type is available.

## Implementation Checklist

- [ ] Create `src/layers/weatherRadarLayer.ts`.
- [ ] Define `RadarFrame`.
- [ ] Define `RadarMetadata`.
- [ ] Define `WeatherRadarService`.
- [ ] Implement metadata fetch from `https://api.rainviewer.com/public/weather-maps.json`.
- [ ] Support `AbortSignal` for metadata fetch.
- [ ] Parse `host` from RainViewer metadata.
- [ ] Parse `radar.past` frames from RainViewer metadata.
- [ ] Select latest available radar frame.
- [ ] Cache successful metadata for 10 minutes.
- [ ] Treat empty frame list as unavailable.
- [ ] Build tile URL from returned `host` and frame `path`.
- [ ] Create Cesium `UrlTemplateImageryProvider`.
- [ ] Set maximum zoom level to 7.
- [ ] Use tile size 512 by default.
- [ ] Use tile size 256 in low quality.
- [ ] Apply opacity based on visual mode and quality profile.
- [ ] Add RainViewer attribution when radar is active.
- [ ] Hide radar layer on network failure.
- [ ] Report invalid metadata as recoverable failed availability.

## Tests

- [ ] Add Vitest coverage for valid metadata parsing.
- [ ] Add Vitest coverage for invalid metadata rejection.
- [ ] Add Vitest coverage for latest frame selection.
- [ ] Add Vitest coverage for URL template construction.
- [ ] Add Vitest coverage for maximum zoom level 7.
- [ ] Add Vitest coverage for 10-minute cache behavior.
- [ ] Add Vitest coverage for non-blocking network failure.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
