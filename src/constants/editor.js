// Canvas defaults
export const DEFAULT_CANVAS = { width: 1200, height: 700 }
export const BASE_COLORS = ['#22d3ee', '#f472b6', '#a78bfa', '#4ade80', '#facc15']
export const RULER_STEP = 100

// Toolbar configuration
export const TOOLBAR_LAYOUT = [
  { id: 'select', label: 'Select', dropdown: true },
  { id: 'zoom', label: 'Zoom', dropdown: true },
  { id: 'crop', label: 'Crop', dropdown: true },
  { type: 'separator', id: 'separator-1' },
  { id: 'flipX', label: 'Flip H' },
  { id: 'flipY', label: 'Flip V' },
  { id: 'rotateLeft', label: 'Rotate Left' },
  { id: 'rotateRight', label: 'Rotate Right' },
  { type: 'separator', id: 'separator-2' },
  { id: 'draw', label: 'Brush', dropdown: true },
  { id: 'shape', label: 'Shape', dropdown: true },
  { id: 'text', label: 'Text', dropdown: true },
]

export const TOOL_SUBMENUS = {
  select: [
    { id: 'select-marquee', label: 'Marquee', icon: 'shape-square' },
    { id: 'select-pan', label: 'Pan', icon: 'move' },
    { id: 'select-multi', label: 'Multi-select', icon: 'objects-horizontal-center' },
  ],
  zoom: [
    { id: 'zoom-in', label: 'Zoom In', icon: 'plus-medical' },
    { id: 'zoom-out', label: 'Zoom Out (Alt)', icon: 'minus-front' },
  ],
  crop: [
    { id: 'crop-free', label: 'Free', icon: 'trim' },
    { id: 'crop-1-1', label: '1:1', icon: 'grid-small' },
    { id: 'crop-4-3', label: '4:3', icon: 'grid-horizontal' },
    { id: 'crop-16-9', label: '16:9', icon: 'grid-vertical' },
  ],
  draw: [
    { id: 'draw-free', label: 'Free Draw', icon: 'brush' },
    { id: 'draw-line', label: 'Line', icon: 'pen2' },
    { id: 'draw-eraser', label: 'Eraser', icon: 'trash' },
  ],
  shape: [
    { id: 'shape-rect', label: 'Rectangle', icon: 'shape-square' },
    { id: 'shape-circle', label: 'Circle', icon: 'shape-circle' },
    { id: 'shape-triangle', label: 'Triangle', icon: 'shape-triangle' },
    { id: 'shape-star', label: 'Star', icon: 'star' },
    { id: 'shape-polygon', label: 'Polygon', icon: 'shape-polygon' },
  ],
  text: [
    { id: 'text-add', label: 'Add Text', icon: 'pencil' },
    { id: 'text-fonts', label: 'Cycle Font', icon: 'objects-horizontal-center' },
    { id: 'text-styles', label: 'Toggle Bold', icon: 'bold' },
  ],
}

export const FILTER_OPTIONS = [
  { id: 'filter-grayscale', label: 'Grayscale' },
  { id: 'filter-brightness', label: 'Brightness +' },
  { id: 'filter-contrast', label: 'Contrast +' },
  { id: 'filter-hue', label: 'Shift Hue' },
  { id: 'filter-dim', label: 'Dim' },
]
