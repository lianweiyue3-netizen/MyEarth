# MyEarth Handoff Summary

## Current State

The project has been scaffolded as a Vite React TypeScript app using CesiumJS, CSS Modules, Jotai, Vitest, React Testing Library, and Playwright.

Implemented baseline:

- Vite/React/TypeScript project config.
- Cesium viewer lifecycle boundary with missing-token fallback.
- Full command overlay UI with search, tour, visual modes, layers, learning panel, locations, sound opt-in, quality status, and attribution.
- Shared domain types from `detail-design.md`.
- Configuration, Jotai state, persistence, telemetry, accessibility helpers.
- Content for eight required wonders and seven city shortcuts.
- Learning/source-note content with aurora illustrative disclaimer.
- Camera presets and camera controller.
- Layer adapters for terrain, buildings, night lights, procedural clouds, aurora, weather radar, and labels.
- RainViewer metadata service with 10-minute cache behavior.
- Search service and Cesium geocoder adapter.
- Tour and soundscape controllers.
- Performance quality profile logic.
- README deployment/setup documentation.

## Verification Last Run

Passing commands:

```text
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

Latest observed results:

- TypeScript: passed.
- ESLint: passed.
- Vitest: 11 files, 62 tests passed.
- Vite production build: passed.
- Playwright: 15 tests passed across desktop, tablet, and mobile Chromium projects.

Playwright Chromium was installed with:

```text
npx playwright install chromium
```

## Progress Tracker

`tasks/progress.md` has verified completion marked for:

- Configuration.
- Jotai App State.
- Camera Presets.
- Location Content.
- Educational Source Notes.
- Learning Content.
- Visual Mode.
- Accessibility.
- Persistence.
- Telemetry.
- Local boot/typecheck/lint/build/Playwright smoke/deployment docs/service notes.

Still unchecked in `tasks/progress.md`:

- App Shell.
- Cesium Scene.
- Viewer Lifecycle.
- Camera Controller.
- Layer Controller.
- Terrain Layer.
- Buildings Layer.
- Night Lights Layer.
- Procedural Cloud Layer.
- Aurora Layer.
- Weather Radar.
- Search.
- Tour.
- Sound.
- Performance Quality.
- Command Overlay UI.
- Search Control.
- Visual Mode Selector.
- Layer Toggle Panel.
- Learning Panel.
- Location List.
- Attribution.
- Error Fallback.
- Desktop/tablet/mobile visual QA milestones.

Many unchecked modules already have initial implementation files, but their individual task files have not all been reconciled with tests and done criteria.

## Important Constraints

- Do not use bulk deletion commands:
  - `del /s`
  - `rd /s`
  - `rmdir /s`
  - `Remove-Item -Recurse`
  - `rm -rf`
- If deletion is unavoidable, delete one clearly specified file at a time.
- Do not collect search query text in telemetry.
- Do not collect precise user location.
- Do not start audio before explicit user opt-in.
- Do not store Cesium objects in Jotai atoms.
- Missing `VITE_CESIUM_ION_TOKEN` must never blank the page.

## Suggested Next Work

1. Add focused unit tests for core services already implemented:
   - `cameraController`
   - `layerController`
   - individual layer adapters
   - `weatherRadarService`
   - `searchService`
   - `tourController`
   - `soundscape`
   - `qualityController`
   - `viewerLifecycle`
2. Add React Testing Library tests for app shell and UI components not yet individually covered.
3. Update each corresponding `tasks/*.md` checklist only after its module tests pass.
4. Run the full verification sequence again.
5. Mark additional modules complete in `tasks/progress.md` only when their module task files are fully checked.

## Local Commands

Run the app:

```text
npm run dev -- --host 127.0.0.1 --port 3000
```

Build and preview:

```text
npm run build
npm run preview -- --host 127.0.0.1
```
