# News Refresh Service Tasks

## Purpose

Coordinate daily refresh across supported countries while respecting GNews free-tier request limits.

## Dependencies

- [x] Country metadata module is available.
- [x] GNews provider adapter is available.
- [x] News normalizer is available.
- [x] News cache repository is available.

## Implementation Checklist

- [x] Create the news refresh service module.
- [x] Define `NewsRefreshResult`.
- [x] Implement `refreshNewsSnapshot`.
- [x] Check whether cache is already fresh for the current calendar day.
- [x] Acquire refresh lock before provider calls.
- [x] Skip refresh when lock cannot be acquired.
- [x] Iterate supported countries.
- [x] Call provider once per country.
- [x] Request `category=general`.
- [x] Request `language=en`.
- [x] Request `max=10`.
- [x] Normalize each country response.
- [x] Include empty countries with zero headline count.
- [x] Stop provider calls on quota exceeded.
- [x] Stop provider calls on short-term GNews rate limit.
- [x] Support a configurable delay between country requests.
- [x] Keep existing snapshot when all provider calls fail.
- [x] Write active snapshot only after snapshot creation succeeds.
- [x] Update refresh metadata on success.
- [x] Update refresh metadata on failure.
- [x] Release refresh lock after success or failure.

## Tests

- [x] Add Vitest coverage for successful full refresh.
- [x] Add Vitest coverage for fresh-cache skip.
- [x] Add Vitest coverage for lock skip.
- [x] Add Vitest coverage for one provider call per country.
- [x] Add Vitest coverage for empty country response.
- [x] Add Vitest coverage for quota exceeded stop.
- [x] Add Vitest coverage for short-term rate limit stop.
- [x] Add Vitest coverage for all-provider-failed preserving cache.
- [x] Add Vitest coverage for metadata updates.
- [x] Add Vitest coverage that lock is released on failure.

## Done Criteria

- [x] Refresh service has no UI or Cesium dependency.
- [x] Refresh service protects the daily request budget.
- [x] Independent tests for this module pass.
