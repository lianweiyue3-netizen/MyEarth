# Configuration Tasks

## Purpose

Parse Vite environment variables into a typed, client-safe `AppConfig` without exposing token values.

## Dependencies

- [x] Project scaffold with React, TypeScript, and Vite exists.
- [x] Shared domain type location is chosen for `AppConfig` imports.

## Implementation Checklist

- [x] Create `src/config/env.ts`.
- [x] Create `src/config/constants.ts`.
- [x] Define `AppConfig` with optional `cesiumIonToken`, `appEnv`, and telemetry config.
- [x] Implement `readAppConfig(env: ImportMetaEnv): AppConfig`.
- [x] Read `VITE_CESIUM_ION_TOKEN` without throwing when absent.
- [x] Parse `VITE_APP_ENV` as `development`, `preview`, or `production`.
- [x] Fall back unsupported `VITE_APP_ENV` values to `development`.
- [x] Parse `VITE_TELEMETRY_ENABLED` as enabled only when exactly `true`.
- [x] Ignore `VITE_TELEMETRY_ENDPOINT` unless telemetry is enabled.
- [x] Add constants for RainViewer metadata URL and Cesium token env key.
- [x] Ensure config code never logs or returns token values in error messages.

## Tests

- [x] Add Vitest coverage for valid token parsing.
- [x] Add Vitest coverage for missing token behavior.
- [x] Add Vitest coverage for telemetry disabled by default.
- [x] Add Vitest coverage for invalid app env fallback.
- [x] Add Vitest coverage proving thrown or returned public errors exclude token values.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
