# Cesium Scene Tasks

## Purpose

Bridge React and Cesium by mounting the Cesium container, creating the viewer once, wiring controllers, and reporting lifecycle events.

## Dependencies

- [x] Viewer lifecycle module is available.
- [x] Camera controller interface is available.
- [x] Layer controller interface is available.
- [x] Jotai app state callback contracts are available.

## Implementation Checklist

- [x] Create `src/cesium/CesiumScene.tsx`.
- [x] Create a stable ref for the Cesium container element.
- [x] Call viewer lifecycle creation only once per mounted container.
- [x] Attach camera controller after viewer creation.
- [x] Attach layer controller after viewer creation.
- [x] Pass visual mode changes to layer controller.
- [x] Pass layer visibility changes to layer controller.
- [x] Pass camera commands to camera controller.
- [x] Add pointer listener that notifies manual interaction.
- [x] Add wheel listener that notifies manual interaction.
- [x] Add touch listener that notifies manual interaction.
- [x] Detect first useful rendered frame after initial camera preset.
- [x] Call `onViewerReady` once.
- [x] Call `onFirstFrame` once.
- [x] Route layer availability updates to callback.
- [x] Destroy controllers and viewer on unmount.

## Tests

- [x] Add mocked-viewer test that viewer is created once.
- [x] Add mocked-viewer test that visual mode changes do not recreate viewer.
- [x] Add mocked-viewer test that layer changes do not recreate viewer.
- [x] Add mocked-viewer test that unmount destroys viewer.
- [x] Add mocked-event test that pointer input emits manual mode.

## Done Criteria

- [x] Public interface matches `detail-design.md`.
- [x] Required failure behavior is implemented.
- [x] Independent tests for the module pass.
