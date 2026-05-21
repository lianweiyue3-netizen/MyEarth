# Core User Flows News Tasks

## Purpose

Verify the end-to-end user flows defined for the news feature.

## Dependencies

- [x] App shell news integration is available.
- [x] News panel component is available.
- [x] Cesium news heatmap layer is available.
- [x] News API handler is available.
- [x] Error and fallback behavior is available.

## Implementation Checklist

- [x] Verify first load with no news key.
- [x] Verify News layer is off by default.
- [x] Verify opening News calls `/api/news`.
- [x] Verify no-key response shows unavailable message.
- [x] Verify app remains usable after no-key response.
- [x] Verify first load with cached news.
- [x] Verify News panel shows last updated time.
- [x] Verify enabling News renders heatmap.
- [x] Verify selecting highlighted country on globe emits country code.
- [x] Verify selected country updates News panel.
- [x] Verify selected country triggers camera fly-to.
- [x] Verify selected country shows up to 10 headlines.
- [x] Verify daily refresh calls provider and writes cache.
- [x] Verify stale cache is shown when refresh fails.

## Tests

- [x] Add Playwright coverage for no-key News unavailable flow.
- [x] Add Playwright coverage for News panel open flow.
- [x] Add Playwright coverage for News off by default.
- [x] Add Playwright or component coverage for selected country panel update.
- [x] Add integration test for cached news read without provider call.
- [x] Add manual test for Vercel Cron refresh.

## Done Criteria

- [x] All core user flows in `detail-design_news.md` are covered by automated or manual tests.
- [x] Existing app flows still pass.
- [x] Manual no-key and keyed acceptance checks pass.
