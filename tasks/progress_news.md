# MyEarth Global News Heatmap Progress

All checkboxes start unchecked. Mark a module complete only after its task file done criteria are satisfied and its relevant tests pass.

## Documents

- [x] `proposal_news.md` reviewed before implementation.
- [x] `detail-design_news.md` reviewed before implementation.

## Modules

- [x] [News Domain Types](news-domain-types_news.md)
- [x] [Country Metadata And Boundaries](country-metadata-boundaries_news.md)
- [x] [GNews Provider Adapter](gnews-provider-adapter_news.md)
- [x] [News Normalizer](news-normalizer_news.md)
- [x] [News Cache Repository](news-cache-repository_news.md)
- [x] [News Refresh Service](news-refresh-service_news.md)
- [x] [News API Handler](news-api-handler_news.md)
- [x] [Client News Service](client-news-service_news.md)
- [x] [Jotai News State](jotai-news-state_news.md)
- [x] [App Shell News Integration](app-shell-news-integration_news.md)
- [x] [Cesium News Heatmap Layer](cesium-news-heatmap-layer_news.md)
- [x] [Layer Controller News Integration](layer-controller-news-integration_news.md)
- [x] [News Panel Component](news-panel-component_news.md)
- [x] [Command Overlay News Integration](command-overlay-news-integration_news.md)
- [x] [Layer Toggle News Integration](layer-toggle-news-integration_news.md)
- [x] [Attribution News Integration](attribution-news-integration_news.md)
- [x] [Accessibility News Integration](accessibility-news-integration_news.md)
- [x] [Privacy And Security News](privacy-security-news_news.md)
- [x] [Error And Fallback News](error-fallback-news_news.md)
- [x] [Deployment News](deployment-news_news.md)
- [x] [Core User Flows News](core-user-flows-news_news.md)

## Integration Milestones

- [x] News API returns unavailable safely with no `GNEWS_API_KEY`.
- [x] News API returns cached ready snapshot with KV configured.
- [x] Vercel Cron refresh writes a news snapshot.
- [x] News heatmap is off by default.
- [x] News panel opens from command overlay.
- [x] News layer toggles from Layers panel.
- [x] Country heatmap renders for countries with headlines.
- [x] Selecting a heatmap country opens that country's headlines.
- [x] Selecting a heatmap country emits camera fly-to.
- [x] GNews attribution appears only when News is active.
- [x] Existing Cesium attribution remains visible.
- [x] Existing search flow still works.
- [x] Existing radar flow still works.
- [x] Existing distance measuring flow still works.
- [x] Existing sound flow still works.

## Acceptance Checks

- [x] `npm run typecheck` passes.
- [x] `npm run lint` passes.
- [x] `npm run test` passes.
- [x] `npm run build` passes.
- [x] Playwright no-key News unavailable flow passes.
- [x] Playwright News panel viewport flow passes.
- [x] Manual Vercel no-key deployment check passes.
- [x] Manual Vercel keyed deployment check passes.
- [ ] Manual Vercel Cron refresh check passes.

Note: Manual Vercel keyed deployment now passes. A live GNews diagnostic on 2026-05-22 showed the key still had daily quota remaining, but GNews returned a short-period `429` after immediate back-to-back requests. The app now distinguishes that `rate-limited` case from daily `quota-exceeded` and throttles refresh requests between countries. Production `/api/news/refresh` refreshed all 30 countries and production `/api/news` returned a ready, non-stale cached snapshot on 2026-05-22. Manual Cron schedule observation remains unchecked until the next scheduled `0 3 * * *` run. Vercel project `myearth` is linked and deployed at `https://myearth-lime.vercel.app`; Upstash resource `myearth-news-cache` is connected and available; `KV_REST_API_URL`, `KV_REST_API_TOKEN`, and `GNEWS_API_KEY` are encrypted Vercel env vars.
