# GNews Provider Adapter Tasks

## Purpose

Fetch GNews top headlines from server-side code without exposing the API key to the browser.

## Dependencies

- [x] News domain types are available.
- [x] Country metadata module is available.
- [x] Server runtime target is Vercel Function.
- [x] `GNEWS_API_KEY` environment variable name is documented.

## Implementation Checklist

- [x] Create the GNews provider adapter module.
- [x] Define `GNewsProviderOptions`.
- [x] Define `GNewsCountryRequest`.
- [x] Define `GNewsProvider`.
- [x] Build URL for `https://gnews.io/api/v4/top-headlines`.
- [x] Add query param `country`.
- [x] Add query param `category=general`.
- [x] Add query param `lang=en`.
- [x] Add query param `max=10`.
- [x] Add query param `apikey` only on the server side.
- [x] Support injected `fetcher` for tests.
- [x] Support request timeout.
- [x] Support `AbortSignal`.
- [x] Map HTTP 401 and 403 to configuration failure.
- [x] Map HTTP 429 to quota exceeded.
- [x] Map invalid JSON to invalid provider payload.
- [x] Avoid logging or returning the API key.

## Tests

- [x] Add Vitest coverage for correct URL construction.
- [x] Add Vitest coverage for category, language, country, and max params.
- [x] Add Vitest coverage that API key is not present in thrown public errors.
- [x] Add Vitest coverage for 401 and 403 handling.
- [x] Add Vitest coverage for 429 handling.
- [x] Add Vitest coverage for timeout abort.
- [x] Add Vitest coverage for invalid JSON.

## Done Criteria

- [x] Adapter can fetch one country response with injected fetch.
- [x] Adapter never imports browser-only code.
- [x] Independent tests for this module pass.
