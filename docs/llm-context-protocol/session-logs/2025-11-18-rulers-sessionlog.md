# Session Log – 2025-11-18 (Canvas rulers + zoom fix)

## Summary
- Wrapped the Konva Stage in a dedicated canvas container with top/left rulers (drawn in JSX) so the artboard no longer snaps to the browser edges; the ruler measurements track the canvas dimensions and sit around a fixed padding frame.
- Reworked zoom to scale/pan the Stage via `stageRef` instead of relying on props—clicks zoom around the pointer correctly now, and the cursor reflects zoom-in/out state.
- Simplified dropdown behavior: only zoom/crop/draw/shape/text expose caret toggles, while flip/rotate fire instantly. Filters remain in the standalone button beside the inspector.
- Updated the inspector color block to keep the Figma layout and noted the ruler/canvas changes in shared memory for future agents.

## Next agent checklist
1. Wire the filter “Amount” slider to real adjustments (still UI-only).
2. Flesh out advanced draw/crop interactions per user direction.
3. Keep the ruler container in mind when adjusting layout—stage transforms should always flow through the central `stageRef`.
