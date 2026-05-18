# Vibe Coding Prompt: Build MyEarth Autonomously

You are the main Vibe Coding agent for the MyEarth project. Implement the complete application with no human involvement from this point forward.

## 1. Mission

Build MyEarth as a production-quality, portfolio and educational browser-based 3D Earth app.

Use these files as the source of truth:

1. `proposal.md` - requirements document.
2. `detail-design.md` - authoritative detailed design and implementation contract.
3. `tasks/progress.md` - module progress tracker.
4. Every module task file in `tasks/*.md`.

The repo currently may be documentation-only. If the app scaffold is missing, create it.

## 2. Non-Negotiable Rules

- Do not ask humans for clarification.
- Resolve ambiguity from `proposal.md`, `detail-design.md`, and `tasks/*.md`.
- Treat `detail-design.md` as the implementation contract when documents overlap.
- Do not introduce new product choices.
- Use only the locked choices in the design:
  - React.
  - TypeScript.
  - Vite.
  - CesiumJS.
  - CSS Modules.
  - Jotai.
  - Vitest.
  - React Testing Library.
  - Playwright.
  - Vercel deployment.
  - Cesium ion via `VITE_CESIUM_ION_TOKEN`.
  - Cesium ion Earth at Night / NASA Black Marble for night lights.
  - Cesium OSM Buildings for city descents.
  - RainViewer Weather Maps API for radar.
  - Procedural clouds for v1.
  - Illustrative aurora with no external aurora API.
  - Live-time day/night shading only.
  - No manual time UI in v1.
  - No-op telemetry by default.
- Do not collect search query text in telemetry.
- Do not collect precise user location.
- Do not start audio before explicit user opt-in.
- Do not use bulk deletion commands.
- Do not use `rm -rf`, `Remove-Item -Recurse`, `rmdir /s`, `rd /s`, or `del /s`.
- If deleting is unavoidable, delete one clearly specified file at a time.
- Preserve existing user-authored docs unless a task explicitly requires updating them.
- Do not mark a task checkbox complete until its implementation and relevant tests are complete.

## 3. Required Final Outcome

The final project must include:

- A Vite React TypeScript application.
- CesiumJS globe rendering.
- Full-screen cinematic first-load Earth scene.
- Live-time day/night shading.
- Stars, atmosphere, city/night lights mode, procedural clouds, illustrative aurora, terrain, labels, buildings, and RainViewer radar where enabled and available.
- Natural wonders tour as the primary experience.
- Secondary city shortcuts.
- Earth-science learning panels.
- Search through Cesium ion geocoding.
- Accessible command-center UI.
- Web Audio opt-in soundscape.
- Performance quality fallback.
- Privacy-friendly local preferences and no-op telemetry.
- Complete unit, component, and browser tests.
- Vercel deployment documentation.
- Updated task checklists and progress tracker.

## 4. Module Task Files

Spawn one sub-agent for each module task file below. Each sub-agent owns its module task file and the corresponding implementation/tests. Sub-agents must not overwrite unrelated work. The main agent is responsible for integration, conflict resolution, final quality, and progress tracking.

Module files:

- `tasks/configuration.md`
- `tasks/jotai-app-state.md`
- `tasks/app-shell.md`
- `tasks/cesium-scene.md`
- `tasks/viewer-lifecycle.md`
- `tasks/camera-controller.md`
- `tasks/camera-presets.md`
- `tasks/location-content.md`
- `tasks/educational-source-notes.md`
- `tasks/learning-content.md`
- `tasks/visual-mode.md`
- `tasks/layer-controller.md`
- `tasks/terrain-layer.md`
- `tasks/buildings-layer.md`
- `tasks/night-lights-layer.md`
- `tasks/procedural-cloud-layer.md`
- `tasks/aurora-layer.md`
- `tasks/weather-radar.md`
- `tasks/search.md`
- `tasks/tour.md`
- `tasks/sound.md`
- `tasks/performance-quality.md`
- `tasks/command-overlay-ui.md`
- `tasks/search-control.md`
- `tasks/visual-mode-selector.md`
- `tasks/layer-toggle-panel.md`
- `tasks/learning-panel.md`
- `tasks/location-list.md`
- `tasks/accessibility.md`
- `tasks/persistence.md`
- `tasks/telemetry.md`
- `tasks/attribution.md`
- `tasks/error-fallback.md`

Do not create a sub-agent for `tasks/progress.md`. The main agent owns progress updates.

If the Vibe Coding runtime does not expose literal sub-agents, simulate the same structure with isolated workstreams and keep ownership boundaries identical.

## 5. Dependency-Aware Execution Waves

Run sub-agents in waves so dependent modules have stable contracts before integration.

### Wave 1: Foundation

Implement and test:

- Configuration.
- Jotai app state.
- Persistence.
- Telemetry.
- Accessibility.
- Camera presets.
- Location content.
- Educational source notes.
- Learning content.
- Visual mode.

Wave 1 must establish shared types, validation helpers, state atoms, source-backed content, and app constants.

### Wave 2: Core Services

Implement and test:

- Viewer lifecycle.
- Cesium scene.
- Camera controller.
- Layer controller.
- Terrain layer.
- Buildings layer.
- Night lights layer.
- Procedural cloud layer.
- Aurora layer.
- Weather radar.
- Search.
- Tour.
- Sound.
- Performance quality.

Wave 2 must use mockable adapters for Cesium, RainViewer, geocoding, and Web Audio so tests do not require live services.

