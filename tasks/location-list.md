# Location List Tasks

## Purpose

Provide quick access to primary wonders and secondary city shortcuts.

## Dependencies

- [ ] Location content is available.
- [ ] Camera command dispatch is available.
- [ ] Buildings request action is available.
- [ ] CSS Modules setup is available.

## Implementation Checklist

- [ ] Create `src/ui/LocationList.tsx`.
- [ ] Create `src/ui/LocationList.module.css`.
- [ ] Render eight wonders in primary group.
- [ ] Render seven cities in secondary group.
- [ ] Place wonders before cities in DOM order.
- [ ] Apply stronger visual hierarchy to wonders.
- [ ] Apply secondary visual hierarchy to cities.
- [ ] Emit selected location id on wonder selection.
- [ ] Emit wonder fly-to command on wonder selection.
- [ ] Emit selected location id on city selection.
- [ ] Emit city fly-to command on city selection.
- [ ] Request buildings opportunistically on city selection.
- [ ] Keep city selection successful if buildings fail.
- [ ] Provide accessible labels for grouped lists.

## Tests

- [ ] Add React Testing Library coverage that all eight wonders render.
- [ ] Add React Testing Library coverage that all seven cities render.
- [ ] Add React Testing Library coverage that wonders appear before cities.
- [ ] Add React Testing Library coverage for wonder selection.
- [ ] Add React Testing Library coverage for city selection.
- [ ] Add React Testing Library coverage that city selection does not require buildings success.

## Done Criteria

- [ ] Public interface matches `detail-design.md`.
- [ ] Required failure behavior is implemented.
- [ ] Independent tests for the module pass.
