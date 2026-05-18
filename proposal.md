# MyEarth Requirements Proposal

## 1. Purpose

MyEarth is a production-quality, portfolio and educational browser app that presents Earth as a cinematic, interactive 3D experience. The app should feel like a premium blend of Google Earth, a space documentary, and a sci-fi command center while remaining practical on normal consumer laptops and modern mobile devices.

This document defines implementation-ready requirements only. It is not the implementation.

## 2. Product Goals

MyEarth must:

- Deliver an immediate full-screen 3D Earth experience on first load.
- Prioritize natural wonders and Earth-science education over city tourism.
- Use real geospatial rendering through CesiumJS, not a decorative fake globe.
- Run smoothly on normal consumer laptops without requiring gaming hardware.
- Work in modern evergreen desktop and mobile browsers.
- Deploy cleanly to Vercel.
- Respect practical WCAG AA accessibility constraints.
- Use privacy-friendly telemetry limited to anonymous performance and error signals.

## 3. Target Stack

Required stack:

- React
- TypeScript
- Vite
- CesiumJS
- CSS modules, scoped CSS, Tailwind, or another lightweight styling approach chosen during implementation
- Vercel for deployment

CesiumJS is required as the globe engine because it provides a high-precision WGS84 globe, 3D Tiles support, terrain and imagery layers, time-dynamic visualization, and desktop/mobile web support.

The implementation must not replace CesiumJS with Three.js, Mapbox, deck.gl, WebGL Globe, or a canvas-only custom renderer. Three.js may be used only for non-globe decorative effects if those effects do not interfere with Cesium performance.

## 4. External Services

### 4.1 CesiumJS

Use CesiumJS for:

- Globe rendering
- Camera controls and fly-to transitions
- Terrain
- Imagery layers
- Geocoding/search
- 3D Tiles
- 3D buildings where available
- Time-aware lighting and sun position behavior

Reference: https://cesium.com/platform/cesiumjs/

### 4.2 Cesium ion

Cesium ion is expected for terrain, imagery, geocoding, and Cesium OSM Buildings where available.

The app must use a dedicated production Cesium ion token, configured through a Vercel environment variable:

```text
VITE_CESIUM_ION_TOKEN=<token>
```

Token requirements:

- Use a dedicated token per app.
- Do not use the account default token in production.
- Restrict token scope to the minimum required public scopes, expected to include `assets:read` and `geocode`.
- Restrict allowed URLs for the production domain when the app is deployed.
- Document token setup in the README or deployment notes.
- Provide a visible missing-token fallback screen that explains the app can run in limited demo mode, without exposing internal errors.

Reference: https://cesium.com/learn/ion/cesium-ion-access-tokens/

### 4.3 Cesium OSM Buildings

Use Cesium OSM Buildings for city descents where building data is available.

Requirements:

- Buildings are a secondary experience after natural wonders.
- The buildings layer must be toggleable.
- If buildings fail to load, the app must continue with terrain and imagery.
- Building descents should prefer cities with strong OSM building coverage.
- Attribution for OpenStreetMap contributors must remain visible through Cesium attribution or an equivalent attribution area.

Reference: https://cesium.com/platform/cesium-ion/content/cesium-osm-buildings/

### 4.4 Cesium ion Geocoding

Global search should prefer Cesium ion geocoding to avoid adding another primary map account.

Requirements:

- Search queries must fly to the selected result.
- Failed searches must show a short, non-blocking message.
- Search must not require user accounts.
- Search must be keyboard accessible.
- Search must respect Cesium ion token quota and failure behavior.

### 4.5 RainViewer Weather Radar

Live weather radar should prefer RainViewer Weather Maps API.

Reference: https://www.rainviewer.com/api.html  
Reference: https://www.rainviewer.com/api/weather-maps-api.html

Requirements:

- Fetch metadata from `https://api.rainviewer.com/public/weather-maps.json`.
- Use the latest available radar frame by default.
- Support a manual radar time selector only if it can be implemented without cluttering the primary UI.
- Use RainViewer tile URLs from the returned `host` and radar `path` values.
- Respect the documented tile maximum zoom level of 7.
- Treat radar data availability as best effort.
- Display RainViewer attribution with a link to `https://www.rainviewer.com/`.
- Clearly document that the API is free for personal and educational use and that availability is not guaranteed.
- If RainViewer is unavailable, hide the radar overlay and show a non-blocking status message.

