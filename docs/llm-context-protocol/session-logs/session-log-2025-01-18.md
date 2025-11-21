# Development Session Log - January 18, 2025

## Session Overview
Focus: Toolbar icon mapping, frame/shape architecture improvements, and Frame tool implementation

---

## 1. Icon System Updates

### Fixed Icon Fill Colors
**Issue**: SVG icons had hardcoded `fill="#fff"` and `fill="#FAFAFA"` instead of `fill="currentColor"`

**Files Modified**:
- All SVG files in `/src/components/icons/svg/tools-name/other/`
- All SVG files in `/src/components/icons/svg/tools-name/shape-align/`

**Commands Used**:
```bash
find /path/to/tools-name -name "*.svg" -type f -exec sed -i '' 's/fill="#fff"/fill="currentColor"/g' {} \;
find /path/to/shape-align -name "*.svg" -exec sed -i '' 's/fill="#FAFAFA"/fill="currentColor"/g' {} \;
```

### Updated Icon Mappings
**File**: `/src/constants/editor.js`

Updated `TOOL_SUBMENUS` with correct icon paths:
- Boolean operations: unite, subtract, intersect, exclude, merge, outline
- Shape tools: rectangle, circle, triangle, star, polygon
- Text tools: font=01, font=02, font=03
- Draw tools: pencil, pen
- Zoom tools: zoom-in, zoom-out
- Select tools: pointer-selector, pointer-node (disabled)

---

## 2. Toolbar Configuration

### Created Documentation
**File**: `/docs/1.0.4-toolbar.md`

Documented complete toolbar structure with:
- Tool groups and their icons
- Subtools for each dropdown
- Hyperlinks to actual SVG files
- Reference table of toolbar layout

### Disabled Unimplemented Tools
**Files Modified**:
- `/src/constants/editor.js` - Added `disabled: true` flags
- `/src/components/molecules/ToolButton.jsx` - Added disabled state styling
- `/src/components/organisms/Toolbar.jsx` - Pass disabled prop

**Disabled Tools**:
- Boolean tool group (not wired up yet)
- Crop tool (not implemented)
- Node selector subtool (vector editing not ready)

**Styling**: Grey out with 40-50% opacity, "Coming soon" tooltip

---

## 3. Dropdown Improvements

### Fixed Dropdown Auto-Close
**Issue**: Dropdown didn't close when selecting a subtool

**Root Cause**: `onToggleDropdown()` was called without `toolId` parameter, causing toggle check to fail

**Solution**: Removed redundant `onToggleDropdown()` call from subtool click handler in ToolButton.jsx. The `handleToolbarButton` already closes dropdown via `setDropdownState(dropdownDefaults)`.

### Updated Dropdown Styling
**File**: `/src/components/molecules/ToolButton.jsx`

Changed to match sidebar:
- Background: `bg-zinc-900` (was `bg-zinc-800`)
- Border: `border-zinc-800` (was `border-zinc-700`)
- Hover: `hover:bg-zinc-800` (was `hover:bg-zinc-700`)

---

## 4. Canvas/Frame Architecture Changes

### Canvas Size Adjustments
**File**: `/src/constants/editor.js`

Changed `DEFAULT_CANVAS` from `{ width: 1200, height: 700 }` to `{ width: 600, height: 350 }`

**Issue Found**: Local constant in KolEditor.jsx was overriding the import

**Solution**:
- Removed local `DEFAULT_CANVAS`, `BASE_COLORS`, `RULER_STEP` constants
- Import them from `/src/constants/editor.js` instead

### Frame Background Changes
**File**: `/src/pages/KolEditor.jsx`

**Initial**: `background: 'transparent'`
**Problem**: Transparent fills don't catch pointer events reliably in Konva
**Solution**: `background: 'rgba(255, 255, 255, 0.02)'` - visually transparent but interactive

### Frame Positioning
**Updated**: `handleAddFrame()` in KolEditor.jsx

- First frame: Centered in viewport using stage dimensions and zoom level
- Subsequent frames: Offset 40px from previous frame
- Calculation accounts for zoom level and stage position

---

## 5. Multi-Select Implementation

### Added Multi-Select State
**File**: `/src/pages/KolEditor.jsx`

Added: `const [selectedShapeIds, setSelectedShapeIds] = useState([])`

### Shift+Click to Add/Remove
**Function**: `handleCanvasSelection(frameId, shapeId, event)`

