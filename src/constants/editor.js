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
  { id: 'photo', label: 'Photo', icon: { folder: 'a1', name: 'photo-02' } },
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

// Filter groups
export const FILTER_GROUPS = [
  { id: 'color-adjustments', label: 'Color Adjustments' },
  { id: 'blur-sharpen', label: 'Blur/Sharpen' },
  { id: 'displacement', label: 'Displacement' },
  { id: 'distortion', label: 'Distortion' },
  { id: 'artistic-effects', label: 'Artistic Effects' },
  { id: 'lighting', label: 'Lighting' },
  { id: 'stylize', label: 'Stylize' },
  { id: 'utility', label: 'Utility' },
]

export const FILTER_OPTIONS = [
  // Color Adjustments - Konva native filters
  { id: 'filter-hsl', label: 'HSL', group: 'color-adjustments', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-hsv', label: 'HSV', group: 'color-adjustments', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-brightness', label: 'Brightness', group: 'color-adjustments', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-contrast', label: 'Contrast', group: 'color-adjustments', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-rgb', label: 'RGB', group: 'color-adjustments', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-invert', label: 'Invert', group: 'color-adjustments', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-sepia', label: 'Sepia', group: 'color-adjustments', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-grayscale', label: 'Grayscale', group: 'color-adjustments', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-enhance', label: 'Enhance', group: 'color-adjustments', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-adjustment', label: 'Adjustment', group: 'color-adjustments', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-hsl-adjustment', label: 'HSL Adjustment', group: 'color-adjustments', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-color-gradient', label: 'Color Gradient', group: 'color-adjustments', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-color-map', label: 'Color Map', group: 'color-adjustments', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-color-overlay', label: 'Color Overlay', group: 'color-adjustments', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-color-replace', label: 'Color Replace', group: 'color-adjustments', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-multi-color-replace', label: 'Multi Color Replace', group: 'color-adjustments', icon: { folder: 'tools-name/other', name: 'color-palette' } },

  // Blur/Sharpen
  { id: 'filter-blur', label: 'Blur', group: 'blur-sharpen', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-radial-blur', label: 'Radial Blur', group: 'blur-sharpen', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-zoom-blur', label: 'Zoom Blur', group: 'blur-sharpen', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-motion-blur', label: 'Motion Blur', group: 'blur-sharpen', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-kawase-blur', label: 'Kawase Blur', group: 'blur-sharpen', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-tilt-shift', label: 'Tilt Shift', group: 'blur-sharpen', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-backdrop-blur', label: 'Backdrop Blur', group: 'blur-sharpen', icon: { folder: 'tools-name/other', name: 'color-palette' } },

  // Displacement
  { id: 'filter-displacement', label: 'Displacement Map', group: 'displacement', icon: { folder: 'tools-name/other', name: 'color-palette' } },

  // Distortion
  { id: 'filter-twist', label: 'Twist', group: 'distortion', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-bulge-pinch', label: 'Bulge/Pinch', group: 'distortion', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-shockwave', label: 'Shockwave', group: 'distortion', icon: { folder: 'tools-name/other', name: 'color-palette' } },

  // Artistic Effects
  { id: 'filter-pixelate', label: 'Pixelate', group: 'artistic-effects', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-posterize', label: 'Posterize', group: 'artistic-effects', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-solarize', label: 'Solarize', group: 'artistic-effects', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-emboss', label: 'Emboss', group: 'artistic-effects', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-noise', label: 'Noise', group: 'artistic-effects', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-ascii', label: 'ASCII', group: 'artistic-effects', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-cross-hatch', label: 'Cross Hatch', group: 'artistic-effects', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-dot', label: 'Dot Screen', group: 'artistic-effects', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-crt', label: 'CRT', group: 'artistic-effects', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-old-film', label: 'Old Film', group: 'artistic-effects', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-glitch', label: 'Glitch', group: 'artistic-effects', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-rgb-split', label: 'RGB Split', group: 'artistic-effects', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-simplex-noise', label: 'Simplex Noise', group: 'artistic-effects', icon: { folder: 'tools-name/other', name: 'color-palette' } },

  // Lighting
  { id: 'filter-bloom', label: 'Bloom', group: 'lighting', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-advanced-bloom', label: 'Advanced Bloom', group: 'lighting', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-glow', label: 'Glow', group: 'lighting', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-godray', label: 'God Ray', group: 'lighting', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-simple-lightmap', label: 'Simple Lightmap', group: 'lighting', icon: { folder: 'tools-name/other', name: 'color-palette' } },

  // Stylize
  { id: 'filter-bevel', label: 'Bevel', group: 'stylize', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-drop-shadow', label: 'Drop Shadow', group: 'stylize', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-outline', label: 'Outline', group: 'stylize', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-reflection', label: 'Reflection', group: 'stylize', icon: { folder: 'tools-name/other', name: 'color-palette' } },

  // Utility
  { id: 'filter-threshold', label: 'Threshold', group: 'utility', icon: { folder: 'tools-name/other', name: 'color-palette' } },
  { id: 'filter-convolution', label: 'Convolution', group: 'utility', icon: { folder: 'tools-name/other', name: 'color-palette' } },
]
