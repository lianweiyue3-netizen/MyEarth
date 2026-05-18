# Sound Tasks

## Purpose

Own Web Audio consent, generated soundscape playback, visible controls, volume, local preference, and unavailable-browser behavior.

## Dependencies

- [x] Persistence module interface is available.
- [x] Jotai sound state atom is available.
- [x] Accessibility reduced-motion state is available.

## Implementation Checklist

- [x] Create `src/sound/soundTypes.ts`.
- [x] Create `src/sound/soundscape.ts`.
- [x] Define `SoundState`.
- [x] Define `Soundscape`.
- [x] Implement `prompt`.
- [x] Implement `enable`.
- [x] Implement `disable`.
- [x] Implement `setVolume`.
- [x] Implement `dispose`.
- [x] Avoid creating audio context on page load.
- [x] Create or resume audio context only after explicit user action.
- [x] Generate subtle Web Audio tones without external audio files.
- [x] Store sound preference only after user action.
- [x] Handle browser Web Audio absence.
- [x] Handle browser audio blocking.
- [x] Keep reduced-motion users on subtle defaults.

## Tests

- [x] Add Vitest coverage that no audio starts on load.
- [x] Add Vitest coverage that enable requires action path.
- [x] Add Vitest coverage that disable suspends or stops audio.
- [x] Add Vitest coverage that preference is persisted.
- [x] Add Vitest coverage for unavailable Web Audio state.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
