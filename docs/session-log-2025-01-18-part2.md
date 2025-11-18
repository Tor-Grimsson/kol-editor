# Development Session Log - January 18, 2025 (Part 2)

## Session Overview
Focus: DraftPreview component refactoring, grid alignment fixes, handle coordinate system fixes, and UI cleanup

---

## 1. DraftPreview Component Refactoring

### Motivation
**Issue**: Draft rendering logic was inline in KolEditor.jsx (~60 lines), making the file over 1300 lines and mixing concerns

**Penpot Architecture Pattern**: Penpot uses a dual-layer system with separate components:
- Main render SVG for actual shapes
- Viewport-controls SVG for drafts, selection handlers, measurements, etc.

### Implementation

**Created**: `/src/components/canvas/DraftPreview.jsx`
- Pure component with single responsibility
- Handles frame draft rendering (transparent stroke outline)
- Handles shape draft rendering (semi-transparent fill + stroke)
- Supports all shape types: rect, circle, triangle, star, polygon
- Respects Shift key for square/circle constraints

**Code Structure**:
```javascript
const DraftPreview = ({ draft }) => {
  if (!draft) return null

  if (draft.kind === 'frame') {
    // Render frame preview with blue stroke
  }

  if (draft.kind === 'shape') {
    // Render shape preview based on shapeType
  }
}
```

**Modified Files**:
1. `/src/pages/KolEditor.jsx`
   - Removed 60-line `renderDraft()` function
   - Removed unused imports: `KonvaLayer`, `Stage`, `Transformer`, `RULER_STEP`

2. `/src/components/organisms/CanvasArea.jsx`
   - Added `DraftPreview` import
   - Changed prop from `renderDraft` function to `dragDraft` state
   - Replaced `{renderDraft()}` with `<DraftPreview draft={dragDraft} />`
   - Fixed duplicate `dragDraft` prop (was listed twice causing Babel error)

### Benefits
1. **Separation of Concerns**: Draft rendering isolated from editor logic
2. **Testability**: Component can be tested independently
3. **Reusability**: Can be used in other contexts
4. **Clarity**: Matches professional architecture (Penpot, Figma)
5. **Maintainability**: Easier to understand and modify

---

## 2. Frame Tool Bug Fix

### Issue
Frame tool (F key) was not creating frames when dragging

### Root Cause
`handleStagePointerMove()` only updated `dragDraft` for `kind === 'shape'`, not for `kind === 'frame'`

### Fix
Updated line 652 in KolEditor.jsx:
```javascript
// Before:
if (dragDraft?.kind === 'shape') {

// After:
if (dragDraft?.kind === 'shape' || dragDraft?.kind === 'frame') {
```

### Result
Frame tool now properly tracks mouse movement during drag and creates frames

---

## 3. Grid Alignment Issue

### Issue
Layout grid was not aligned with frame edges - offset by frame position

### Root Cause
Grid was being rendered at absolute coordinates (0, 0) instead of being positioned relative to the selected frame's position

### Fix
Updated `renderDraftGrid()` in KolEditor.jsx (lines 1084-1123):
```javascript
// Added frame position offset
const frameX = selectedFrame.x
const frameY = selectedFrame.y

// Grid columns now positioned at frameX + offset
x={frameX + c * (colWidth + gutter)}

// Grid rows now positioned at frameY + offset
y={frameY + r * (rowHeight + gutter)}
```

### Additional Fix
Grid wasn't being rendered at all! Added `{renderDraftGrid()}` call in CanvasArea.jsx line 114

### Result
Grid now aligns perfectly with frame boundaries when enabled

---

## 4. Handle Alignment Crisis

### The Problem
Resize handles were misaligned with the actual frame edges - they appeared offset by ~30-40px

### Investigation Journey

**Hypothesis 1**: Legacy 16px ruler offset
- Removed `16 +` offset from handle calculations
- **Result**: Handles moved but still not aligned

