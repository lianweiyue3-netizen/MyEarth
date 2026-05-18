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
- Expanded core service, Cesium scene, app shell, and UI component coverage.

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
- Vitest: 14 files, 86 tests passed.
- Vite production build: passed.
- Playwright: 15 tests passed across desktop, tablet, and mobile Chromium projects.

Playwright Chromium was installed with:

```text
npx playwright install chromium
```

## Progress Tracker

`tasks/progress.md` now marks all module task files complete after reconciling implementation and tests.

Still unchecked in `tasks/progress.md`:

- Desktop visual QA passes.
- Tablet visual QA passes.
- Mobile visual QA passes.

Those QA milestones should be completed with screenshot review, preferably against a real `VITE_CESIUM_ION_TOKEN` so Cesium terrain, imagery, and optional layers can be visually inspected.

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

1. Run the app with a real `VITE_CESIUM_ION_TOKEN` and visually inspect desktop, tablet, and mobile.
2. Capture screenshots for the remaining visual QA milestones.
3. Test real Cesium ion services: terrain, geocoding, Black Marble, and OSM Buildings.
4. Confirm the RainViewer radar layer against live metadata when the external API is reachable.
5. If visual QA passes, mark the three remaining visual QA milestones in `tasks/progress.md`.

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
