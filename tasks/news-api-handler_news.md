# News API Handler Tasks

## Purpose

Serve cached news data to the browser and expose a protected refresh endpoint for Vercel Cron.

## Dependencies

- [x] News cache repository is available.
- [x] News refresh service is available.
- [x] Vercel Function runtime is configured or documented.
- [x] Optional `NEWS_REFRESH_SECRET` behavior is defined.

## Implementation Checklist

- [x] Add `GET /api/news`.
- [x] Add `GET /api/news/refresh`.
- [x] Make `/api/news` read only from KV cache.
- [x] Ensure `/api/news` never calls GNews.
- [x] Return ready response when active snapshot exists.
- [x] Set `stale: true` when snapshot is older than 24 hours.
- [x] Return unavailable response when cache is empty.
- [x] Return unavailable response when cache read fails.
- [x] Make `/api/news/refresh` validate `NEWS_REFRESH_SECRET` when configured.
- [x] Make `/api/news/refresh` call refresh service.
- [x] Return refresh result without secrets.
- [x] Map missing key to setup-safe public text.
- [x] Map quota exceeded to setup-safe public text.
- [x] Ensure handler responses never contain `GNEWS_API_KEY`.

## Tests

- [x] Add handler test for cached ready response.
- [x] Add handler test for stale cached response.
- [x] Add handler test for empty cache.
- [x] Add handler test that `/api/news` does not call provider.
- [x] Add handler test for refresh success.
- [x] Add handler test for invalid refresh secret.
- [x] Add handler test for missing API key.
- [x] Add handler test that secret values are not leaked.

## Done Criteria

- [x] Browser endpoint is cache-only.
- [x] Refresh endpoint is server-only and quota-aware.
- [x] Independent tests for this module pass.
