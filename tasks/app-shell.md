# App Shell Tasks

## Purpose

Initialize configuration, preferences, reduced motion, quality, Cesium scene, loading states, fallback states, and the command overlay.

## Dependencies

- [ ] Configuration module is available.
- [ ] Jotai app state atoms are available.
- [ ] Persistence module interface is available.
- [ ] Error fallback component exists or is stubbed.

## Implementation Checklist

- [ ] Create `src/app/App.tsx`.
- [ ] Create `src/app/AppErrorBoundary.tsx`.
- [ ] Read app config on app startup.
- [ ] Load user preferences before rendering interactive controls.
- [ ] Initialize reduced-motion state from accessibility helper.
- [ ] Compute initial quality profile.
- [ ] Render `GlobeLoadingScreen` while loading phase is not ready.
- [ ] Mount `CesiumScene` with config, state, and callbacks.
- [ ] Wire `onViewerReady` to update loading phase.
- [ ] Wire `onFirstFrame` to update loading phase to ready.
- [ ] Dispatch intro orbit after first frame when reduced motion is false.
- [ ] Render `CommandOverlay` after first frame.
- [ ] Make sound prompt eligible only after user interaction.
- [ ] Route fatal app errors to `ErrorFallback`.
- [ ] Route recoverable optional errors to overlay status.

## Tests

- [ ] Add React Testing Library test for loading screen before first frame.
- [ ] Add React Testing Library test for overlay after first frame.
- [ ] Add test for missing-token fallback path.
- [ ] Add test for persisted quality and visual mode application.
- [ ] Add test that controller setup is not repeated across ordinary state updates.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
