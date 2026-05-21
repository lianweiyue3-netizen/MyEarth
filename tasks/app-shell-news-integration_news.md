# App Shell News Integration Tasks

## Purpose

Wire the news client, news state, layer availability, command overlay props, Cesium scene props, and camera commands.

## Dependencies

- [x] Client news service is available.
- [x] Jotai news state is available.
- [x] Country metadata module is available.
- [x] Existing app shell camera command flow is understood.

## Implementation Checklist

- [x] Create one `NewsClient` instance in the app shell.
- [x] Load news when app reaches ready state or News panel opens.
- [x] Abort news load on unmount.
- [x] Store ready snapshot in `newsStateAtom`.
- [x] Store unavailable response in `newsStateAtom`.
- [x] Mark `newsHeatmap` available when at least one country has headlines.
- [x] Keep `newsHeatmap` disabled when no countries have headlines.
- [x] Keep `newsHeatmap` disabled when news is unavailable.
- [x] Pass news state to `CommandOverlay`.
- [x] Pass news layer state to `CesiumScene`.
- [x] Handle selected news country from UI.
- [x] Handle selected news country from Cesium heatmap pick.
- [x] Emit `flyToCoordinates` camera command for selected country centroid.
- [x] Open or focus News panel after country selection.
- [x] Ensure news errors do not call fatal error fallback.

## Tests

- [x] Add app shell test for loading news through `NewsClient`.
- [x] Add app shell test for unavailable news disabling the layer.
- [x] Add app shell test for ready news enabling layer availability.
- [x] Add app shell test for selected country camera command.
- [x] Add app shell test that news errors do not render `ErrorFallback`.

## Done Criteria

- [x] News wiring follows existing app shell patterns.
- [x] No Cesium object is stored in React or Jotai state.
- [x] Independent tests for this integration pass.
