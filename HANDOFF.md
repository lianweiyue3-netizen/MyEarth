# MyEarth Handoff Summary

## Current State

Renewed on 2026-05-19 after the latest continuation pass.

The project is a Vite React TypeScript app using CesiumJS, CSS Modules, Jotai, Vitest, React Testing Library, and Playwright. All implementation module task files and integration milestones are complete in `tasks/progress.md`.

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

## Latest Session Notes

- Read `HANDOFF.md`, `prompt.md`, and `tasks/progress.md`.
- Confirmed there is no root `progress.md`; the active progress tracker is `tasks/progress.md`.
- Added a local ignored `.env.local` with `VITE_CESIUM_ION_TOKEN` for live QA.
- Fixed production Cesium startup by replacing the dynamic `import("cesium")`, which Vite built into a broken self-reference, with the plugin-compatible static Cesium import.
- Fixed live Cesium geocoder normalization for bbox-only responses using `properties.label`.
- Updated app shell and e2e tests so they remain stable whether a local token is present or absent.
- Re-ran the required validation suite: typecheck, lint, unit tests, production build, and Playwright e2e all pass.
- Ran production preview visual QA for the missing-token fallback at desktop, tablet, and mobile breakpoints.
- Re-captured the missing-token fallback screenshots after the latest Playwright run so the `test-results/visual-qa-*.png` artifacts are present again.
- Fixed fallback visual overlap by moving attribution into overlay flow, hiding the scene-level token card on stacked layouts, lifting the desktop token card away from bottom controls, and surfacing visible token guidance in the search status.
- Captured screenshots under `test-results/visual-qa-desktop.png`, `test-results/visual-qa-tablet.png`, `test-results/visual-qa-tablet-bottom.png`, `test-results/visual-qa-mobile.png`, and `test-results/visual-qa-mobile-bottom.png`.
- Added `tasks/progress.md` visual QA notes for the missing-token fallback pass.
- Ran live Cesium production preview visual QA with the local token; canvas rendered at desktop/tablet/mobile, geocoding returned results, night mode/buildings/radar toggles reported no layer failure reasons, and Cesium/RainViewer/NASA/OpenStreetMap attribution remained visible.
- Captured live screenshots under `test-results/visual-qa-live-desktop.png`, `test-results/visual-qa-live-tablet.png`, `test-results/visual-qa-live-tablet-bottom.png`, `test-results/visual-qa-live-mobile.png`, and `test-results/visual-qa-live-mobile-bottom.png`.
- Marked the desktop, tablet, mobile, and live Cesium visual QA milestones complete in `tasks/progress.md`.

## Verification Last Run

Latest passing full checks:

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
- Vitest: 14 files, 87 tests passed.
- Vite production build: passed.
- Playwright: 15 tests passed across desktop, tablet, and mobile Chromium projects.

Playwright Chromium was installed earlier with:

```text
npx playwright install chromium
```

## Progress Tracker

`tasks/progress.md` marks all module task files and integration milestones complete after reconciling implementation, tests, fallback QA, and live Cesium visual QA.

Completed fallback screenshot review in this tokenless environment:

- Desktop missing-token fallback.
- Tablet missing-token fallback top and scrolled-bottom views.
- Mobile missing-token fallback top and scrolled-bottom views.

Completed live Cesium screenshot review with local `.env.local` token:

- Desktop live Cesium scene with search, night mode, buildings, radar, and attribution visible.
- Tablet live Cesium top and scrolled-bottom views.
- Mobile live Cesium top and scrolled-bottom views.

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

1. Deploy to Vercel with `VITE_CESIUM_ION_TOKEN` configured in project environment variables.
2. Restrict the Cesium ion token to the production domain and required public asset/geocoding scopes.
3. Run one final deployed URL smoke check after Vercel publishes.

## Local Commands

Run the app:

```text
npm run dev -- --host 127.0.0.1 --port 3000
```

Build and preview:

```text
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```