Behavior:
- **Normal click**: Single select, clear multi-select
- **Shift+click**: Add to selection or start multi-select
- **Shift+click selected**: Remove from selection

### Cmd+A to Select All
**Keyboard Handler**: Lines 200-220

- In frame: Select all visible children of current frame
- On infinite canvas: Select all shapes not in frames
- Filters out hidden shapes

### Multi-Select Operations
- **Transformer**: Updated to handle multiple nodes simultaneously
- **Drag**: Move all selected shapes together, preserving relative positions
- **Delete**: Remove all selected shapes and update parent frame children arrays

---

## 6. Deselection Improvements

### Click Empty Space to Deselect
**Updated Functions**:
- `handleStagePointerDown()` - Click stage background deselects all
- `handleArtboardBackgroundClick()` - Click frame background (now selects frame, not deselects)
- `onLayerSelect(null, null)` - Click empty sidebar area deselects all

### Escape Key to Deselect
**Keyboard Handler**: Lines 279-284

Pressing Escape:
- Clears `selectedShapeId`
- Clears `selectedShapeIds`
- Cancels pending inserts
- Clears drag drafts

---

## 7. Shape Drawing Improvements

### Live Shape Preview
**Function**: `renderDraft()` - Lines 1073-1125

Changed from generic rectangle marquee to actual shape preview:
- **Rectangle**: Rect with blue fill/stroke
- **Circle**: Circle with radius based on bounds
- **Triangle**: RegularPolygon with 3 sides
- **Star**: Star with 5 points
- **Polygon**: RegularPolygon with 6 sides

Preview style: `fill: 'rgba(14,165,233,0.2)', stroke: '#38bdf8', strokeWidth: 2`

### Keyboard Shortcut
**Added**: Press **R** to activate Rectangle tool

---

## 8. Penpot Architecture Research

### Research Task
Analyzed Penpot codebase at `_ref/penpot-develop` to understand frame/shape selection architecture

### Key Findings

**1. Frames are Just Shapes**
- Frames have `type: 'frame'` - not a special class
- All shapes have `parent-id` and `frame-id` properties
- Frames contain a `:shapes` vector of child IDs
- No special container behavior needed

**2. Selection Query System**
- Worker-based spatial query using quadtree index
- Hover detection happens at viewport level, not per-shape
- Mouse creates small rect (5px / zoom) around cursor
- Worker queries index for shapes in that rect
- Z-sorting and filtering happen in application code

**3. Modifier Key Behavior**
- Pressing Cmd/Ctrl changes `bottom-frames?` parameter
- This sorts frames to bottom of z-order
- Allows "clicking through" frames to select children
- Same query system, different sorting

**4. Frame Selection**
- Frame backgrounds ARE selectable by default
- No `pointer-events: none` on frames
- Query filtering (`include-frames?`) controls visibility
- Frames participate in selection like any other shape

**5. Deselection is State-Based**
- Clicking empty space triggers `deselect-all` action
- Clears selection state and interrupts operations
- No complex event bubbling logic needed

---

## 9. Frame Tool Implementation

### Added Dedicated Frame Tool
**Rationale**: Professional design tools (Figma, Framer, Graphite) separate frame creation from selection

**Files Modified**:
- `/src/constants/editor.js` - Added frame to TOOLBAR_LAYOUT
- `/src/components/organisms/Toolbar.jsx` - Added frame icon mapping
- `/src/pages/KolEditor.jsx` - Implemented frame tool behavior

**Icon**: `{ folder: 'tools-name/shape-align', name: 'square' }`

### Frame Tool Behavior
**Keyboard Shortcut**: **F**

**Workflow**:
1. Press F or click Frame tool
2. Drag on canvas to draw frame bounds
3. Hold Shift for square proportions
4. Release to create frame
5. Automatically return to Select tool

**Implementation**:
- `handleStagePointerDown()` - Detect `activeTool === 'frame'`, start drag
- `finalizeFrameDraft()` - Create frame at drag bounds
- `renderDraft()` - Show blue stroke preview while dragging

### Frame Creation Logic
**Function**: `finalizeFrameDraft()` - Lines 690-710

- Minimum size: 10x10 pixels
- Position: Top-left of drag bounds
- Size: Width/height of drag bounds (or square if Shift held)
- Properties: `frameId: null`, `parentId: null` (root level)
- Auto-selects new frame and expands in layers panel

