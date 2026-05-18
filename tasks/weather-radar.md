# Weather Radar Tasks

## Purpose

Wrap RainViewer metadata fetching, caching, tile URL construction, and Cesium radar imagery creation.

## Dependencies

- [x] Configuration constants include RainViewer metadata URL.
- [x] Layer adapter interface is available.
- [x] Attribution module interface is available.
- [x] Quality profile type is available.

## Implementation Checklist

- [x] Create `src/layers/weatherRadarLayer.ts`.
- [x] Define `RadarFrame`.
- [x] Define `RadarMetadata`.
- [x] Define `WeatherRadarService`.
- [x] Implement metadata fetch from `https://api.rainviewer.com/public/weather-maps.json`.
- [x] Support `AbortSignal` for metadata fetch.
- [x] Parse `host` from RainViewer metadata.
- [x] Parse `radar.past` frames from RainViewer metadata.
- [x] Select latest available radar frame.
- [x] Cache successful metadata for 10 minutes.
- [x] Treat empty frame list as unavailable.
- [x] Build tile URL from returned `host` and frame `path`.
- [x] Create Cesium `UrlTemplateImageryProvider`.
- [x] Set maximum zoom level to 7.
- [x] Use tile size 512 by default.
- [x] Use tile size 256 in low quality.
- [x] Apply opacity based on visual mode and quality profile.
- [x] Add RainViewer attribution when radar is active.
- [x] Hide radar layer on network failure.
- [x] Report invalid metadata as recoverable failed availability.

## Tests

- [x] Add Vitest coverage for valid metadata parsing.
- [x] Add Vitest coverage for invalid metadata rejection.
- [x] Add Vitest coverage for latest frame selection.
- [x] Add Vitest coverage for URL template construction.
- [x] Add Vitest coverage for maximum zoom level 7.
- [x] Add Vitest coverage for 10-minute cache behavior.
- [x] Add Vitest coverage for non-blocking network failure.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
