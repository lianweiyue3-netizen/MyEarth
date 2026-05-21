# MyEarth Global News Heatmap Requirements

## Summary

Add a live global news feature to MyEarth that shows important general news around the world on the 3D globe.

The feature should display a country-level news heatmap using GNews top headlines. News is off by default. Users can enable the news map from a News control or the Layers panel, then select a highlighted country to fly the camera there and read that country's current headlines.

This document defines requirements only. It does not implement the feature.

## Product Goals

- Help users discover important current news around the world while staying inside the globe experience.
- Keep the existing MyEarth identity: map-first, compact controls, no cluttered news portal layout.
- Support a personal/demo deployment using only free-tier news access.
- Keep API keys private and keep the app usable when news data is unavailable.

## Non-Goals

- Do not build a full news reader or infinite feed.
- Do not show graphic media.
- Do not expose a GNews API key in browser JavaScript.
- Do not require paid news API access for v1.
- Do not attempt precise event-level geocoding in v1.

## Data Source

Use GNews Top Headlines as the first news provider:

- Endpoint capability: top headlines by country, category, and language.
- Required query shape: `country=<countryCode>`, `category=general`, `lang=en`, `max=10`.
- Provider docs: [GNews Top Headlines](https://docs.gnews.io/endpoints/top-headlines-endpoint).
- Free-tier constraint source: [GNews Pricing](https://gnews.io/pricing).

The implementation must assume the free tier only:

- 100 requests per day.
- Up to 10 articles per request.
- Free-tier news may be delayed.

Because of these limits, v1 should refresh cached country data daily, not hourly.

## Coverage Requirements

- Target all GNews-supported countries eventually.
- v1 may ship with the provider-supported country list and graceful handling for no-data countries.
- Unsupported or empty countries must render as no-data, not as failures.
- Country-level mapping is sufficient for v1. Individual story geocoding is out of scope.

## Map Behavior

- Add a `newsHeatmap` layer concept.
- News heatmap is off by default.
- Heatmap intensity represents headline volume for each country.
- A country with zero returned headlines should not be highlighted.
- Selecting a highlighted country should:
  - Fly the camera to that country.
  - Open a country news panel.
  - Show only that selected country's headlines.

## UI Requirements

- Add a left-side News button in the existing command overlay.
- Expose News in the Layers panel as a map layer toggle.
- The News panel should be compact and consistent with existing MyEarth panels.
- The selected country panel should show:
  - Country name.
  - Dataset "Last updated" timestamp.
  - Up to 10 headlines.
  - Headline title.
  - Short summary.
  - Source name.
- Published time.
- External article link.
- The UI must show timestamps so users understand freshness and possible free-tier delay.
- The UI may show provider article images when GNews supplies an HTTP(S) image URL.
- Each article should include a related YouTube search link.
- External article links should open in a new tab with safe link attributes.

## API And Caching Requirements

- Add a server-side proxy/cache endpoint, for example `/api/news`.
- The browser must call the proxy, not GNews directly.
- Store the GNews API key only on the server side, for example as `GNEWS_API_KEY`.
- The proxy should normalize provider responses into a stable MyEarth news snapshot.
- The proxy should cache the full country snapshot for approximately 24 hours.
- The proxy should avoid exceeding 100 GNews requests per day.
- If refresh fails but a previous cached snapshot exists, serve the previous snapshot with its original timestamp.
- If no key, quota failure, provider failure, or no cached data exists, return an unavailable state that the UI can display non-fatally.

## Suggested Data Shape

The implementation may refine names, but should preserve these concepts:

```ts
type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  url: string;
  sourceName: string;
  publishedAt: string;
};

type NewsCountrySummary = {
  countryCode: string;
  countryName: string;
  headlineCount: number;
  articles: NewsArticle[];
};

type NewsSnapshot = {
  provider: "GNews";
  category: "general";
  language: "en";
  lastUpdated: string;
  countries: Record<string, NewsCountrySummary>;
};
```

## Error And Empty States

- Missing API key: News is disabled with setup guidance.
- Quota exceeded: News is unavailable with a concise non-blocking message.
- Provider/network failure: News is unavailable unless a cached snapshot can be shown.
- Empty country results: selected country panel shows a no-headlines message.
- News failure must not block globe rendering, search, radar, layers, distance measuring, or sound.

## Privacy, Security, And Compliance

- Do not send user identity, precise user location, or search text to the news provider.
- Do not include article body text beyond provider-supplied title and short summary.
- Keep GNews attribution or provider/source labeling visible where news appears.
- Keep existing Cesium, RainViewer, NASA, and OpenStreetMap attribution behavior intact.

## Accessibility Requirements

- News controls must be keyboard operable.
- The country news panel must use semantic headings, links, and list structure.
- News loading and unavailable states should be announced through existing accessible status patterns.
- Heatmap information must be represented in accessible HTML, not only in the canvas.

## Test Requirements

Unit tests:

- Normalize GNews responses into the MyEarth news snapshot shape.
- Aggregate headline counts by country.
- Handle missing API key.
- Handle provider/quota failure.
- Handle empty country results.

UI tests:

- News is off by default.
- News can be enabled from the News control and Layers panel.
- Missing/unavailable news shows a non-blocking message.
- Selected country panel renders country name, timestamps, source names, summaries, and links.

Cesium/component tests:

- Enabling the news layer renders country heatmap entities or equivalent map primitives.
- Selecting a news country emits a camera fly-to command.
- Selecting a news country opens the matching country panel.

Acceptance checks:

- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run test` passes.
- `npm run build` passes.
- Manual check with no `GNEWS_API_KEY`: app works and News is unavailable.
- Manual check with valid `GNEWS_API_KEY`: cached country headlines appear and country selection works.

## Open Implementation Notes

- Country boundaries should be bundled/static data, not fetched from GNews.
- For v1, simplified country regions are acceptable if they make the heatmap performant and clear.
- If full country polygons are too large for the current bundle, use a reduced dataset or simplified boundaries.
- The implementation should keep React re-renders from recreating the Cesium viewer.