Recommended Cesium implementation direction:

- Add radar as an `ImageryLayer` using `UrlTemplateImageryProvider`.
- Use a Web Mercator tiling scheme compatible with RainViewer x/y/z tiles.
- Set `maximumLevel` to 7.
- Use opacity around 0.45 to 0.7 depending on active visual mode.
- Refresh metadata no more frequently than every 10 minutes unless the API documentation changes.

## 5. Audience

Primary audience:

- Portfolio reviewers
- Students
- Educators
- Casual science and geography learners
- Recruiters or engineering reviewers evaluating frontend, WebGL, geospatial, and product craft

The app is not commercial SaaS and does not require accounts, payments, collaboration, admin tools, or dashboards.

## 6. First-Load Experience

The first loaded screen must be the application, not a marketing landing page.

Required first-load sequence:

1. Render a full-screen cinematic Earth in space.
2. Show a visible star field behind Earth.
3. Enable visible atmospheric glow.
4. Enable live-time day/night shading.
5. Show night-side city lights where the selected imagery/layer strategy supports it.
6. Start an auto-orbit reveal after the globe is ready.
7. Fade in the core UI after the initial view is stable.
8. Show a small opt-in sound prompt after the first user interaction opportunity.

The first frame must not show:

- A blank page while Cesium initializes.
- A marketing hero instead of the globe.
- Large explanatory text over the globe.
- Overlapping panels.
- Browser console errors visible to users.

Loading states:

- Show a premium loading state while Cesium assets initialize.
- The loading state must include app name, concise status text, and progress states if practical.
- The app must transition smoothly from loading to the globe.
- If Cesium cannot initialize, show a usable error screen with setup guidance.

## 7. Visual Direction

Required feel:

- Cinematic Earth in deep space
- Sci-fi command-center UI
- Calm educational tone
- Premium, restrained interface
- No childish or toy-like presentation

Visual requirements:

- Full-screen Cesium canvas.
- Dark space background.
- Visible stars.
- Visible atmosphere.
- Subtle UI glass or panel treatment with strong readability.
- UI panels should be compact and operational, not card-heavy marketing sections.
- Controls should feel like mission controls, not generic form demos.
- Avoid decorative gradient blobs, bokeh orbs, or unrelated abstract backgrounds.
- Text must never overlap controls, panels, or the globe in an incoherent way.
- Mobile layout must prioritize the globe, then compact controls, then panels.

## 8. Core Interaction Requirements

The globe must support:

- Drag to rotate.
- Wheel or pinch zoom.
- Touch pan and zoom.
- Double-click or double-tap fly-to for supported targets or picked positions.
- Smooth cinematic camera transitions.
- Reset globe view.
- Pause or resume auto-orbit.
- Search and fly-to.
- Guided tour.
- Layer toggles.
- Quality/performance controls.

Interaction details:

- Auto-orbit must pause when the user manually interacts with the globe.
- Reset must return to a composed cinematic global view, not an arbitrary Cesium default.
- Fly-to transitions must use easing and avoid abrupt cuts unless the user has reduced motion enabled.
- Double-click behavior must not conflict with Cesium default zoom in a way that feels broken.
- Touch interactions must be tested on mobile viewport sizes.

## 9. Camera System

The camera system must support these states:

- `introOrbit`
- `idleOrbit`
- `manual`
- `flyingToWonder`
- `flyingToCity`
- `tour`
- `resetting`

Camera requirements:

- Use Cesium camera APIs for all globe movement.
- Provide a central camera service or hook to avoid scattering flight logic across components.
- Use named camera presets for the initial view, reset view, each wonder, and each city shortcut.
- Avoid disorienting roll unless used intentionally during a cinematic transition.
- Use altitude and heading/pitch/range values tuned per location.
- Respect `prefers-reduced-motion` by shortening or simplifying transitions.

## 10. Content Priority

Natural wonders are primary. Major cities are secondary.

The home UI must make the wonders tour more prominent than city shortcuts.

### 10.1 Required Wonders Tour

The guided wonders tour must include:

- Mount Everest
- Grand Canyon
- Amazon Rainforest
- Great Barrier Reef
- Sahara Desert
- Antarctica
- Himalayas
- Aurora region

