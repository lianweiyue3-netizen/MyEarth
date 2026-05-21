# Privacy And Security News Tasks

## Purpose

Keep provider credentials private and prevent news requests from carrying sensitive user data.

## Dependencies

- [x] GNews provider adapter is available.
- [x] News API handler is available.
- [x] Client news service is available.
- [x] Existing telemetry rules are understood.

## Implementation Checklist

- [x] Read `GNEWS_API_KEY` only in Vercel Function code.
- [x] Ensure browser code never imports server key-reading modules.
- [x] Ensure browser responses never include provider keys.
- [x] Ensure server logs do not include provider keys.
- [x] Ensure news requests do not include user identity.
- [x] Ensure news requests do not include precise user location.
- [x] Ensure news requests do not include search text.
- [x] Ensure news requests do not include account data.
- [x] Restrict news telemetry to anonymous categories.
- [x] Prevent telemetry from including raw article URLs.
- [x] Prevent telemetry from including article titles or summaries.
- [x] Render article URLs directly as external links without proxying article pages.

## Tests

- [x] Add tests that API responses do not contain configured key values.
- [x] Add tests that thrown errors do not contain configured key values.
- [x] Add tests that client bundle-facing modules do not import server-only modules.
- [x] Add telemetry type tests rejecting article URLs.
- [x] Add telemetry type tests rejecting article titles.
- [x] Add telemetry type tests rejecting precise location.

## Done Criteria

- [x] GNews key is server-only.
- [x] News feature does not expand collected personal data.
- [x] Independent tests for privacy and security pass.
