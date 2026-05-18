# App Shell Tasks

## Purpose

Initialize configuration, preferences, reduced motion, quality, Cesium scene, loading states, fallback states, and the command overlay.

## Dependencies

- [x] Configuration module is available.
- [x] Jotai app state atoms are available.
- [x] Persistence module interface is available.
- [x] Error fallback component exists or is stubbed.

## Implementation Checklist

- [x] Create `src/app/App.tsx`.
- [x] Create `src/app/AppErrorBoundary.tsx`.
- [x] Read app config on app startup.
- [x] Load user preferences before rendering interactive controls.
- [x] Initialize reduced-motion state from accessibility helper.
- [x] Compute initial quality profile.
- [x] Render `GlobeLoadingScreen` while loading phase is not ready.
- [x] Mount `CesiumScene` with config, state, and callbacks.
- [x] Wire `onViewerReady` to update loading phase.
- [x] Wire `onFirstFrame` to update loading phase to ready.
- [x] Dispatch intro orbit after first frame when reduced motion is false.
- [x] Render `CommandOverlay` after first frame.
- [x] Make sound prompt eligible only after user interaction.
- [x] Route fatal app errors to `ErrorFallback`.
- [x] Route recoverable optional errors to overlay status.

## Tests

- [x] Add React Testing Library test for loading screen before first frame.
- [x] Add React Testing Library test for overlay after first frame.
- [x] Add test for missing-token fallback path.
- [x] Add test for persisted quality and visual mode application.
- [x] Add test that controller setup is not repeated across ordinary state updates.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