**Hypothesis 2**: CSS positioning conflict
- User insight: "is it possible that it doesnt want to share space, maybe some div setting, absolute or some other position style"
- **Key realization**: Handles are HTML elements with `position: absolute`, but we were passing Konva world coordinates!

**Hypothesis 3**: Coordinate system mismatch
- **Root cause identified**: Two different coordinate systems fighting each other:
  1. **Konva shapes** use world coordinates (where frame actually is)
  2. **HTML overlays** (border, handles, labels) were using screen coordinates
  3. Passing world coordinates to HTML elements positioned in screen space

### The Solution

**Created coordinate conversion function** in CanvasArea.jsx (lines 48-52):
```javascript
// Convert Konva world coordinates to screen coordinates for HTML overlay handles
const worldToScreen = (worldX, worldY) => ({
  x: worldX * zoomLevel + stagePosition.x,
  y: worldY * zoomLevel + stagePosition.y
})
```

**Applied transformation to all HTML overlays**:

1. **Handles** (lines 62-81):
```javascript
const screenTopLeft = worldToScreen(left, top)
const screenTopRight = worldToScreen(right, top)
// ... etc for all 9 handles
```

2. **Frame border** (lines 190-199):
```javascript
style={{
  width: canvasSize.width * zoomLevel,
  height: canvasSize.height * zoomLevel,
  top: artboardPosition.y * zoomLevel + stagePosition.y,
  left: artboardPosition.x * zoomLevel + stagePosition.x,
}}
```

3. **Size label** (lines 201-210):
```javascript
style={{
  top: (artboardPosition.y + canvasSize.height) * zoomLevel + stagePosition.y + 10,
  left: (artboardPosition.x + canvasSize.width / 2) * zoomLevel + stagePosition.x - 30,
}}
```

### Result
✅ Perfect alignment! Handles now sit exactly on frame edges
✅ Works correctly with zoom and pan
✅ All HTML overlays properly synchronized with Konva shapes

---

## 5. Ghost Frame Bug

### Issue
When deselecting a frame, a "ghost" frame appeared at position (0, 0) at the ruler intersection

### Root Cause
When `selectedFrame` is null, derived values fall back to defaults:
- `canvasSize` returns `DEFAULT_CANVAS` (600×350)
- `artboardPosition` returns `{ x: 0, y: 0 }`

The conditional check was `layers.length > 0` - so overlays showed as long as ANY frame existed in the scene, even when none was selected.

### Fix
Updated condition in CanvasArea.jsx line 139:
```javascript
// Before:
{layers.length > 0 && (

// After:
{layers.length > 0 && selectedLayer && (
```

### Result
✅ Ghost frame disappears when deselecting
✅ Overlays only show when a frame is actually selected

---

## 6. Ruler Removal

### Issue
Fixed rulers at (0, 0) don't make sense for infinite canvas with frames positioned anywhere

### Solution
Removed horizontal ruler, vertical ruler, and position label (CanvasArea.jsx lines 141-187)

**Kept**:
- Blue frame border
- Resize handles
- Size label

**Removed**:
- Horizontal ruler with tick marks
- Vertical ruler with tick marks
- Position label (X: Y:)

### Result
✅ Cleaner UI for infinite canvas
✅ No confusing ruler intersection at (0, 0)

---

## 7. Scrollbar Removal

### Issue
Unwanted horizontal and vertical scrollbars appearing on canvas area

### User Quote
> "bruh who asked for that, I'm saying THERE IS A SCROLLBAR UNVANTED BOTH VERTICALLY AND HORIZONTALLY"

### Fix
Added `overflow-hidden` to containers:

1. **CanvasArea.jsx** line 90:
```javascript
<div className="flex-1 flex flex-col relative min-h-0 overflow-hidden">
```

2. **KolEditor.jsx** line 1254:
```javascript
<div className="flex-1 flex flex-col bg-zinc-950 relative min-h-0 overflow-hidden">
```

### Result
✅ No scrollbars on canvas area
✅ Clean infinite canvas experience