Each wonder must have:

- Name
- Category
- Latitude and longitude
- Recommended camera altitude/range
- Short educational summary
- At least three learning facts
- Earth-science themes
- Optional related layer suggestions

Example themes:

- Terrain
- Climate
- Ecosystems
- Atmosphere
- Water
- Human impact
- Geology
- Biodiversity

### 10.2 City Shortcuts

Cities must remain secondary and should demonstrate 3D buildings where available.

Recommended city shortcuts:

- New York City
- Tokyo
- London
- Paris
- Dubai
- San Francisco
- Singapore

Each city shortcut must:

- Fly to an appealing city-scale camera angle.
- Enable buildings if available and not disabled by performance fallback.
- Show a short place label.
- Avoid replacing the educational focus of the app.

## 11. Educational Layer

The app must include Earth-science learning panels that feel integrated with the globe.

Required education topics:

- Terrain and plate tectonics
- Climate systems
- Ecosystems and biomes
- Atmosphere and weather
- Water cycle and oceans
- Ice, polar systems, and sea level
- Human impact
- Night lights and urbanization

Learning panel requirements:

- Panels must be readable over the globe.
- Panels must support keyboard focus and screen readers.
- Panel text must be concise but richer than single-sentence trivia.
- Each wonder should connect to one or more education topics.
- Panels should include layer recommendations such as "turn on terrain emphasis" or "view radar" when relevant.
- Educational copy must not make unsupported scientific claims.

Suggested data structure:

```ts
type LearningTopic =
  | "terrain"
  | "climate"
  | "ecosystems"
  | "atmosphere"
  | "water"
  | "ice"
  | "human-impact"
  | "urbanization";

type EarthLocation = {
  id: string;
  name: string;
  kind: "wonder" | "city";
  category: string;
  coordinates: {
    latitude: number;
    longitude: number;
    heightMeters?: number;
  };
  camera: {
    destinationHeightMeters: number;
    headingDegrees?: number;
    pitchDegrees?: number;
    rangeMeters?: number;
  };
  summary: string;
  facts: string[];
  topics: LearningTopic[];
  suggestedLayers?: LayerId[];
};
```

## 12. Visual Modes

The app must support these visual modes:

- Satellite
- Political/labeled
- Night lights
- Terrain emphasis
- Clean globe

Mode requirements:

- Only one primary visual mode should be active at a time.
- Mode switching must be smooth and must not recreate the Cesium viewer.
- Each mode must have clear active state styling.
- Political/labeled mode must prioritize readable labels.
- Clean globe mode must hide visual clutter and leave core Earth rendering.
- Terrain emphasis mode must make relief and topography more legible without making the UI hard to read.

## 13. Layer Toggles

The app must support toggles for:

- Clouds
- Atmosphere
- Terrain
- Labels
- 3D buildings
- Live radar weather
- Aurora
- Sound

Layer requirements:

- Each toggle must have clear on/off state.
- Toggles must be keyboard accessible.
- Toggles must expose `aria-pressed` or equivalent accessible state.
- Unavailable layers must show disabled state with a short reason.
- Expensive layers must participate in performance fallback.
- The atmosphere toggle must never leave the globe looking broken or unlit.

### 13.1 Clouds

Clouds may be implemented as:

- A Cesium imagery overlay, if a stable source and attribution are available.
- A lightweight procedural transparent cloud layer.
- A static texture bundled with the app, if licensing allows.

Clouds must be optional and should be disabled first on low-performance devices.

### 13.2 Aurora

Aurora may be approximate and educational rather than real-time.

Requirements:

- Show aurora near polar regions.
- Make clear in the learning panel if aurora is illustrative rather than live data.
- Do not add a new external API unless the implementation documents reliability, quota, attribution, and fallback behavior.

### 13.3 Sound

Sound must:

- Use the Web Audio API.
- Start only after explicit user interaction.
- Include visible controls.
- Be off by default until the user opts in.
- Store only local preference if the user enables or disables it.
- Respect reduced motion and accessibility considerations by keeping audio subtle and easy to disable.

## 14. UI Requirements

Required UI areas:

