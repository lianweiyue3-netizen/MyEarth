# News Panel Component Tasks

## Purpose

Render news loading, unavailable, ready, selected-country, timestamp, source, and article-link UI.

## Dependencies

- [x] News domain types are available.
- [x] Jotai news state is available.
- [x] Command overlay integration point is available.

## Implementation Checklist

- [x] Create `NewsPanel.tsx`.
- [x] Create `NewsPanel.module.css`.
- [x] Define `NewsPanelProps`.
- [x] Render loading state.
- [x] Render unavailable state.
- [x] Render dataset last updated time.
- [x] Render stale cache message when present.
- [x] Render selected country heading.
- [x] Render selected country no-headlines message.
- [x] Render up to 10 article entries.
- [x] Render article title.
- [x] Render article summary.
- [x] Render article source name.
- [x] Render article published time.
- [x] Render external article link.
- [x] Use `target="_blank"` and `rel="noreferrer"` on article links.
- [x] Render provider article images when available.
- [x] Render a related YouTube search link for each article.
- [x] Render country list when no selected country exists.
- [x] Add compact enable or disable news heatmap control.
- [x] Ensure long text wraps without overlap.

## Tests

- [x] Add React Testing Library coverage for loading state.
- [x] Add React Testing Library coverage for unavailable state.
- [x] Add React Testing Library coverage for last updated time.
- [x] Add React Testing Library coverage for selected country headline list.
- [x] Add React Testing Library coverage for empty selected country.
- [x] Add React Testing Library coverage for safe external links.
- [x] Add React Testing Library coverage for article media and YouTube links.
- [x] Add React Testing Library coverage for layer toggle callback.
- [x] Add React Testing Library coverage for country selection callback.

## Done Criteria

- [x] Component has no provider or cache dependency.
- [x] Component remains accessible with semantic headings and lists.
- [x] Independent tests for this component pass.
