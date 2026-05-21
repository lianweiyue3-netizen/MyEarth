# Vibe Coding Prompt: Implement MyEarth Global News Heatmap

You are the main Vibe Coding agent for the MyEarth project. Implement the complete Global News Heatmap feature with no human involvement from this point forward.

This is a feature implementation prompt. The base MyEarth app already exists. Do not rebuild the whole app from scratch. Integrate the news feature into the current codebase while preserving all existing behavior.

## 1. Mission

Build the MyEarth Global News Heatmap as a production-quality feature.

Use these files as the source of truth:

1. `proposal_news.md` - requirements document.
2. `detail-design_news.md` - authoritative detailed design and implementation contract.
3. `tasks/progress_news.md` - news feature progress tracker.
4. Every module task file matching `tasks/*_news.md`.
5. Existing MyEarth code and tests, which must keep working.

When documents overlap, treat `detail-design_news.md` as the implementation contract. When feature docs conflict with existing app patterns, preserve the existing app architecture and implement the news design through the closest equivalent local pattern.

## 2. Non-Negotiable Rules

- Do not ask humans for clarification.
- Resolve ambiguity from `proposal_news.md`, `detail-design_news.md`, and `tasks/*_news.md`.
- Do not introduce new product choices.
- Do not replace the existing MyEarth app shell, Cesium viewer lifecycle, layer controller pattern, Jotai state pattern, or UI style.
- Do not expose `GNEWS_API_KEY` to browser code.
- Do not call GNews directly from the browser.
- Do not require paid news API access.
- Do not display article images in v1.
- Do not scrape article bodies.
- Do not collect user identity, precise location, search text, article titles, article URLs, or article summaries in telemetry.
- Do not store Cesium viewer instances, entities, primitives, GeoJSON objects, provider clients, or server clients in Jotai atoms.
- Do not break existing search, radar, distance measuring, sound, attribution, missing-token fallback, or build behavior.
- Do not start audio before explicit user opt-in.
- Do not use bulk deletion commands.
- Do not use `rm -rf`, `Remove-Item -Recurse`, `rmdir /s`, `rd /s`, or `del /s`.
- If deleting is unavoidable, delete one clearly specified file at a time.
- Do not mark a task checkbox complete until its implementation and relevant tests are complete and passing.

## 3. Required Final Outcome

The final project must include:

- A server-side news proxy at `/api/news`.
- A server-side refresh endpoint at `/api/news/refresh`.
- GNews Top Headlines integration using:
  - `country=<countryCode>`
  - `category=general`
  - `lang=en`
  - `max=10`
- Server-only `GNEWS_API_KEY`.
- Vercel KV durable cache for news snapshots, refresh metadata, and refresh lock.
- Vercel Cron-compatible daily refresh.
- Bundled simplified country boundaries for heatmap rendering.
- `newsHeatmap` layer concept, off by default.
- News button in the command overlay.
- News layer toggle in the Layers panel.
- Compact News panel with:
  - country name
  - dataset last updated time
  - up to 10 headlines
  - title
  - short summary
  - source name
  - publish time
  - safe external article link
- Country-level heatmap intensity based on headline volume.
- Selecting a highlighted country flies the camera there and opens that country's headlines.
- GNews/source attribution where News appears.
- Accessible HTML equivalent for country browsing, not canvas-only access.
- Complete unit, component, Cesium, and browser tests.
- Updated news task checklists and `tasks/progress_news.md`.

## 4. Module Task Files

Spawn one sub-agent for each module task file below. Each sub-agent owns its module task file and the corresponding implementation/tests. Sub-agents must not overwrite unrelated work. The main agent is responsible for integration, conflict resolution, final quality, and progress tracking.

Module files:

- `tasks/news-domain-types_news.md`
- `tasks/country-metadata-boundaries_news.md`
- `tasks/gnews-provider-adapter_news.md`
- `tasks/news-normalizer_news.md`
- `tasks/news-cache-repository_news.md`
- `tasks/news-refresh-service_news.md`
- `tasks/news-api-handler_news.md`
- `tasks/client-news-service_news.md`
- `tasks/jotai-news-state_news.md`
- `tasks/app-shell-news-integration_news.md`
- `tasks/cesium-news-heatmap-layer_news.md`
- `tasks/layer-controller-news-integration_news.md`
- `tasks/news-panel-component_news.md`
- `tasks/command-overlay-news-integration_news.md`
- `tasks/layer-toggle-news-integration_news.md`
- `tasks/attribution-news-integration_news.md`
- `tasks/accessibility-news-integration_news.md`
- `tasks/privacy-security-news_news.md`
- `tasks/error-fallback-news_news.md`
- `tasks/deployment-news_news.md`
- `tasks/core-user-flows-news_news.md`

