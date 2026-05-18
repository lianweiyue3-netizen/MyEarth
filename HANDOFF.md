# MyEarth Handoff Summary

## Current State

Renewed on 2026-05-19 after the latest continuation pass.

The project is a Vite React TypeScript app using CesiumJS, CSS Modules, Jotai, Vitest, React Testing Library, and Playwright. All implementation module task files are complete in `tasks/progress.md`; only visual QA milestones remain unchecked.

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
- Confirmed `VITE_CESIUM_ION_TOKEN` is not set in the current environment.
- Ran a production build successfully.
- Started a local preview at `http://127.0.0.1:4173`, opened the app in the browser, and confirmed the missing-token fallback scene renders with the command overlay instead of a blank page.
- Stopped the local preview server before handoff.
- Did not update `tasks/progress.md` because full desktop/tablet/mobile visual QA was not completed.

## Verification Last Run

Previously passing full checks:

```text
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

Previously observed results:

- TypeScript: passed.
- ESLint: passed.
- Vitest: 14 files, 86 tests passed.
- Vite production build: passed.
- Playwright: 15 tests passed across desktop, tablet, and mobile Chromium projects.

Latest command from this session:

```text
npm run build
```

Result: passed.

Playwright Chromium was installed earlier with:

```text
npx playwright install chromium
```

## Progress Tracker

`tasks/progress.md` marks all module task files complete after reconciling implementation and tests.

Still unchecked in `tasks/progress.md`:

- Desktop visual QA passes.
- Tablet visual QA passes.
- Mobile visual QA passes.

These QA milestones still need screenshot review. Prefer running with a real `VITE_CESIUM_ION_TOKEN` so Cesium terrain, imagery, geocoding, Black Marble night lights, OSM Buildings, and optional layers can be visually inspected. Without a token, only the required fallback experience can be visually reviewed.

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

1. Set `VITE_CESIUM_ION_TOKEN` in the environment for a live Cesium QA pass.
2. Run the app and capture desktop, tablet, and mobile screenshots.
3. Inspect for blank canvases, cropped panels, overlapping controls, inaccessible focus states, and unreadable text.
4. Test real Cesium ion services: terrain, geocoding, Black Marble, and OSM Buildings.
5. Confirm the RainViewer radar layer against live metadata when the external API is reachable.
6. If visual QA passes, mark the three remaining visual QA milestones in `tasks/progress.md`.

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
