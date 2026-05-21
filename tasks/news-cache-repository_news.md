# News Cache Repository Tasks

## Purpose

Store news snapshots, refresh metadata, and refresh locks in Vercel KV.

## Dependencies

- [x] News domain types are available.
- [x] Vercel KV package or REST client approach is selected.
- [x] Vercel KV env vars are documented.

## Implementation Checklist

- [x] Create the news cache repository module.
- [x] Define `NewsCacheRecord`.
- [x] Define `NewsRefreshMetadata`.
- [x] Define `NewsCacheRepository`.
- [x] Add active snapshot key `myearth:news:snapshot:active`.
- [x] Add metadata key `myearth:news:metadata`.
- [x] Add refresh lock key `myearth:news:refresh-lock`.
- [x] Implement `getSnapshot`.
- [x] Implement `setSnapshot`.
- [x] Implement `getMetadata`.
- [x] Implement `setMetadata`.
- [x] Implement `acquireRefreshLock`.
- [x] Implement `releaseRefreshLock`.
- [x] Store active snapshot for at least 48 hours.
- [x] Ensure cache reads do not call GNews.
- [x] Ensure failed writes do not delete the previous snapshot.

## Tests

- [x] Add test double for KV reads and writes.
- [x] Add Vitest coverage for cache hit.
- [x] Add Vitest coverage for cache miss.
- [x] Add Vitest coverage for metadata defaults.
- [x] Add Vitest coverage for lock acquisition.
- [x] Add Vitest coverage for lock contention.
- [x] Add Vitest coverage for failed write preserving prior snapshot.
- [x] Add Vitest coverage for last failure reason metadata.

## Done Criteria

- [x] Repository works with injected KV test double.
- [x] Repository exposes no browser imports.
- [x] Independent tests for this module pass.
