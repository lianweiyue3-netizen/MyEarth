# Sound Tasks

## Purpose

Own Web Audio consent, generated soundscape playback, visible controls, volume, local preference, and unavailable-browser behavior.

## Dependencies

- [ ] Persistence module interface is available.
- [ ] Jotai sound state atom is available.
- [ ] Accessibility reduced-motion state is available.

## Implementation Checklist

- [ ] Create `src/sound/soundTypes.ts`.
- [ ] Create `src/sound/soundscape.ts`.
- [ ] Define `SoundState`.
- [ ] Define `Soundscape`.
- [ ] Implement `prompt`.
- [ ] Implement `enable`.
- [ ] Implement `disable`.
- [ ] Implement `setVolume`.
- [ ] Implement `dispose`.
- [ ] Avoid creating audio context on page load.
- [ ] Create or resume audio context only after explicit user action.
- [ ] Generate subtle Web Audio tones without external audio files.
- [ ] Store sound preference only after user action.
- [ ] Handle browser Web Audio absence.
- [ ] Handle browser audio blocking.
- [ ] Keep reduced-motion users on subtle defaults.

## Tests

- [ ] Add Vitest coverage that no audio starts on load.
- [ ] Add Vitest coverage that enable requires action path.
- [ ] Add Vitest coverage that disable suspends or stops audio.
- [ ] Add Vitest coverage that preference is persisted.
- [ ] Add Vitest coverage for unavailable Web Audio state.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