Do not create a sub-agent for `tasks/progress_news.md`. The main agent owns progress updates.

If the Vibe Coding runtime does not expose literal sub-agents, simulate the same structure with isolated workstreams and keep ownership boundaries identical.

## 5. Dependency-Aware Execution Waves

Run sub-agents in waves so dependent modules have stable contracts before integration.

### Wave 1: Shared Contracts And Data

Implement and test:

- News Domain Types.
- Country Metadata And Boundaries.
- News Normalizer.

Wave 1 must establish serializable news types, country metadata, simplified boundary loading/validation, and normalized snapshot data. No module in Wave 1 may require live GNews, Vercel KV, Cesium, or browser UI.

### Wave 2: Server And Cache

Implement and test:

- GNews Provider Adapter.
- News Cache Repository.
- News Refresh Service.
- News API Handler.
- Deployment News.
- Privacy And Security News.

Wave 2 must keep all secrets server-side, use Vercel KV for durable cache/metadata/locks, expose `/api/news` as cache-only, expose `/api/news/refresh` for Vercel Cron, and protect the GNews free-tier request budget.

### Wave 3: Client State And Services

Implement and test:

- Client News Service.
- Jotai News State.
- Error And Fallback News.

Wave 3 must fetch only `/api/news`, represent ready/unavailable/stale states, keep `newsHeatmap` off by default, and guarantee news failures are non-fatal.

### Wave 4: Cesium And Layer Integration

Implement and test:

- Cesium News Heatmap Layer.
- Layer Controller News Integration.
- App Shell News Integration.

Wave 4 must render country heatmap entities/primitives from cached snapshot data, emit selected country codes, fly the camera through existing camera command flow, and avoid viewer recreation.

### Wave 5: UI, Accessibility, Attribution, And Flows

Implement and test:

- News Panel Component.
- Command Overlay News Integration.
- Layer Toggle News Integration.
- Attribution News Integration.
- Accessibility News Integration.
- Core User Flows News.

Wave 5 must add compact controls consistent with the existing command overlay, provide keyboard and HTML alternatives to canvas picking, keep attribution visible, and verify the end-to-end no-key and cached-news flows.

## 6. Required Shared Interfaces

Implement the news interfaces from `detail-design_news.md`. Use these shapes unless TypeScript integration requires a mechanically equivalent adjustment:

```ts
export type NewsProviderId = "GNews";

export type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  url: string;
  sourceName: string;
  publishedAt: string;
};

export type NewsCountrySummary = {
  countryCode: string;
  countryName: string;
  headlineCount: number;
  articles: NewsArticle[];
};

export type NewsSnapshot = {
  provider: NewsProviderId;
  category: "general";
  language: "en";
  lastUpdated: string;
  countries: Record<string, NewsCountrySummary>;
};

export type NewsUnavailableReason =
  | "missing-api-key"
  | "quota-exceeded"
  | "provider-failed"
  | "cache-empty"
  | "invalid-provider-payload";

export type NewsApiResponse =
  | {
      status: "ready";
      snapshot: NewsSnapshot;
      stale: boolean;
      message?: string;
    }
  | {
      status: "unavailable";
      reason: NewsUnavailableReason;
      message: string;
    };

export type NewsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; snapshot: NewsSnapshot; selectedCountryCode?: string }
  | { status: "unavailable"; reason: NewsUnavailableReason; message: string };
```

Also add the `newsHeatmap` layer id to existing layer types, defaults, availability, layer controller routing, layer toggle UI, attribution, and tests.

## 7. Server And Deployment Requirements

Use Vercel-compatible serverless functions:

```text
GET /api/news
GET /api/news/refresh
```

Required environment variables:

```text
GNEWS_API_KEY=<server-only GNews API key>
KV_REST_API_URL=<Vercel KV URL>
KV_REST_API_TOKEN=<Vercel KV token>
NEWS_REFRESH_SECRET=<optional cron guard secret>
```

Existing MyEarth variables remain unchanged:

```text
VITE_CESIUM_ION_TOKEN=<Cesium ion token>
VITE_APP_ENV=production
VITE_TELEMETRY_ENABLED=false
VITE_TELEMETRY_ENDPOINT=
```