---

## 10. Frame Selection Fixes (Based on Penpot Research)

### Frame Background Visibility
**File**: `/src/pages/KolEditor.jsx`

Changed frame default background from `'transparent'` to `'rgba(255, 255, 255, 0.02)'`

**Reasoning**: Very subtle fill ensures Konva pointer events work correctly

**File**: `/src/components/organisms/CanvasArea.jsx`

Added visible stroke: `stroke: '#3f3f46', strokeWidth: 0.5`

### Click Frame to Select Frame
**Updated**: `handleArtboardBackgroundClick(e, frameId)`

**Old Behavior**: Clicking frame background deselected everything
**New Behavior**: Clicking frame background selects the frame

**Implementation**: Pass `frameId` to handler, set as selected

### Cmd/Ctrl to Click Through Frames
**Updated**: `handleArtboardBackgroundClick(e, frameId)`

**New Behavior**:
- When holding Cmd/Ctrl, don't stop event propagation
- Allows clicking shapes underneath frame
- Mimics Figma/Framer behavior

**Code**:
```javascript
if (e.evt?.metaKey || e.evt?.ctrlKey) {
  // Don't stop propagation - let it bubble to shapes below
  return
}
```

### Frame Background Listening
**File**: `/src/components/organisms/CanvasArea.jsx`

**Added**: `listening={activeTool === 'select'}`

**Reasoning**:
- Frame backgrounds only catch events in Select tool
- When using Frame tool, Shape tools, or Draw tools, events pass through to stage
- Allows drawing over existing frames

**Pass activeTool**: Added `activeTool` prop to CanvasArea from KolEditor

---

## 11. Current Issues & Debug Steps

### Frame Tool Not Working
**Symptom**: Pressing F and dragging doesn't create a frame

**Hypothesis**: Frame background or child shapes are blocking pointer events from reaching stage

**Debug Added**: Console log in `handleStagePointerDown()`:
```javascript
if (activeTool === 'frame') {
  console.log('Frame tool active, starting drag at', pointer)
  ...
}
```

**Next Steps**:
1. Check browser console for "Frame tool active..." message
2. If message doesn't appear: Something is blocking event
3. If message appears: Issue is in draft/finalization logic

**Potential Causes**:
- Frame children shapes have `listening: true` and block events
- Need to also set `listening: false` on child shapes when not in select mode
- Stage pointer events not properly wired up

---

## 12. Architecture Improvements Summary

### Clear Tool Separation
- **Select (V)**: Select and manipulate existing objects
- **Frame (F)**: Create new frames/artboards
- **Shape (R)**: Create shapes inside frames
- **Text (T)**: Add text objects
- **Draw**: Freehand and line drawing

### Frame vs Shape Hierarchy
- **Frames**: Root-level containers (`frameId: null`, `parentId: null`)
- **Shapes**: Live inside frames (have `frameId` and `parentId`)
- Frames can be nested (frame inside another frame)

### Selection Model
- Single selection: `selectedShapeId`
- Multi-selection: `selectedShapeIds` array
- Frame selection: Can select frame itself or children inside
- Modifier keys: Cmd/Ctrl for "click through" frames

---

## Files Modified This Session

### New Files
- `/docs/1.0.4-toolbar.md` - Toolbar documentation
- `/docs/session-log-2025-01-18.md` - This file

### Modified Files
1. `/src/constants/editor.js` - Canvas defaults, toolbar layout, tool submenus
2. `/src/components/organisms/Toolbar.jsx` - Icon map, frame tool
3. `/src/components/molecules/ToolButton.jsx` - Disabled state, dropdown fixes
4. `/src/pages/KolEditor.jsx` - Multi-select, frame tool, deselection, Penpot fixes
5. `/src/components/organisms/CanvasArea.jsx` - Frame background, activeTool prop
6. `/src/components/organisms/LayersSidebar.jsx` - Click empty to deselect

### SVG Files
- All icons in `/src/components/icons/svg/tools-name/other/`
- All icons in `/src/components/icons/svg/tools-name/shape-align/`

---

## Known Issues

1. **Frame tool not creating frames when dragging**
   - Debug logging added
   - Suspect event blocking by frame backgrounds or child shapes
   - Need to test with console.log output

2. **Node selector subtool disabled**
   - Vector editing not implemented yet
   - Marked as "Coming soon"

