# Camera Controller Tasks

## Purpose

Centralize intro orbit, idle orbit, fly-to behavior, reset view, search destinations, tour movement, and reduced-motion camera behavior.

## Dependencies

- [x] Viewer lifecycle module can provide a Cesium viewer.
- [x] Camera presets are defined.
- [x] Location content lookup is available.
- [x] Accessibility reduced-motion helper is available.

## Implementation Checklist

- [x] Create `src/camera/cameraTypes.ts`.
- [x] Create `src/camera/cameraController.ts`.
- [x] Define `CameraCommand` union.
- [x] Define `CameraController` interface.
- [x] Implement camera mode state machine.
- [x] Implement `startIntroOrbit` command.
- [x] Implement `startIdleOrbit` command.
- [x] Implement `pauseOrbit` command.
- [x] Implement wonder `flyToLocation` command.
- [x] Implement city `flyToLocation` command.
- [x] Implement search `flyToCoordinates` command.
- [x] Implement `resetView` command.
- [x] Implement `notifyManualInteraction`.
- [x] Stop orbit loop during manual interaction.
- [x] Apply reduced-motion transition scaling.
- [x] Remove decorative roll when reduced motion is active.
- [x] Dispose orbit animation loop on controller disposal.

## Tests

- [x] Add Vitest coverage for allowed state transitions.
- [x] Add Vitest coverage for manual interaction pausing orbit.
- [x] Add Vitest coverage for reset preset usage.
- [x] Add Vitest coverage for wonder preset usage.
- [x] Add Vitest coverage for city preset usage.
- [x] Add Vitest coverage for reduced-motion duration scaling.
- [x] Add Vitest coverage for unknown location failure.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