Vercel Cron should call:

```text
GET /api/news/refresh
```

Recommended schedule:

```text
0 3 * * *
```

Use Vercel KV for:

- `myearth:news:snapshot:active`
- `myearth:news:metadata`
- `myearth:news:refresh-lock`

`/api/news` must read cached data only. It must not call GNews.

`/api/news/refresh` may call GNews through the provider adapter, but it must use the refresh lock and must never leak `GNEWS_API_KEY`.

## 8. External Service Rules

### GNews

- Use `https://gnews.io/api/v4/top-headlines`.
- Use `category=general`.
- Use `lang=en`.
- Use `max=10`.
- Use one request per supported country during daily refresh.
- Treat HTTP 429 as `quota-exceeded`.
- Treat missing key as `missing-api-key`.
- Treat invalid provider payload as `invalid-provider-payload`.
- Do not display images.
- Do not scrape article bodies.
- Do not copy long article text.

### Vercel KV

- Use KV for durable snapshots and refresh locks.
- Preserve the last successful snapshot when refresh fails.
- Show stale cached data with the original `lastUpdated`.
- If KV is unavailable and no snapshot exists, News must become unavailable without breaking the app.

### Cesium

- Render news through Cesium entities or primitives in a dedicated news heatmap layer.
- Render only countries with `headlineCount > 0`.
- Skip no-boundary and zero-headline countries.
- Removing or disabling News must remove or hide only news visuals.
- News changes must not recreate the Cesium viewer.

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

If `npm run test:e2e` cannot run because browser binaries are missing, install the required Playwright browser binaries and run it again.

Required automated coverage includes:

- GNews response normalization.
- Headline aggregation by country.
- Empty country responses.
- Missing API key.
- Quota exceeded.
- Provider failure.
- Invalid provider payload.
- Cache hit.
- Cache miss.
- Stale cache fallback.
- Refresh lock behavior.
- `/api/news` cache-only behavior.
- `/api/news/refresh` protected refresh behavior.
- Browser-safe client news service behavior.
- News state serializability.
- News heatmap off by default.
- News layer toggle behavior.
- News panel loading, ready, unavailable, selected country, and empty country states.
- Safe article links.
- No image rendering.
- GNews attribution.
- Keyboard-accessible News panel and country list.
- Cesium heatmap entity creation, cleanup, and country pick behavior.
- Camera fly-to command after country selection.
- Existing app flows still passing.

If any Python helper scripts are introduced:

```text
python -m mypy <helper-path>
python -m ruff check <helper-path>
```

Do not introduce Python helpers unless they materially reduce implementation risk.

## 10. Progress Tracking

For each `tasks/*_news.md` module file:

- Mark individual checkboxes only when the subtask is implemented and verified.
- Mark tests only when the relevant tests exist and pass.
- Mark done criteria only when the module interface, failure behavior, and tests are complete.

For `tasks/progress_news.md`:

- Mark a module complete only after all done criteria in that module file are checked.
- Mark integration milestones only after the corresponding command or QA check passes.
- Mark acceptance checks only after running the command or manual check.
- Do not mark anything complete speculatively.

## 11. Main Agent Integration Responsibilities

The main agent must:

- Review sub-agent work for consistency with `detail-design_news.md`.
- Resolve type mismatches across modules.
- Keep server-only code out of browser bundles.
- Ensure `GNEWS_API_KEY` never leaks into client code, logs, errors, tests, or responses.
- Ensure Cesium objects and provider clients are not stored in Jotai atoms.
- Ensure optional news failures are isolated.
- Ensure existing optional layer failures remain isolated.
- Ensure News is off by default.
- Ensure News unavailable state is visible and non-fatal.
- Ensure country heatmap selection and country list selection both work.
- Ensure focus and keyboard behavior are accessible.
- Ensure text does not overlap controls or attribution on desktop, tablet, or mobile.
- Ensure all existing MyEarth tests continue to pass.
- Update `README.md` or equivalent deployment docs only where required by news deployment tasks.

## 12. Final Response Requirements

When implementation is complete, return:

- Summary of implemented News feature.
- List of major news modules completed.
- Commands run and their results.
- Manual checks completed.
- Any known limitations that remain.
- Confirmation that all relevant `tasks/*_news.md` files and `tasks/progress_news.md` are updated.

Do not ask the human to make decisions during implementation. If a live external service is unavailable, implement the documented fallback and continue.
