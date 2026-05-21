# Command Overlay News Integration Tasks

## Purpose

Add News as a discoverable command overlay panel without disrupting existing controls.

## Dependencies

- [x] News panel component is available.
- [x] App shell passes news props to command overlay.
- [x] Existing command overlay responsive behavior is understood.

## Implementation Checklist

- [x] Add News button beside Places, Search, Layers, and Distance.
- [x] Add local News panel open or closed state.
- [x] Keep News panel closed by default.
- [x] Render `NewsPanel` when News is open.
- [x] Trigger news load when News opens if needed.
- [x] Show disabled or unavailable label when news is unavailable and space allows.
- [x] Preserve existing Places behavior.
- [x] Preserve existing Search behavior.
- [x] Preserve existing Layers behavior.
- [x] Preserve existing Distance behavior.
- [x] Preserve existing Reset View behavior.
- [x] Ensure mobile stacked layout works with News panel.
- [x] Ensure News panel does not cover attribution.

## Tests

- [x] Add React Testing Library coverage that News button renders when ready.
- [x] Add React Testing Library coverage that News panel is closed by default.
- [x] Add React Testing Library coverage that clicking News opens the panel.
- [x] Add React Testing Library coverage for unavailable News panel state.
- [x] Add React Testing Library coverage that existing buttons still render.
- [x] Add Playwright coverage that News control is visible in viewport.

## Done Criteria

- [x] Command overlay remains compact and operational.
- [x] Existing overlay tests still pass.
- [x] Independent tests for this integration pass.