- Top app/title cluster
- Search control
- Primary wonder tour control
- Visual mode selector
- Layer toggles
- Learning panel
- Location quick list
- Reset view button
- Quality/performance status
- Attribution area

UI behavior:

- UI should fade or slide in after the first globe frame is ready.
- Panels must be dismissible or collapsible on mobile.
- The primary globe canvas must remain visible behind controls.
- Important controls must remain reachable with keyboard only.
- Controls must not block Cesium attribution.
- Controls must not overlap browser safe areas or mobile notches.
- UI must be responsive from 360px wide mobile screens through large desktop screens.

## 15. Accessibility Requirements

The app must target practical WCAG AA.

Requirements:

- Sufficient color contrast for all text and controls.
- Keyboard operability for search, buttons, toggles, tour controls, panels, and reset.
- Visible focus indicators.
- Screen-reader labels for icon buttons and toggles.
- Reduced-motion support through `prefers-reduced-motion`.
- No audio autoplay.
- Captions or text equivalents for sound-related state.
- Avoid flashing or rapidly strobing visual effects.
- Provide meaningful status updates for loading, failed layers, and selected locations.
- Preserve Cesium canvas interaction while providing accessible parallel controls for core navigation.

Known limitation:

- A 3D globe canvas cannot expose every geospatial visual detail to screen readers. The app must compensate by making search, tours, selected locations, learning panels, and layer states accessible through semantic HTML.

## 16. Performance Requirements

Target hardware:

- Normal consumer laptops from the last 5 years.
- Integrated GPU devices where WebGL is available.
- Modern mobile devices with evergreen browsers.

Performance goals:

- Initial meaningful globe render should occur as quickly as practical after app load.
- Globe interaction should feel smooth during drag and zoom.
- Camera transitions should avoid visible stutter on default quality.
- UI interaction must remain responsive while imagery and terrain stream.

Performance strategy:

- Lazy-load optional overlays.
- Defer nonessential panels until after Cesium is ready.
- Avoid recreating the Cesium `Viewer`.
- Memoize location and layer metadata.
- Keep React state separate from per-frame Cesium rendering where possible.
- Throttle resize, pointer, telemetry, and weather-refresh logic.
- Use requestAnimationFrame only where needed.
- Avoid heavy post-processing on default quality.

## 17. Quality And Fallback Behavior

The app must support quality levels:

- Auto
- High
- Balanced
- Low

Auto quality should detect:

- Device memory when available
- Hardware concurrency when available
- Mobile viewport/touch context
- WebGL capability
- Runtime frame timing

Fallback order:

1. Reduce cinematic extras such as dense stars, glow intensity, and transition duration.
2. Disable or simplify clouds.
3. Disable aurora effects.
4. Lower radar opacity or disable radar.
5. Disable 3D buildings.
6. Lower terrain detail if needed.
7. Preserve globe quality and interaction smoothness as long as possible.

The fallback system must prefer keeping the globe readable and interactive over preserving decorative effects.

If WebGL or Cesium initialization fails:

- Show a clear fallback screen.
- Explain that the browser or GPU may not support the 3D view.
- Provide basic educational content and setup guidance.
- Do not crash to a blank page.

## 18. Privacy And Telemetry

No user accounts are required.

Allowed local storage:

- Sound preference
- Last selected quality mode
- Last selected visual mode
- Optional reduced UI preference

Telemetry may include only anonymous:

- App load timing
- Cesium initialization failure
- Layer load failure
- Runtime error category
- Approximate frame health bucket
- Browser capability bucket

Telemetry must not collect:

- Names
- Email addresses
- Account identifiers
- Precise user location
- Search query text
- IP-derived location stored by the app
- Persistent cross-site identifiers
- Behavioral profiles

Telemetry must be optional to configure and easy to disable for local development.

## 19. State Model

Recommended state domains:

- Cesium viewer lifecycle
- Camera mode
- Selected location
- Tour state
- Visual mode
- Layer visibility
- Quality level
- Sound state
- Weather radar state
- Loading and error state
- Accessibility preferences

State management may use React context, Zustand, Jotai, or local hooks. The implementation should avoid unnecessary global state for static content.

## 20. Component Architecture

Recommended components:

