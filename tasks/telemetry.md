# Telemetry Tasks

## Purpose

Provide a typed no-op telemetry adapter by default, with anonymous category-only events if explicitly configured.

## Dependencies

- [x] Configuration module is available.
- [x] Shared `LayerId` type is available.

## Implementation Checklist

- [x] Create `src/telemetry/telemetryTypes.ts`.
- [x] Create `src/telemetry/telemetry.ts`.
- [x] Define `TelemetryEvent`.
- [x] Define `TelemetryClient`.
- [x] Implement default no-op telemetry client.
- [x] Implement optional endpoint-backed telemetry client.
- [x] Enable endpoint-backed telemetry only when config explicitly enables it.
- [x] Send only typed event categories and buckets.
- [x] Add `app_load_timing` event type.
- [x] Add `cesium_init_failure` event type.
- [x] Add `layer_load_failure` event type.
- [x] Add `runtime_error` event type.
- [x] Add `frame_health` event type.
- [x] Add `browser_capability` event type.
- [x] Exclude search query text from event API.
- [x] Exclude precise location from event API.
- [x] Exclude names, emails, and account identifiers from event API.
- [x] Exclude stack traces from event payloads.
- [x] Swallow telemetry network failures.

## Tests

- [x] Add Vitest coverage that default client is no-op.
- [x] Add Vitest coverage that disabled telemetry sends nothing.
- [x] Add Vitest coverage that enabled telemetry sends typed events.
- [x] Add Vitest coverage that network failure is swallowed.
- [x] Add type coverage that disallowed fields cannot be sent.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
