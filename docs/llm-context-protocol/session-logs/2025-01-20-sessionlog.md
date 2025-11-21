# Session Log - 2025-01-20

## Session Summary
Continued work on drag-and-drop layer functionality and file management features. Primary focus was making it easier to nest objects inside canvas layers.

## Tasks Completed

### 1. File Name Editing
- **Request**: Allow user to edit file name in top navigation
- **Implementation**:
  - Changed static `<span>` to editable `<input>` in TopNav component
  - Added `onFileNameChange` prop
  - Connected to `setFileName` state in KolEditor
  - Auto-saves to localStorage every 5 seconds
- **Files**: `src/components/organisms/TopNav.jsx:25-30`, `src/pages/KolEditor.jsx:2549`

### 2. Drag-and-Drop Improvements

#### Problem: Difficult to Drop Objects into Canvas
User reported it was very hard to drag objects into canvas layers - the drop target was too sensitive and items would reorder instead of nesting.

#### Solutions Attempted (Multiple Iterations):

**A. Mouse Position Tracking**
- Added global mouse position tracking via `useRef` + `useEffect` with `mousemove` listener
- Stores `clientX` and `clientY` in ref to avoid re-renders
- Location: `src/components/organisms/LayersSidebar.jsx:46-55`
- Reason: DndContext events don't reliably provide actual mouse coordinates

**B. Prevent Horizontal Scrolling**
- Added `overflow-hidden` to parent container
- Added `overflow-x-hidden` to scrollable area
- Location: `src/components/organisms/LayersSidebar.jsx:265,271`
- Issue: Drag was causing sidebar to scroll/shift horizontally

**C. Constrain Drag Transform**
- Added `modifiers` prop to DndContext
- Sets `transform.x = 0` to disable horizontal dragging
- Location: `src/components/organisms/LayersSidebar.jsx:264-273`
- Reason: Prevents visual horizontal movement during drag

**D. Horizontal Zone Detection**
- Implemented left/right zone logic:
  - Right 60% of layer card: Drop INSIDE only (no reordering)
  - Left 40% of layer card: Reorder before/after
- Uses `relativeX > width * 0.4` check
- Location: `src/components/organisms/LayersSidebar.jsx:197-217`
- Pattern: Standard in Figma/Sketch - most of card area for nesting, small left edge for reordering

**E. Prevent Visual Reordering on Right Side**
- Added separate `dropTargetId` state (line 71)
- When hovering right side:
  - `overId = null` (prevents dnd-kit sortable animation)
  - `dropTargetId = over.id` (shows blue outline)
- When hovering left side:
  - `overId = over.id` (allows reorder animation)
  - `dropTargetId = null`
- Location: `src/components/organisms/LayersSidebar.jsx:200-217, 313`
- Reason: Separation allows outline indicator WITHOUT triggering reorder

**F. Fixed Active Type Detection Bug**
- Changed from checking `layers.some()` to checking `shapes[id].type === 'frame'`
- Bug: Was incorrectly identifying objects as frames
- Location: `src/components/organisms/LayersSidebar.jsx:145-146`
- Impact: Objects can now properly be moved into frames

**G. Visual Feedback Enhancement**
- Updated outline to solid 2px blue when valid drop target
- Fixed CSS conflict (removed duplicate `outline` class)
- Location: `src/components/molecules/LayerItem.jsx:56`

### 3. Fixed Object Duplication Bug
- **Issue**: Dropping same object into frame multiple times created duplicates
- **Fix**: Added early return check `if (object.frameId === targetFrameId) return`
- **Location**: `src/pages/KolEditor.jsx:787`

### 4. Added Debug Logging
Temporary console logs added for debugging:
- Drag start: `src/components/organisms/LayersSidebar.jsx:148`
- Drop events: `src/components/organisms/LayersSidebar.jsx:222,227,231,236`

**TODO**: Remove these before production

## Technical Decisions

### Why Global Mouse Tracking?
- DndContext events don't provide reliable mouse coordinates
- `event.active.rect.current.translated` is the dragged item position, not mouse position
- Global `document.addEventListener('mousemove')` captures actual cursor position
- Stored in `useRef` to prevent re-renders

### Why Separate `dropTargetId` State?
- `overId` controls dnd-kit's internal sortable animation system
- Setting `overId = null` prevents automatic reordering animation
- `dropTargetId` independently controls our blue outline visual feedback
- This separation allows: showing outline on right side WITHOUT triggering reorder movement

### Why Horizontal Position Detection?
- Standard pattern in design tools (Figma, Sketch, Penpot)
- Large target area (60%) makes nesting easy
- Small edge area (40%) for reordering when needed
- Prevents accidental reordering when user wants to nest

## Known Issues

1. **Visual Jitter**: Canvas layer may still show slight movement/jitter on the boundary between left/right zones despite `overId = null`. Root cause: dnd-kit's sortable mechanism designed for full list reordering, not zone-based selective behavior.

2. **Complex Implementation**: Multiple workarounds combined create fragile system:
   - Global mouse tracking
   - Transform constraints
   - Conditional `overId` setting
   - Separate outline state

3. **Debug Code**: Console logs need removal before production

## Files Modified

### Components
- `src/components/organisms/TopNav.jsx` - File name editing input
- `src/components/organisms/LayersSidebar.jsx` - Major drag-and-drop overhaul
- `src/components/molecules/LayerItem.jsx` - Data attribute, outline CSS fix
- `src/components/molecules/ObjectItem.jsx` - Data attribute

### Pages
- `src/pages/KolEditor.jsx` - File name state, duplication fix

## What Works ✅
- Objects can be dropped into canvases
- No duplication
- No horizontal scrolling
- File names editable and persist
- Blue outline shows valid drop target

## What Doesn't Work ⚠️
- Canvas layer shows slight visual movement at left/right zone boundary
- Implementation is complex and fragile

## User Feedback
User expressed frustration with:
- Iterative debugging process taking too long
- Remaining visual issues despite multiple attempts
- Overall complexity of solution

User stated: "ok whatever you clearly can't handle this and I don't want to work on this anymore"

## Recommendations for Next Session

1. **Consider Alternative UX**: Instead of drag-and-drop, use buttons/menus/modals for moving objects between canvases. Would be simpler and more reliable.

2. **Reference Implementation**: Check `_ref/penpot-develop/` for how Penpot handles this

3. **Start Fresh**: If continuing drag-and-drop, consider completely different approach or different library that better supports zone-based dropping

4. **Simplify**: Current implementation has too many workarounds stacked on top of each other

## Context for Continuation

The core functionality is working but with visual polish issues. The user was frustrated by the complexity and remaining problems. If someone picks this up:

- Basic nesting works, but visual feedback isn't perfect
- May want to completely rethink the UX pattern
- Current code is functional but not maintainable long-term
- Consider that drag-and-drop for this use case might not be the right pattern

## Session Stats
- Duration: ~2 hours
- Files Modified: 5
- Major Features: 2 (file editing, drag-and-drop zones)
- Bugs Fixed: 2 (duplication, horizontal scroll)
- Known Issues: 1 (visual jitter)
- User Satisfaction: Low (frustrated with iteration)
