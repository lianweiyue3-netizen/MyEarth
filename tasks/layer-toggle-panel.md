# Layer Toggle Panel Tasks

## Purpose

Provide accessible independent toggles for clouds, atmosphere, terrain, labels, buildings, weather radar, aurora, and sound.

## Dependencies

- [ ] Layer controller state is available.
- [ ] Sound module state is available.
- [ ] Layer availability atom is available.
- [ ] CSS Modules setup is available.

## Implementation Checklist

- [ ] Create `src/ui/LayerTogglePanel.tsx`.
- [ ] Create `src/ui/LayerTogglePanel.module.css`.
- [ ] Render clouds toggle.
- [ ] Render atmosphere toggle.
- [ ] Render terrain toggle.
- [ ] Render labels toggle.
- [ ] Render buildings toggle.
- [ ] Render weather radar toggle.
- [ ] Render aurora toggle.
- [ ] Render sound toggle.
- [ ] Expose toggle state through `aria-pressed` or switch semantics.
- [ ] Show disabled reason for unavailable layers.
- [ ] Route sound toggle to sound action.
- [ ] Route Cesium layer toggles to layer action.
- [ ] Explain RainViewer unavailability when radar fails.
- [ ] Explain token, performance, or fallback reason when buildings are disabled.

## Tests

- [ ] Add React Testing Library coverage that all toggles render.
- [ ] Add React Testing Library coverage for accessible pressed state.
- [ ] Add React Testing Library coverage for disabled reason display.
- [ ] Add React Testing Library coverage that sound action is separate.
- [ ] Add React Testing Library coverage that layer toggle emits layer id.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
