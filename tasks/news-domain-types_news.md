# News Domain Types Tasks

## Purpose

Define serializable shared news types used by server normalization, client state, UI, and tests.

## Dependencies

- [x] `proposal_news.md` exists.
- [x] `detail-design_news.md` section 6 is approved.
- [x] Existing shared domain type patterns are understood.

## Implementation Checklist

- [x] Add `NewsProviderId`.
- [x] Add `NewsArticle`.
- [x] Add `NewsCountrySummary`.
- [x] Add `NewsSnapshot`.
- [x] Add `NewsUnavailableReason`.
- [x] Add `NewsApiResponse`.
- [x] Add `NewsState`.
- [x] Ensure all news types are serializable.
- [x] Ensure timestamps are represented as ISO strings.
- [x] Add optional public `imageUrl` for provider article images.
- [x] Ensure article body text is not part of the public news types.
- [x] Export types from a module that both client and server code can import.

## Tests

- [x] Add Vitest coverage that ready API responses are accepted by type guards.
- [x] Add Vitest coverage that unavailable API responses are accepted by type guards.
- [x] Add Vitest coverage that malformed responses are rejected.
- [x] Add Vitest coverage that news defaults are serializable.

## Done Criteria

- [x] Public news types match `detail-design_news.md`.
- [x] No server secret or provider-only field is exposed in shared types.
- [x] Independent tests for this module pass.
