# Session Log – 2025-11-18 (Artboard dragging/rulers)

## Summary
- Added an explicit artboard layer around the Konva Stage: the stage now sits inside a ruler-framed workspace, can be moved or resized via small handles, and the rulers offset/labels reflect the artboard’s X/Y so you can align by looking at the numbers (_mirrors the provided sketch_).
- Implemented artboard drag/resize logic with pointer listeners (move handle + SE resize handle); zoom continues to work through the stage transform while the artboard can be repositioned independently.
- Ruler labels now show absolute coordinates (mark + current artboard offset), and an overlay label shows the artboard’s top-left coordinates in px for quick reference.
- Container height handling fixed (fills the entire middle column), so the workspace hugs the top-left corner without leaving a dead zone.

## Next agent checklist
1. Hook filter “Amount” and advanced draw/crop behaviors as previously noted.
2. Consider keyboard nudging for the artboard and clamping within workspace if the user asks for it.
3. Keep the artboard/ruler coupling in mind when modifying canvas layout—artboardPosition drives both Stage CSS and ruler labeling now.
