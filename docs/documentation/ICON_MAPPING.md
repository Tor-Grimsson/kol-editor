# Icon Mapping Documentation
## tools-expanded Icon Catalog

This document catalogs all 81 icons in `src/components/icons/svg/tools-expanded/` and shows which ones are currently mapped to toolbar tools.

### Current Toolbar Icon Mapping

```javascript
const iconMap = {
  select: { folder: 'tools-expanded', name: '21' },      // Cursor with pen (pointer tool)
  zoom: { folder: 'tools-expanded', name: '02' },        // Two circles (zoom tool)
  crop: { folder: 'tools-expanded', name: '03' },        // Crop frame
  flipX: { folder: 'tools-expanded', name: '62' },       // Horizontal flip arrows
  flipY: { folder: 'tools-expanded', name: '62' },       // Horizontal flip arrows (same)
  rotateLeft: { folder: 'tools-expanded', name: '33' },  // Rotate arrows
  rotateRight: { folder: 'tools-expanded', name: '33' }, // Rotate arrows (same)
  draw: { folder: 'tools-expanded', name: '22' },        // Pen/brush tool
  shape: { folder: 'tools-expanded', name: '05' },       // Square outline
  text: { folder: 'tools-expanded', name: '11' }         // Letter "A"
}
```

### Complete Icon Index

#### Selection & Navigation Tools
- **01.svg** - Pen/pencil tool (direct selection)
- **21.svg** - Cursor/pointer with pencil ✅ *[MAPPED: select]*
- **76.svg** - Cursor arrow (pointer right)
- **77.svg** - Cursor arrow (pointer left)
- **78.svg** - Cursor with line (click/select)

#### Zoom & View Tools
- **02.svg** - Two circles/zoom ✅ *[MAPPED: zoom]*
- **79.svg** - Magnifying glass (search/zoom)
- **80.svg** - Magnifying glass with minus (zoom out)
- **81.svg** - Magnifying glass with plus (zoom in)

#### Crop & Transform Tools
- **03.svg** - Crop frame ✅ *[MAPPED: crop]*
- **36.svg** - Crop corner

#### Rotate & Flip Tools
- **17.svg** - Diamond with arrow up (rotate/transform)
- **23.svg** - Target/crosshair with refresh (rotate tool)
- **31.svg** - Circle with refresh arrows (rotate)
- **32.svg** - Circular arrows (rotate/refresh)
- **33.svg** - Rotate arrows ✅ *[MAPPED: rotateLeft, rotateRight]*
- **60.svg** - Vertical flip arrows (up/down)
- **62.svg** - Horizontal flip arrows ✅ *[MAPPED: flipX, flipY]*

#### Drawing & Paint Tools
- **22.svg** - Pen/brush tool ✅ *[MAPPED: draw]*
- **25.svg** - Pen/brush (duplicate)
- **26.svg** - Paintbrush with roller
- **74.svg** - Eyedropper/pipette (color picker)
- **27.svg** - Color palette

#### Cutting & Editing Tools
- **75.svg** - Scissors (cutting tool)

#### Shape Tools (Basic)
- **05.svg** - Square outline ✅ *[MAPPED: shape]*
- **06.svg** - Hexagon outline
- **07.svg** - Pentagon outline
- **08.svg** - Triangle outline
- **09.svg** - Circle outline (ellipse)

#### Shape Tools (Special)
- **16.svg** - Butterfly/symmetry (four petals)
- **19.svg** - Diamond with X (close/delete)
- **20.svg** - Letter "A" in triangle/cone

#### Text Tools
- **10.svg** - Double "A" letters (text formatting)
- **11.svg** - Single "A" letter ✅ *[MAPPED: text]*
- **12.svg** - "T" with horizontal lines (text alignment)
- **13.svg** - Italic "T"
- **14.svg** - Italic "I"

#### Layout & Alignment Tools
- **04.svg** - Notepad/document with lines
- **15.svg** - Layers/stack (three rectangles)
- **24.svg** - Components/artboard layout
- **28.svg** - Target/bullseye
- **29.svg** - Arrow down into diamond (download)
- **30.svg** - Arrow up into diamond (upload)
- **34.svg** - Duplicate/copy (two overlapping squares)
- **35.svg** - Multiple layers/stacks
- **37.svg** - Export/save (folder with arrow)
- **38.svg** - Eye (visibility/view)
- **39.svg** - Eye with slash (hide/invisible)
- **49.svg** - Column layout (distribute columns)
- **50.svg** - Column layout variant
- **48.svg** - Grid 4 squares

#### Border & Grid Tools
- **18.svg** - Grid of squares (grid/pixel tool)
- **40.svg** - Dotted line at top (align top)
- **41.svg** - Dotted line on right (align right)
- **42.svg** - Corner border (border radius)
- **43.svg** - Empty square with dots (dotted border)
- **44.svg** - Full square with dots (full border)
- **45.svg** - Dotted left border
- **46.svg** - Cross/plus with dotted border
- **47.svg** - Dotted bottom border

#### Direction & Movement Tools
- **60.svg** - Vertical flip arrows (up/down arrows)
- **61.svg** - All direction arrows (expand/move)
- **63.svg** - Corners/fullscreen (expand outward)
- **64.svg** - Corners/fullscreen (expand inward)
- **65.svg** - Cross/plus (add/intersect)

#### Boolean Operations
- **70.svg** - Half circle (moon/semicircle)
- **71.svg** - Intersection (two overlapping squares, center visible)
- **72.svg** - Subtract/difference (two overlapping squares)
- **73.svg** - Union (two overlapping squares merged)

### Icons Not Yet Cataloged
Files 51-59, 66-69 were not read during this mapping session but are available in the folder.

### Notes
- All icons use `fill="currentColor"` for theme support
- Icons are 24x24 viewBox
- Many rotate/flip operations share the same icon with different orientations handled in code
- Several icons are available for features not yet implemented in the toolbar
