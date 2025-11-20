# Session Log: 2025-11-20 - Drag-and-Drop Reordering Fix

## Summary
Fixed critical drag-and-drop reordering bugs in LayersSidebar that prevented objects from being reordered above canvases and caused items to disappear when moved between containers. Implemented standard dnd-kit pattern based on official tree example.

## Problems Identified
1. **Nested SortableContext anti-pattern**: Using nested `<SortableContext>` components prevented cross-level reordering
2. **Incorrect position detection**: Used pointer position instead of dragged item's center, causing percentage calculations to fail when items shifted during drag
3. **frameId overwrite bug**: Spreading `...item` overwrote newly set `frameId: null` when moving objects to top level, causing items to disappear
4. **Complex percentage-based zones**: 25%/75% threshold detection was unreliable with dynamic layout shifts

## Solution Implemented
Switched to **standard dnd-kit pattern** from official tree example:

### 1. Flattened Structure (Already Done)
- Single `SortableContext` with all items in flat array
- Each item has `depth` property for indentation
- Items only appear if parent is expanded

### 2. Index-Based Position Detection (LayersSidebar.jsx:137-183)
**Removed:**
- Pointer/cursor position calculations
- Percentage-based zones (top 25%, bottom 75%, middle 50%)
- Center-based collision attempts using `active.rect.current.translated`

**Implemented:**
```javascript
const overIndex = flattenedItems.findIndex(item => item.id === over.id)
const activeIndex = flattenedItems.findIndex(item => item.id === active.id)
const isMovingUp = activeIndex > overIndex

if (isMovingUp) {
  setDropPosition('before')  // Insert before target
} else {
  setDropPosition('after')   // Insert after target
}
```

Special case: Collapsed frames allow nesting when moving down

### 3. Fixed frameId Overwrite Bug (KolEditor.jsx:823-831)
**Before:**
```javascript
reordered.forEach((item, index) => {
  updates[item.id] = { ...updates[item.id], ...item, order: index }  // BUG: ...item overwrites frameId
})
```

**After:**
```javascript
reordered.forEach((item, index) => {
  if (item.id === activeId) {
    // Already updated with new frameId, just update order
    updates[item.id] = { ...updates[item.id], order: index }
  } else {
    // Other items: normal spread
    updates[item.id] = { ...item, order: index }
  }
})
```

### 4. Unified Top-Level List (KolEditor.jsx:100-124)
**Changed `frames` computation:**
- Now includes ALL top-level items (frames AND objects)
- Removed separate "infinite canvas shapes" section
- Everything sorted by `order` property in single unified list

**Before:**
- Frames at top (forced hierarchy)
- Infinite canvas objects at bottom (separate section)

**After:**
- Complete freedom: objects and canvases mixed at same level
- User has full control over ordering

## Files Modified
1. **src/components/organisms/LayersSidebar.jsx**
   - Line 137-183: Simplified `handleDragOver` with index-based logic
   - Removed: InfiniteCanvasDropzone, InfiniteCanvasDropzoneTop components
   - Removed: `infiniteCanvasShapes` prop
   - Removed: `useDroppable` import (no longer needed)

2. **src/components/molecules/LayerItem.jsx**
   - Removed: nested children rendering
   - Added: `marginLeft: ${nestLevel * 16}px` for flat indentation
   - Cleaned up unused props (onMoveUp, onMoveDown, onDelete, canMoveUp, canMoveDown, children)
   - Added: chevron icon for expand/collapse (chevron-right/chevron-down)

3. **src/components/molecules/ObjectItem.jsx**
   - Added: `marginLeft: ${nestLevel * 16}px` for consistent indentation

4. **src/pages/KolEditor.jsx**
   - Line 100-124: Updated `frames` to include all top-level items (frames + objects)
   - Line 767-865: Fixed `handleInsertItem` frameId overwrite bug
   - Line 804-826: Updated reorder logic to handle mixed frames/objects at top level
   - Removed: `infiniteCanvasShapes` prop passing to LayersSidebar

## Research Conducted
1. **DEV.to Tutorial** (December 2024 by Fupeng Wang): Confirmed flattened approach with `ancestorIds` tracking
2. **Official dnd-kit docs**: Verified `closestCenter` collision detection recommended for sortable lists
3. **Official dnd-kit tree example** (GitHub): Studied `SortableTree.tsx` implementation:
   - Uses simple `arrayMove` with indices
   - No percentage calculations
   - Index comparison determines before/after: `activeIndex > overIndex` = moving up = insert before
   - Uses `getProjection()` for depth calculation based on horizontal drag offset

## Testing Performed
- Added debug logging to trace:
  - Drag over events (activeIndex, overIndex, item types)
  - handleInsertItem calls (activeId, overId, position)
  - Target level items composition
  - Final state updates
- Verified percentage calculations were failing (240%!) due to pointer vs item position
- Confirmed frameId was being overwritten by spread operator
- All debug logs removed after fixes verified

## Technical Debt Addressed
- Removed complex percentage-based drop zone detection
- Simplified drag event handling to match standard dnd-kit patterns
- Fixed data consistency bugs in state updates
- Unified top-level list handling (no more special cases for "infinite canvas")

## Status
✅ **COMPLETE** - Objects can now be freely reordered above/below canvases, nesting works correctly, and items no longer disappear when moved between containers.

## Next Actions
None - feature is working as intended with standard dnd-kit pattern.
