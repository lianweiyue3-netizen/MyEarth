# MyEarth

MyEarth is a browser-based 3D Earth learning app built with React, TypeScript, Vite, CesiumJS, CSS Modules, Jotai, Vitest, and Playwright.

## Local Setup

```bash
npm install
npm run dev
```

The app reads Cesium ion from:

```text
VITE_CESIUM_ION_TOKEN=<your dedicated Cesium ion token>
```

If the token is absent, MyEarth renders a limited demo mode with the command UI, learning content, tour controls, and setup guidance instead of a blank page. Token values are never displayed in public errors.

## Checks

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

Playwright requires browser binaries. Install Chromium with:

```bash
npx playwright install chromium
```

## Vercel Deployment

Use the default Vite settings:

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Node.js: current Vercel LTS runtime is sufficient for Vite 5

Set these Vercel environment variables:

```text
VITE_CESIUM_ION_TOKEN=<dedicated production token>
VITE_APP_ENV=production
VITE_TELEMETRY_ENABLED=false
VITE_TELEMETRY_ENDPOINT=
```

Use a dedicated Cesium ion token for MyEarth, not an account default token. Restrict token scopes to public asset read and geocoding needs, and restrict allowed URLs to the production Vercel domain plus any custom domain.

## Service Notes

- CesiumJS and Cesium ion power globe rendering, terrain, imagery, geocoding, NASA Black Marble night lights, and OSM Buildings where available.
- OpenStreetMap attribution must remain visible when OSM Buildings are active.
- OpenStreetMap Nominatim powers the street/state readout when the camera is close to the surface.
- RainViewer radar metadata is fetched from `https://api.rainviewer.com/public/weather-maps.json`; radar is best-effort, limited to maximum zoom 7, cached for 10 minutes, and attributed to RainViewer when active.
- The aurora layer is a local illustrative overlay and is not a live space-weather feed.
- Web Audio starts only after explicit user opt-in.
- Telemetry is no-op by default and, when configured, accepts only anonymous typed performance and error categories. Search query text and precise user location are not collected.
