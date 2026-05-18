# Cesium Scene Tasks

## Purpose

Bridge React and Cesium by mounting the Cesium container, creating the viewer once, wiring controllers, and reporting lifecycle events.

## Dependencies

- [ ] Viewer lifecycle module is available.
- [ ] Camera controller interface is available.
- [ ] Layer controller interface is available.
- [ ] Jotai app state callback contracts are available.

## Implementation Checklist

- [ ] Create `src/cesium/CesiumScene.tsx`.
- [ ] Create a stable ref for the Cesium container element.
- [ ] Call viewer lifecycle creation only once per mounted container.
- [ ] Attach camera controller after viewer creation.
- [ ] Attach layer controller after viewer creation.
- [ ] Pass visual mode changes to layer controller.
- [ ] Pass layer visibility changes to layer controller.
- [ ] Pass camera commands to camera controller.
- [ ] Add pointer listener that notifies manual interaction.
- [ ] Add wheel listener that notifies manual interaction.
- [ ] Add touch listener that notifies manual interaction.
- [ ] Detect first useful rendered frame after initial camera preset.
- [ ] Call `onViewerReady` once.
- [ ] Call `onFirstFrame` once.
- [ ] Route layer availability updates to callback.
- [ ] Destroy controllers and viewer on unmount.

## Tests

- [ ] Add mocked-viewer test that viewer is created once.
- [ ] Add mocked-viewer test that visual mode changes do not recreate viewer.
- [ ] Add mocked-viewer test that layer changes do not recreate viewer.
- [ ] Add mocked-viewer test that unmount destroys viewer.
- [ ] Add mocked-event test that pointer input emits manual mode.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
