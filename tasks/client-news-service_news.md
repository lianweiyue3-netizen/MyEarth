# Client News Service Tasks

## Purpose

Fetch `/api/news` from the browser and convert HTTP results into news availability state.

## Dependencies

- [x] News domain types are available.
- [x] News API handler response shape is defined.

## Implementation Checklist

- [x] Create client news service module.
- [x] Define `NewsClient`.
- [x] Add `createNewsClient`.
- [x] Fetch `/api/news`.
- [x] Support injected fetcher for tests.
- [x] Support `AbortSignal`.
- [x] Parse ready response.
- [x] Parse unavailable response.
- [x] Convert malformed JSON to unavailable state.
- [x] Convert non-2xx HTTP responses to unavailable state.
- [x] Convert network failure to provider-failed unavailable state.
- [x] Do not retry automatically in v1.

## Tests

- [x] Add Vitest coverage for ready response.
- [x] Add Vitest coverage for unavailable response.
- [x] Add Vitest coverage for malformed JSON.
- [x] Add Vitest coverage for non-2xx response.
- [x] Add Vitest coverage for network failure.
- [x] Add Vitest coverage for abort behavior.

## Done Criteria

- [x] Client service has no provider key access.
- [x] Client service has no Cesium dependency.
- [x] Independent tests for this module pass.
