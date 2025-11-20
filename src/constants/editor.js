// Canvas defaults
export const DEFAULT_CANVAS = { width: 600, height: 350 }
export const BASE_COLORS = ['#22d3ee', '#f472b6', '#a78bfa', '#4ade80', '#facc15']
export const RULER_STEP = 100

// Toolbar configuration
export const TOOLBAR_LAYOUT = [
  { id: 'select', label: 'Select', dropdown: true },
  { id: 'frame', label: 'Frame', icon: { folder: 'tools-name/other', name: 'crop' } },
  { id: 'zoom', label: 'Zoom', dropdown: true },
  { type: 'separator', id: 'separator-1' },
  { id: 'flipX', label: 'Flip H' },
  { id: 'flipY', label: 'Flip V' },
  { id: 'rotateLeft', label: 'Rotate Left' },
  { id: 'rotateRight', label: 'Rotate Right' },
  { id: 'align', label: 'Align', dropdown: true, icon: { folder: 'tools-name/shape-align', name: 'auto-layout' } },
  { type: 'separator', id: 'separator-2' },
  { id: 'pen', label: 'Pen' },
  { id: 'draw', label: 'Brush', dropdown: true },
  { id: 'shape', label: 'Shape', dropdown: true },
  { id: 'text', label: 'Text', dropdown: true },
  { id: 'boolean', label: 'Boolean', dropdown: true },
]

export const TOOL_SUBMENUS = {
  select: [
    { id: 'select-node', label: 'Node', icon: { folder: 'tools-name/other', name: 'pointer-node' } },
  ],
  zoom: [
    { id: 'zoom-in', label: 'Zoom In', icon: { folder: 'tools-name/other', name: 'zoom-in' } },
    { id: 'zoom-out', label: 'Zoom Out', icon: { folder: 'tools-name/other', name: 'zoom-out' } },
  ],
  draw: [
    { id: 'draw-free', label: 'Free Draw', icon: { folder: 'tools-name/shape-align', name: 'pencil' } },
    { id: 'draw-line', label: 'Line', icon: { folder: 'tools-name/shape-align', name: 'pen' } },
  ],
  shape: [
    { id: 'shape-rect', label: 'Rectangle', icon: { folder: 'tools-name/shape-align', name: 'rectangle' } },
    { id: 'shape-circle', label: 'Circle', icon: { folder: 'tools-name/shape-align', name: 'circle' } },
    { id: 'shape-triangle', label: 'Triangle', icon: { folder: 'tools-name/shape-align', name: 'shape-triangle' } },
    { id: 'shape-star', label: 'Star', icon: { folder: 'tools-name/shape-align', name: 'star' } },
    { id: 'shape-polygon', label: 'Polygon', icon: { folder: 'tools-name/shape-align', name: 'polygon' } },
  ],
  text: [
    { id: 'text-add', label: 'Add Text', icon: { folder: 'tools-name/other', name: 'font=01' } },
    { id: 'text-path', label: 'Along Path', icon: { folder: 'tools-name/other', name: 'font=02' } },
    { id: 'text-circle', label: 'Around Circle', icon: { folder: 'tools-name/other', name: 'font=03' } },
  ],
  align: [
    { id: 'align-left', label: 'Align Left', icon: { folder: 'tools-name/shape-align', name: 'align-left' } },
    { id: 'align-center', label: 'Align Center', icon: { folder: 'tools-name/shape-align', name: 'align-center' } },
    { id: 'align-right', label: 'Align Right', icon: { folder: 'tools-name/shape-align', name: 'align-right' } },
    { id: 'align-top', label: 'Align Top', icon: { folder: 'tools-name/shape-align', name: 'align-top' } },
    { id: 'align-middle', label: 'Align Middle', icon: { folder: 'tools-name/shape-align', name: 'align-middle' } },
    { id: 'align-bottom', label: 'Align Bottom', icon: { folder: 'tools-name/shape-align', name: 'align-bottom' } },
  ],
  boolean: [
    { id: 'boolean-unite', label: 'Unite', icon: { folder: 'tools-name/shape-align', name: 'boolean-unite' } },
    { id: 'boolean-subtract', label: 'Subtract', icon: { folder: 'tools-name/shape-align', name: 'boolean-minus-front' } },
    { id: 'boolean-intersect', label: 'Intersect', icon: { folder: 'tools-name/shape-align', name: 'boolean-intersect' } },
    { id: 'boolean-exclude', label: 'Exclude', icon: { folder: 'tools-name/shape-align', name: 'boolean-exclude' } },
    { id: 'boolean-merge', label: 'Merge', icon: { folder: 'tools-name/shape-align', name: 'boolean-merge' } },
    { id: 'boolean-outline', label: 'Outline', icon: { folder: 'tools-name/shape-align', name: 'boolean-outline' } },
  ],
}

export const FILTER_OPTIONS = [
  { id: 'filter-grayscale', label: 'Grayscale', icon: { folder: 'tools-name/other', name: 'mask' } },
  { id: 'filter-brightness', label: 'Brightness', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-contrast', label: 'Contrast', icon: { folder: 'tools-name/other', name: 'controls' } },
  { id: 'filter-hue', label: 'Shift Hue', icon: { folder: 'tools-name/other', name: 'color-wheel' } },
  { id: 'filter-dim', label: 'Dim', icon: { folder: 'tools-name/other', name: 'mask-2' } },
]