### Wave 3: UI

Implement and test:

- App shell.
- Command overlay UI.
- Search control.
- Visual mode selector.
- Layer toggle panel.
- Learning panel.
- Location list.
- Attribution.
- Error fallback.

Wave 3 must use CSS Modules, accessible controls, visible focus states, reduced-motion handling, and responsive layouts.

### Wave 4: Integration And QA

The main agent completes:

- First-load flow.
- Core user flows.
- Browser smoke tests.
- Desktop, tablet, and mobile visual QA.
- Vercel deployment docs.
- Attribution and service-limit docs.
- Final progress tracker updates.

## 6. Required Shared Interfaces

Implement the shared domain types from `detail-design.md`:

```ts
type CameraMode =
  | "introOrbit"
  | "idleOrbit"
  | "manual"
  | "flyingToWonder"
  | "flyingToCity"
  | "tour"
  | "resetting";

type VisualModeId =
  | "satellite"
  | "political"
  | "nightLights"
  | "terrainEmphasis"
  | "cleanGlobe";

type LayerId =
  | "clouds"
  | "atmosphere"
  | "terrain"
  | "labels"
  | "buildings"
  | "weatherRadar"
  | "aurora"
  | "sound";

type QualityMode = "auto" | "high" | "balanced" | "low";
```

Also implement:

- `LayerAvailability`.
- `LoadingPhase`.
- `AppError`.
- `AppConfig`.
- `CameraController`.
- `LayerController`.
- `WeatherRadarService`.
- `TourController`.
- `Soundscape`.
- `TelemetryClient`.
- `PreferencesStore`.
- `EarthLocation`.
- `LearningTopic`.
- `LearningPanelContent`.
- `CameraPreset`.
- `VisualModeDefinition`.

Use the exact shapes from `detail-design.md` unless TypeScript integration requires a mechanically equivalent adjustment.

## 7. Scaffold Requirements

If missing, create the Vite app scaffold in this repo.

Required scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview"
  }
}
```

Required dependencies include:

- `@vitejs/plugin-react`.
- `typescript`.
- `vite`.
- `react`.
- `react-dom`.
- `cesium`.
- `jotai`.
- `vitest`.
- `@testing-library/react`.
- `@testing-library/jest-dom`.
- `@testing-library/user-event`.
- `playwright` or `@playwright/test`.
- ESLint packages appropriate for React and TypeScript.

Use CSS Modules for component styling.

## 8. External Service Rules

### Cesium ion

- Read token from `VITE_CESIUM_ION_TOKEN`.
- Missing token must not produce a blank page.
- Show setup guidance for missing token.
- Do not log token values.
- Use Cesium ion terrain, imagery, geocoding, Black Marble night lights, and OSM Buildings where available.

### RainViewer

- Fetch metadata from `https://api.rainviewer.com/public/weather-maps.json`.
- Use latest `radar.past` frame.
- Cache successful metadata for 10 minutes.
- Use maximum zoom level 7.
- Show RainViewer attribution when radar is active.
- Treat network failure as non-blocking.

### Web Audio

- Generate sound with Web Audio API.
- Start only after explicit user opt-in.
- Provide visible controls.
- Persist only local sound preference.

## 9. Testing Requirements

Every module must include tests matching its task file.

Required final checks:

```text
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

Add Playwright tests for:

- App boots and Cesium canvas is nonblank or fallback appears when token is absent.
- First-load UI does not overlap at desktop, tablet, and mobile widths.
- Search control keyboard path works with mocked geocoding.
- Wonder tour advances through all eight required wonders.
- Layer toggles update visible state.
- Sound does not start before opt-in.
- RainViewer failure is non-blocking.

If any Python helper scripts are introduced:

```text
python -m mypy <helper-path>
python -m ruff check <helper-path>
```

Do not introduce Python helpers unless they materially reduce implementation risk.

## 10. Progress Tracking

For each module task file:

- Mark individual checkboxes only when the subtask is implemented and verified.
- Mark tests only when the relevant tests exist and pass.
- Mark done criteria only when the module interface, failure behavior, and tests are complete.

For `tasks/progress.md`:

- Mark a module complete only after all done criteria in that module file are checked.
- Mark integration milestones only after the corresponding command or QA check passes.
- Do not mark anything complete speculatively.

## 11. Final Integration Responsibilities

The main agent must:

- Review sub-agent work for consistency with `detail-design.md`.
- Resolve type mismatches across modules.
- Ensure Cesium objects are not stored in Jotai atoms.
- Ensure optional layer failures are isolated.
- Ensure attribution remains visible.
- Ensure reduced motion affects camera, overlay, clouds, and aurora.
- Ensure no search query text reaches telemetry.
- Ensure no audio starts before opt-in.
- Ensure all tests and final checks pass.
- Update `README.md` or equivalent docs with:
  - local setup.
  - `VITE_CESIUM_ION_TOKEN`.
  - Vercel deployment.
  - Cesium token restrictions.
  - RainViewer attribution and usage note.
  - Cesium/OpenStreetMap/NASA attribution expectations.
  - missing-token fallback behavior.

## 12. Final Response Requirements

When implementation is complete, return:

- Summary of implemented app.
- List of major modules completed.
- Commands run and their results.
- Any known limitations that remain.
- Confirmation that `tasks/progress.md` is updated.

Do not ask the human to make decisions during implementation. If a live external service is unavailable, implement the documented fallback and continue.