---

## 8. Sidebar Toggle (Reverted)

### Initial Request (Misunderstood)
Conditionally hid sidebar when no frames exist:
```javascript
{(frames.length > 0 || infiniteCanvasShapes.length > 0) && (
  <LayersSidebar ... />
)}
```

### User Clarification
User wanted scrollbars removed, not sidebar hidden

### Fix
Reverted sidebar conditional rendering - sidebar always visible

---

## Key Technical Learnings

### 1. Coordinate System Transformation
**The fundamental issue**: Mixing Konva world coordinates with HTML screen coordinates

**The formula**:
```javascript
screenX = worldX × zoom + stagePan.x
screenY = worldY × zoom + stagePan.y
```

**When to use**:
- Konva shapes → Use world coordinates
- HTML overlays (handles, borders, labels) → Convert to screen coordinates

### 2. Component Architecture Patterns
Following Penpot's approach:
- **Separate layers for different concerns** (shapes vs overlays)
- **Pure components for reusable UI** (DraftPreview)
- **Coordinate transformations at boundary** (where HTML meets Konva)

### 3. State-Driven Rendering
- Overlays should only render when relevant state exists
- `selectedLayer` check prevents ghost rendering
- Defensive programming: check for null before deriving values

---

## Files Modified This Session

### New Files
1. `/src/components/canvas/DraftPreview.jsx` - Draft preview component
2. `/docs/session-log-2025-01-18-part2.md` - This file

### Modified Files
1. `/src/pages/KolEditor.jsx`
   - Removed `renderDraft()` function (60 lines)
   - Fixed `handleStagePointerMove()` to support frame drafts
   - Updated `renderDraftGrid()` with frame position offset
   - Cleaned up unused imports
   - Added `overflow-hidden` to main container

2. `/src/components/organisms/CanvasArea.jsx`
   - Added `DraftPreview` component import
   - Fixed duplicate `dragDraft` prop
   - Added `worldToScreen()` coordinate conversion
   - Updated all HTML overlays to use screen coordinates
   - Added `selectedLayer` check for conditional rendering
   - Removed rulers and position label
   - Added `overflow-hidden` to canvas container
   - Added `{renderDraftGrid()}` call

3. `/src/components/canvas/DraftPreview.jsx` (new)
   - Complete draft rendering component

---

## Current State

### Working Features
✅ Frame tool (F key) creates frames with drag preview
✅ Shape tools (R key for rectangle) create shapes with live preview
✅ DraftPreview component handles all draft rendering
✅ Resize handles perfectly aligned with frame edges
✅ Handles respect zoom and pan transforms
✅ No ghost frame when deselecting
✅ Grid aligns with frame edges (when enabled)
✅ Clean infinite canvas (no rulers, no scrollbars)
✅ Blue border and size label positioned correctly

### Architecture Improvements
✅ Cleaner separation of concerns (DraftPreview component)
✅ Proper coordinate system handling (world → screen conversion)
✅ Conditional rendering based on actual state
✅ Removed legacy offset system (16px rulers)

---

## Known Issues

None currently identified! 🎉

---

## Next Steps

Potential improvements for future sessions:
1. Implement boolean operations (currently disabled)
2. Add crop tool functionality
3. Implement node editing for vectors
4. Add per-frame rulers (if needed)
5. Optimize performance for large canvases (spatial indexing like Penpot)

---

## Session End Notes

**Duration**: ~2 hours

**Major Accomplishments**:
- ✅ DraftPreview component extracted and working
- ✅ Handle alignment completely fixed
- ✅ Coordinate system properly unified
- ✅ Ghost frame bug eliminated
- ✅ UI cleaned up (no rulers, no scrollbars)
- ✅ Grid alignment fixed

**Key Breakthrough**: Understanding the world vs screen coordinate system mismatch was the critical insight that solved the handle alignment issue.

**User Satisfaction**: High - all visual alignment issues resolved, clean UI achieved
