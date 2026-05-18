# Learning Content Tasks

## Purpose

Provide Earth-science learning panels for wonders, cities, and general topics with source-backed copy.

## Dependencies

- [x] Location content is available.
- [x] Educational source notes are available.
- [x] Shared `LayerId` and `LearningTopic` types are available.

## Implementation Checklist

- [x] Create `src/content/learningContent.ts`.
- [x] Define `LearningPanelContent`.
- [x] Add topic content for terrain and plate tectonics.
- [x] Add topic content for climate systems.
- [x] Add topic content for ecosystems and biomes.
- [x] Add topic content for atmosphere and weather.
- [x] Add topic content for water cycle and oceans.
- [x] Add topic content for ice, polar systems, and sea level.
- [x] Add topic content for human impact.
- [x] Add topic content for night lights and urbanization.
- [x] Add location panel content for each required wonder.
- [x] Add shorter city panel content for each selected city.
- [x] Add suggested layer actions using valid layer ids.
- [x] Add source note references to every panel.
- [x] Include aurora illustrative disclaimer in aurora content.
- [x] Export content lookup by location id.
- [x] Export general topic lookup by topic id.
- [x] Add fallback function for missing location content.

## Tests

- [x] Add Vitest coverage that every required topic exists.
- [x] Add Vitest coverage that every wonder has panel content.
- [x] Add Vitest coverage that every city has secondary panel content.
- [x] Add Vitest coverage that suggested layer ids are valid.
- [x] Add Vitest coverage that source note references resolve.
- [x] Add Vitest coverage that aurora disclaimer exists.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