3. **Boolean operations disabled**
   - Logic not wired up in handleToolOption
   - Marked as "Coming soon"

4. **Crop tool disabled**
   - Not implemented yet
   - Marked as "Coming soon"

---

## Next Steps

1. **Debug frame tool issue**
   - Check console logs
   - Verify event propagation
   - Consider setting `listening: false` on all shapes when not in select mode

2. **Test multi-select with nested frames**
   - Ensure selections work across frame boundaries
   - Test Cmd+A in different contexts

3. **Implement missing features**
   - Boolean operations
   - Crop tool
   - Node editing for vectors

4. **Performance optimization**
   - Consider implementing spatial index like Penpot
   - Optimize selection queries for large canvases

---

## Key Learnings

1. **Don't rely on SVG pointer-events for selection** - Use computed queries instead
2. **Frames should be selectable by default** - Use modifier keys for click-through
3. **Tool separation clarifies UX** - Frame tool vs Select tool is clearer
4. **Transparent fills need special handling** - Use very subtle fill (0.02 alpha) for interactivity
5. **Event propagation matters** - Carefully control which elements listen to pointer events
6. **Import centralization prevents bugs** - Don't duplicate constants locally

---

## Session End Notes

Total duration: ~4 hours
Major accomplishments:
- ✅ Icon system fully mapped and documented
- ✅ Multi-select with Shift+click and Cmd+A
- ✅ Deselection improvements
- ✅ Penpot architecture research and implementation
- ✅ Frame tool added to toolbar
- ⚠️ Frame tool creation needs debugging

Next session should focus on:
- Resolving frame tool pointer event issue
- Testing all multi-select scenarios
- Implementing boolean operations

---

## Session Continuation - Frame Tool Fix

### Frame Tool Bug Fix
**Issue**: Frame tool (F key) was not creating frames when dragging

**Root Cause**: `handleStagePointerMove()` only updated `dragDraft` for `kind === 'shape'`, not for `kind === 'frame'`

**Fix**: Updated line 652 in KolEditor.jsx:
```javascript
// Before:
if (dragDraft?.kind === 'shape') {

// After:
if (dragDraft?.kind === 'shape' || dragDraft?.kind === 'frame') {
```

**Result**: Frame tool now properly tracks mouse movement during drag and creates frames

### Added F Key Shortcut
**Location**: KolEditor.jsx lines 291-295

Added keyboard handler for F key to activate frame tool:
```javascript
if (event.key === 'f' || event.key === 'F') {
  setActiveTool('frame')
  setDropdownState(dropdownDefaults)
  setPendingInsert(null)
}
```

**Workflow**: Press F → Drag on canvas → Frame is created → Automatically returns to Select tool

---

## Component Refactoring - DraftPreview

### Extracted Draft Rendering to Separate Component
**Issue**: Draft rendering logic was inline in KolEditor.jsx, making the file over 1300 lines and mixing concerns

**Penpot Pattern**: Penpot uses a dual-layer system with separate components for overlays:
- Main render SVG for actual shapes
- Viewport-controls SVG for drafts, selection handlers, measurements

**Solution**: Created dedicated `DraftPreview` component following professional architecture patterns

### Files Created
**`/src/components/canvas/DraftPreview.jsx`**
- Handles frame draft rendering (transparent stroke outline)
- Handles shape draft rendering (semi-transparent fill + stroke)
- Supports all shape types: rect, circle, triangle, star, polygon
- Respects Shift key for square/circle constraints
- Pure component with single responsibility

### Files Modified
**`/src/pages/KolEditor.jsx`**
- Removed 60-line `renderDraft()` function
- Removed unused imports: `KonvaLayer`, `Stage`, `Transformer`, `RULER_STEP`
- Cleaner, more maintainable code

**`/src/components/organisms/CanvasArea.jsx`**
- Added `DraftPreview` import
- Changed prop from `renderDraft` function to `dragDraft` state
- Replaced `{renderDraft()}` with `<DraftPreview draft={dragDraft} />`

### Benefits
1. **Separation of Concerns**: Draft rendering is now isolated from editor logic
2. **Testability**: DraftPreview can be tested independently
3. **Reusability**: Component can be used in other contexts
4. **Clarity**: Clear component hierarchy matches professional tools (Penpot, Figma)
5. **Maintainability**: Easier to understand and modify draft behavior
