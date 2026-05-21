# News Normalizer Tasks

## Purpose

Convert raw GNews payloads into stable MyEarth news snapshot data.

## Dependencies

- [x] News domain types are available.
- [x] Country metadata module is available.
- [x] GNews provider payload shape is documented in fixtures.

## Implementation Checklist

- [x] Create the news normalizer module.
- [x] Add `normalizeGNewsCountryResponse`.
- [x] Add `createNewsSnapshot`.
- [x] Read provider article title.
- [x] Read provider article description or short summary.
- [x] Read provider article URL.
- [x] Read provider source name.
- [x] Read provider published timestamp.
- [x] Trim title, summary, URL, source name, and timestamp strings.
- [x] Generate stable article ids from country code, URL or title, and index.
- [x] Drop articles with no title.
- [x] Drop articles with no URL.
- [x] Drop image fields from normalized output.
- [x] Keep at most 10 articles per country.
- [x] Set `headlineCount` from normalized article count.
- [x] Return zero-headline summaries for empty article arrays.
- [x] Throw invalid provider payload errors for invalid response root shapes.

## Tests

- [x] Add fixture for a valid GNews response.
- [x] Add fixture for an empty country response.
- [x] Add fixture for malformed provider payload.
- [x] Add Vitest coverage for title normalization.
- [x] Add Vitest coverage for summary normalization.
- [x] Add Vitest coverage for source name normalization.
- [x] Add Vitest coverage for published timestamp preservation.
- [x] Add Vitest coverage for dropping missing-title articles.
- [x] Add Vitest coverage for dropping missing-URL articles.
- [x] Add Vitest coverage for max 10 articles.
- [x] Add Vitest coverage for snapshot aggregation.

## Done Criteria

- [x] Normalizer output matches the news domain types.
- [x] No image or article body fields are emitted.
- [x] Independent tests for this module pass.
