# Tour Tasks

## Purpose

Sequence the eight required natural wonders and coordinate selected location, camera commands, and learning panel updates.

## Dependencies

- [x] Location content ordered wonder list is available.
- [x] Camera command types are available.
- [x] Jotai tour state atom is available.

## Implementation Checklist

- [x] Create `src/tour/tourTypes.ts`.
- [x] Create `src/tour/tourController.ts`.
- [x] Define `TourState`.
- [x] Define `TourController`.
- [x] Build tour list from exactly the eight required wonders.
- [x] Implement `start`.
- [x] Implement `pause`.
- [x] Implement `resume`.
- [x] Implement `next`.
- [x] Implement `previous`.
- [x] Implement `stop`.
- [x] Select Mount Everest as first tour item.
- [x] Emit selected location update on tour item change.
- [x] Emit camera command on tour item change.
- [x] Keep cities out of primary tour.
- [x] Pause tour on manual camera interaction.
- [x] Preserve selected location when stopping tour.

## Tests

- [x] Add Vitest coverage that tour includes exactly eight wonders.
- [x] Add Vitest coverage that cities are excluded.
- [x] Add Vitest coverage that start selects Mount Everest.
- [x] Add Vitest coverage for next behavior.
- [x] Add Vitest coverage for previous behavior.
- [x] Add Vitest coverage that manual interaction pauses tour.
- [x] Add Vitest coverage that camera failure pauses tour.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
