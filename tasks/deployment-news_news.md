# Deployment News Tasks

## Purpose

Document and configure Vercel deployment pieces for the news proxy, KV cache, and daily cron refresh.

## Dependencies

- [x] News API handler is available.
- [x] News refresh service is available.
- [x] News cache repository is available.
- [x] Vercel project deployment is available.

## Implementation Checklist

- [x] Document `GNEWS_API_KEY`.
- [x] Document `KV_REST_API_URL`.
- [x] Document `KV_REST_API_TOKEN`.
- [x] Document optional `NEWS_REFRESH_SECRET`.
- [x] Add Vercel Cron route for `GET /api/news/refresh`.
- [x] Use daily schedule `0 3 * * *` unless changed by requirements.
- [x] Ensure cron route stays within GNews free-tier request budget.
- [x] Ensure missing KV config makes News unavailable, not fatal.
- [x] Ensure missing GNews key makes News unavailable, not fatal.
- [x] Ensure existing Cesium env vars remain unchanged.
- [x] Document manual no-key acceptance check.
- [x] Document manual keyed acceptance check.

## Tests

- [x] Add config tests for missing news env vars.
- [x] Add handler tests for missing KV config.
- [x] Add handler tests for missing GNews key.
- [x] Add refresh endpoint tests for optional secret validation.
- [x] Add manual checklist for Vercel Cron refresh.
- [x] Add manual checklist for cached `/api/news` response.

## Done Criteria

- [x] Deployment docs include all news env vars.
- [x] Vercel Cron refresh behavior is documented and testable.
- [x] Existing Vercel deployment behavior remains unchanged.
