# Error Fallback Tasks

## Purpose

Provide safe user-facing fallback states for fatal and recoverable failures without exposing secrets or raw stack traces.

## Dependencies

- [x] Shared `AppError` type is available.
- [x] Accessibility live region helper is available.
- [x] CSS Modules setup is available.

## Implementation Checklist

- [x] Create `src/ui/ErrorFallback.tsx`.
- [x] Create `src/ui/ErrorFallback.module.css`.
- [x] Render fatal WebGL unavailable fallback.
- [x] Render fatal Cesium initialization fallback.
- [x] Render missing Cesium token setup guidance.
- [x] Mention `VITE_CESIUM_ION_TOKEN` in missing-token guidance.
- [x] Avoid showing token values.
- [x] Avoid showing raw stack traces.
- [x] Render recoverable optional layer status pattern.
- [x] Render recoverable search failure status pattern.
- [x] Render recoverable sound unavailable status pattern.
- [x] Announce fatal errors through live region.
- [x] Announce recoverable errors through live region.
- [x] Provide retry action for recoverable layer errors where available.

## Tests

- [x] Add React Testing Library coverage for WebGL fallback.
- [x] Add React Testing Library coverage for Cesium init fallback.
- [x] Add React Testing Library coverage for missing-token message.
- [x] Add React Testing Library coverage that token values are not rendered.
- [x] Add React Testing Library coverage for recoverable weather failure.
- [x] Add React Testing Library coverage for live-region announcement.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