- `App`
- `CesiumScene`
- `GlobeLoadingScreen`
- `CommandOverlay`
- `SearchControl`
- `VisualModeSelector`
- `LayerTogglePanel`
- `TourControls`
- `LocationList`
- `LearningPanel`
- `SoundConsentControl`
- `AttributionBar`
- `QualityIndicator`
- `ErrorFallback`

Recommended services/hooks:

- `useCesiumViewer`
- `useCameraController`
- `useLayerController`
- `useWeatherRadar`
- `usePerformanceQuality`
- `useSoundscape`
- `useReducedMotion`
- `locations.ts`
- `learningContent.ts`

The Cesium viewer should be created once and controlled through services/hooks. React re-renders must not recreate the viewer during normal layer, mode, or panel changes.

## 21. Deployment Requirements

Deployment target:

- Vercel

Required deployment documentation:

- Node version
- Install command
- Build command
- Output directory
- `VITE_CESIUM_ION_TOKEN` setup
- Cesium token allowed URL setup
- Missing-token fallback behavior
- RainViewer attribution and educational-use note
- Cesium and OpenStreetMap attribution expectations

Expected commands:

```text
npm install
npm run typecheck
npm run lint
npm run build
npm run preview
```

If the final implementation uses different script names, the README must document the actual commands.

## 22. Testing Requirements

### 22.1 Local Checks

The implementation must pass:

- Dependency install
- Type check
- Lint
- Production build
- Local Vite preview

### 22.2 Browser QA

Verify:

- Cesium canvas is nonblank.
- Earth appears on first load.
- Atmosphere is visible.
- Stars are visible.
- Live-time day/night shading works.
- Auto-orbit starts after load.
- Manual drag pauses auto-orbit.
- Zoom works with mouse wheel or trackpad.
- Touch zoom and rotate work.
- Double-click fly-to behavior works where implemented.
- Reset view works.
- Search returns and flies to a result.
- Wonder tour advances through all required wonders.
- City shortcuts fly to expected cities.
- 3D buildings appear where available.
- Layer toggles work.
- Visual modes switch without recreating the viewer.
- Sound prompt appears and sound starts only after opt-in.
- Manual time or live-time behavior works if a time control is implemented.
- RainViewer layer appears when API data is available.
- Missing optional services fail gracefully.

### 22.3 Visual QA

Capture and review screenshots for:

- Desktop
- Tablet
- Mobile

Screenshots must show:

- Premium first-load composition.
- No overlapping controls.
- No clipped or unreadable text.
- Visible Earth, atmosphere, and stars.
- Night-side city lights where supported.
- Weather overlay when enabled and available.
- Readable learning panels.
- Accessible focus states for keyboard controls.

### 22.4 Production QA

Verify:

- Vercel build succeeds.
- Environment variables are configured.
- Cesium token restrictions match production URL.
- Missing-token fallback is documented.
- Cesium attribution remains visible.
- OpenStreetMap attribution remains visible when OSM Buildings are used.
- RainViewer attribution remains visible when radar is used.
- Free-tier and educational-use constraints are documented.
- Telemetry is limited to anonymous performance and error signals.

## 23. Acceptance Criteria

The app is acceptable when:

- It launches into a full-screen cinematic Earth scene.
- It uses React, TypeScript, Vite, CesiumJS, and Cesium ion as specified.
- It includes all required natural wonders.
- It keeps cities secondary.
- It includes richer Earth-science learning panels.
- It supports the required interactions and layer toggles.
- It handles Cesium token absence gracefully.
- It handles RainViewer failure gracefully.
- It preserves visible attribution.
- It performs smoothly on normal consumer hardware at balanced quality.
- It supports practical keyboard and screen-reader access for all non-canvas controls.
- It passes local checks, browser QA, visual QA, and production QA.

## 24. Out Of Scope

The first production version does not require:

- User accounts
- Saved cloud profiles
- Payments
- Admin dashboards
- Collaborative classroom features
- Native mobile apps
- Offline globe data
- Real-time aurora API integration
- Commercial weather licensing
- User-generated content uploads

## 25. Assumptions

- The app is portfolio and educational production, not commercial SaaS.
- Free-tier services are acceptable when attribution, quotas, fallbacks, and token setup are documented.
- No user accounts are required.
- Only local browser preferences may be stored.
- External service availability can vary and must not break the core globe experience.
- Bulk deletion of files or directories remains prohibited during implementation.
