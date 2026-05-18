# Educational Source Notes Tasks

## Purpose

Track factual sources for educational content internally without showing inline citations in the main UI.

## Dependencies

- [x] Content type module exists.
- [x] Learning topic list is available.

## Implementation Checklist

- [x] Create `src/content/sourceNotes.ts`.
- [x] Define `SourceNote` type.
- [x] Add source note ids for terrain and plate tectonics.
- [x] Add source note ids for climate systems.
- [x] Add source note ids for ecosystems and biomes.
- [x] Add source note ids for atmosphere and weather.
- [x] Add source note ids for water cycle and oceans.
- [x] Add source note ids for ice and polar systems.
- [x] Add source note ids for human impact.
- [x] Add source note ids for night lights and urbanization.
- [x] Add source note ids for each required wonder.
- [x] Add source note ids for secondary city content.
- [x] Export source note lookup by id.
- [x] Add validation for unique source note ids.
- [x] Add validation for title, publisher, URL, and purpose.

## Tests

- [x] Add Vitest coverage that all source note ids are unique.
- [x] Add Vitest coverage that every source note has title, publisher, and URL.
- [x] Add Vitest coverage that every required topic has at least one source note.
- [x] Add Vitest coverage that invalid source references fail validation.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
