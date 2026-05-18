# Camera Controller Tasks

## Purpose

Centralize intro orbit, idle orbit, fly-to behavior, reset view, search destinations, tour movement, and reduced-motion camera behavior.

## Dependencies

- [ ] Viewer lifecycle module can provide a Cesium viewer.
- [ ] Camera presets are defined.
- [ ] Location content lookup is available.
- [ ] Accessibility reduced-motion helper is available.

## Implementation Checklist

- [ ] Create `src/camera/cameraTypes.ts`.
- [ ] Create `src/camera/cameraController.ts`.
- [ ] Define `CameraCommand` union.
- [ ] Define `CameraController` interface.
- [ ] Implement camera mode state machine.
- [ ] Implement `startIntroOrbit` command.
- [ ] Implement `startIdleOrbit` command.
- [ ] Implement `pauseOrbit` command.
- [ ] Implement wonder `flyToLocation` command.
- [ ] Implement city `flyToLocation` command.
- [ ] Implement search `flyToCoordinates` command.
- [ ] Implement `resetView` command.
- [ ] Implement `notifyManualInteraction`.
- [ ] Stop orbit loop during manual interaction.
- [ ] Apply reduced-motion transition scaling.
- [ ] Remove decorative roll when reduced motion is active.
- [ ] Dispose orbit animation loop on controller disposal.

## Tests

- [ ] Add Vitest coverage for allowed state transitions.
- [ ] Add Vitest coverage for manual interaction pausing orbit.
- [ ] Add Vitest coverage for reset preset usage.
- [ ] Add Vitest coverage for wonder preset usage.
- [ ] Add Vitest coverage for city preset usage.
- [ ] Add Vitest coverage for reduced-motion duration scaling.
- [ ] Add Vitest coverage for unknown location failure.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
