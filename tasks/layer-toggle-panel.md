# Layer Toggle Panel Tasks

## Purpose

Provide accessible independent toggles for clouds, atmosphere, terrain, labels, buildings, weather radar, aurora, and sound.

## Dependencies

- [x] Layer controller state is available.
- [x] Sound module state is available.
- [x] Layer availability atom is available.
- [x] CSS Modules setup is available.

## Implementation Checklist

- [x] Create `src/ui/LayerTogglePanel.tsx`.
- [x] Create `src/ui/LayerTogglePanel.module.css`.
- [x] Render clouds toggle.
- [x] Render atmosphere toggle.
- [x] Render terrain toggle.
- [x] Render labels toggle.
- [x] Render buildings toggle.
- [x] Render weather radar toggle.
- [x] Render aurora toggle.
- [x] Render sound toggle.
- [x] Expose toggle state through `aria-pressed` or switch semantics.
- [x] Show disabled reason for unavailable layers.
- [x] Route sound toggle to sound action.
- [x] Route Cesium layer toggles to layer action.
- [x] Explain RainViewer unavailability when radar fails.
- [x] Explain token, performance, or fallback reason when buildings are disabled.

## Tests

- [x] Add React Testing Library coverage that all toggles render.
- [x] Add React Testing Library coverage for accessible pressed state.
- [x] Add React Testing Library coverage for disabled reason display.
- [x] Add React Testing Library coverage that sound action is separate.
- [x] Add React Testing Library coverage that layer toggle emits layer id.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
