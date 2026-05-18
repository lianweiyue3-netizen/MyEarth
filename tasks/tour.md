# Tour Tasks

## Purpose

Sequence the eight required natural wonders and coordinate selected location, camera commands, and learning panel updates.

## Dependencies

- [ ] Location content ordered wonder list is available.
- [ ] Camera command types are available.
- [ ] Jotai tour state atom is available.

## Implementation Checklist

- [ ] Create `src/tour/tourTypes.ts`.
- [ ] Create `src/tour/tourController.ts`.
- [ ] Define `TourState`.
- [ ] Define `TourController`.
- [ ] Build tour list from exactly the eight required wonders.
- [ ] Implement `start`.
- [ ] Implement `pause`.
- [ ] Implement `resume`.
- [ ] Implement `next`.
- [ ] Implement `previous`.
- [ ] Implement `stop`.
- [ ] Select Mount Everest as first tour item.
- [ ] Emit selected location update on tour item change.
- [ ] Emit camera command on tour item change.
- [ ] Keep cities out of primary tour.
- [ ] Pause tour on manual camera interaction.
- [ ] Preserve selected location when stopping tour.

## Tests

- [ ] Add Vitest coverage that tour includes exactly eight wonders.
- [ ] Add Vitest coverage that cities are excluded.
- [ ] Add Vitest coverage that start selects Mount Everest.
- [ ] Add Vitest coverage for next behavior.
- [ ] Add Vitest coverage for previous behavior.
- [ ] Add Vitest coverage that manual interaction pauses tour.
- [ ] Add Vitest coverage that camera failure pauses tour.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
