# Error Fallback Tasks

## Purpose

Provide safe user-facing fallback states for fatal and recoverable failures without exposing secrets or raw stack traces.

## Dependencies

- [ ] Shared `AppError` type is available.
- [ ] Accessibility live region helper is available.
- [ ] CSS Modules setup is available.

## Implementation Checklist

- [ ] Create `src/ui/ErrorFallback.tsx`.
- [ ] Create `src/ui/ErrorFallback.module.css`.
- [ ] Render fatal WebGL unavailable fallback.
- [ ] Render fatal Cesium initialization fallback.
- [ ] Render missing Cesium token setup guidance.
- [ ] Mention `VITE_CESIUM_ION_TOKEN` in missing-token guidance.
- [ ] Avoid showing token values.
- [ ] Avoid showing raw stack traces.
- [ ] Render recoverable optional layer status pattern.
- [ ] Render recoverable search failure status pattern.
- [ ] Render recoverable sound unavailable status pattern.
- [ ] Announce fatal errors through live region.
- [ ] Announce recoverable errors through live region.
- [ ] Provide retry action for recoverable layer errors where available.

## Tests

- [ ] Add React Testing Library coverage for WebGL fallback.
- [ ] Add React Testing Library coverage for Cesium init fallback.
- [ ] Add React Testing Library coverage for missing-token message.
- [ ] Add React Testing Library coverage that token values are not rendered.
- [ ] Add React Testing Library coverage for recoverable weather failure.
- [ ] Add React Testing Library coverage for live-region announcement.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
