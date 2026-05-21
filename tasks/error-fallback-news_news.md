# Error And Fallback News Tasks

## Purpose

Handle news failures without affecting the rest of MyEarth.

## Dependencies

- [x] News domain unavailable reasons are available.
- [x] News API handler is available.
- [x] News panel component is available.
- [x] Existing error fallback behavior is understood.

## Implementation Checklist

- [x] Map `missing-api-key` to setup-safe public text.
- [x] Map `quota-exceeded` to setup-safe public text.
- [x] Map `rate-limited` to short-term throttle public text.
- [x] Map `provider-failed` to temporary unavailable text.
- [x] Map `cache-empty` to not-loaded text.
- [x] Map `invalid-provider-payload` to temporary unavailable text.
- [x] Show empty-country text when selected country has no headlines.
- [x] Render stale snapshot with original last updated time.
- [x] Disable `newsHeatmap` when news is unavailable.
- [x] Preserve last successful snapshot when refresh fails.
- [x] Ensure news failure does not block loading screen completion.
- [x] Ensure news failure does not call fatal error handler.
- [x] Ensure news failure does not affect search.
- [x] Ensure news failure does not affect radar.
- [x] Ensure news failure does not affect distance measuring.
- [x] Ensure news failure does not affect sound.

## Tests

- [x] Add unit tests for public message mapping.
- [x] Add UI tests for missing API key message.
- [x] Add UI tests for quota exceeded message.
- [x] Add service tests for GNews short-term rate limit messaging.
- [x] Add UI tests for provider failure message.
- [x] Add UI tests for empty country message.
- [x] Add service tests for stale snapshot fallback.
- [x] Add app shell tests that news failure is non-fatal.

## Done Criteria

- [x] All news failures are non-fatal.
- [x] Public messages do not leak secrets.
- [x] Independent tests for fallback behavior pass.
