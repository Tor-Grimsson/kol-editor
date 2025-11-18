# Session Log – 2025-11-18 (Undo + zoomable stage)

## Summary
- Added undo/redo support to `KonvaLayerEditor.jsx` (Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z track layered JSON snapshots) so destructive actions are reversible.
- Shape tools now behave like pro apps: picking a shape keeps the cursor hot until you cancel with Esc, each drag creates a new object, Shift locks the aspect ratio, and canvas zoom is a real tool—click to zoom in, Alt+click to zoom out, with the Stage scaling accordingly. Alt+drag clones objects, and the pointer always supports marquee selection.
- Inspector updates follow the exact Figma reference: color controls sit under a divider, include H/S/B sliders, opacity row, hex field with swatch popover, and the 3×3 pivot grid now controls transformer anchors instead of repositioning shape frames. Text objects use JetBrains Mono by default, double-click opens inline editing, and text settings stay visible in the sidebar.
- Added grid visibility toggle + fields, filter button on the right side with inline inspector controls, and ensured zoom actually scales the Stage instead of just the objects.

## Next agent checklist
1. Hook the filter “Amount” slider up to real adjustments (currently it only updates the UI state).
2. Expand draw/crop behaviors beyond the drop-in presets (freehand brush, true crop apply).
3. When the user is ready, wire up the disabled load button and integrate photo import, keeping the drag-based insertion UX intact.
