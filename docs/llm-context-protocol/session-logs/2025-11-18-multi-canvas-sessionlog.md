# Session Log – 2025-11-18 (Multi-canvas artboards)

## Summary
- Layers are now called “Canvas” and each entry represents an artboard with its own frame + background color. Selecting a canvas updates the ruler/Stage frame, and the canvas background color can be edited from the inspector.
- Added `createCanvasDescriptor` plus selection syncing so multiple canvases can exist; the selected canvas is the one rendered on screen and tied to the rulers/transform handles.
- Canvas move/resize/size-dialog events update the active canvas frame, so switching canvases swaps the artboard/ruler context instantly.
- Escape / clicking on empty space now only clears object selection (canvas stays selected), matching standard editor behavior.

## Next agent checklist
1. Implement true nested canvases/groups if required: right now canvases are top-level artboards only.
2. Consider UI for setting different backgrounds per canvas directly from the sidebar.
3. Keep using `createCanvasDescriptor` when adding canvases so frames/backgrounds stay consistent.
