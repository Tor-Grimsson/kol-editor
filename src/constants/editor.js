// Canvas defaults
export const DEFAULT_CANVAS = { width: 600, height: 350 }
export const BASE_COLORS = ['#22d3ee', '#f472b6', '#a78bfa', '#4ade80', '#facc15']
export const RULER_STEP = 100

// Toolbar configuration
export const TOOLBAR_LAYOUT = [
  { id: 'select', label: 'Select', dropdown: true },
  { id: 'frame', label: 'Frame', icon: { folder: 'app-icons', name: 'crop-tool-frame' } },
  { id: 'zoom', label: 'Zoom', dropdown: true },
  { type: 'separator', id: 'separator-1' },
  { id: 'flipX', label: 'Flip H' },
  { id: 'flipY', label: 'Flip V' },
  { id: 'rotateLeft', label: 'Rotate Left' },
  { id: 'rotateRight', label: 'Rotate Right' },
  { id: 'align', label: 'Align', dropdown: true, icon: { folder: 'app-icons', name: 'auto-layout-tool-align' } },
  { type: 'separator', id: 'separator-2' },
  { id: 'pen', label: 'Pen' },
  { id: 'draw', label: 'Brush', dropdown: true },
  { id: 'shape', label: 'Shape', dropdown: true },
  { id: 'text', label: 'Text', dropdown: true },
  { id: 'photo', label: 'Photo', icon: { folder: 'app-icons', name: 'photo-02-tool-photo' } },
  { id: 'boolean', label: 'Boolean', dropdown: true },
]

export const TOOL_SUBMENUS = {
  select: [
    { id: 'select-node', label: 'Node', icon: { folder: 'app-icons', name: 'pointer-node-tool-select' } },
  ],
  zoom: [
    { id: 'zoom-in', label: 'Zoom In', icon: { folder: 'app-icons', name: 'zoom-in-tool-zoom' } },
    { id: 'zoom-out', label: 'Zoom Out', icon: { folder: 'app-icons', name: 'zoom-out-tool-zoom' } },
  ],
  draw: [
    { id: 'draw-free', label: 'Free Draw', icon: { folder: 'app-icons', name: 'pencil-tool-draw' } },
    { id: 'draw-line', label: 'Line', icon: { folder: 'app-icons', name: 'pen-tool-draw' } },
  ],
  shape: [
    { id: 'shape-rect', label: 'Rectangle', icon: { folder: 'app-icons', name: 'rectangle-tool-shape' } },
    { id: 'shape-circle', label: 'Circle', icon: { folder: 'app-icons', name: 'circle-tool-shape' } },
    { id: 'shape-triangle', label: 'Triangle', icon: { folder: 'app-icons', name: 'shape-triangle-tool-shape' } },
    { id: 'shape-star', label: 'Star', icon: { folder: 'app-icons', name: 'star-tool-shape' } },
    { id: 'shape-polygon', label: 'Polygon', icon: { folder: 'app-icons', name: 'polygon-tool-shape' } },
  ],
  text: [
    { id: 'text-add', label: 'Add Text', icon: { folder: 'app-icons', name: 'font-01-tool-text' } },
    { id: 'text-path', label: 'Along Path', icon: { folder: 'app-icons', name: 'font-02-tool-text' } },
    { id: 'text-circle', label: 'Around Circle', icon: { folder: 'app-icons', name: 'font-03-tool-text' } },
  ],
  align: [
    { id: 'align-left', label: 'Align Left', icon: { folder: 'app-icons', name: 'align-left-tool-align' } },
    { id: 'align-center', label: 'Align Center', icon: { folder: 'app-icons', name: 'align-center-tool-align' } },
    { id: 'align-right', label: 'Align Right', icon: { folder: 'app-icons', name: 'align-right-tool-align' } },
    { id: 'align-top', label: 'Align Top', icon: { folder: 'app-icons', name: 'align-top-tool-align' } },
    { id: 'align-middle', label: 'Align Middle', icon: { folder: 'app-icons', name: 'align-middle-tool-align' } },
    { id: 'align-bottom', label: 'Align Bottom', icon: { folder: 'app-icons', name: 'align-bottom-tool-align' } },
  ],
  boolean: [
    { id: 'boolean-unite', label: 'Unite', icon: { folder: 'app-icons', name: 'boolean-unite-tool-boolean' } },
    { id: 'boolean-subtract', label: 'Subtract', icon: { folder: 'app-icons', name: 'boolean-minus-front-tool-boolean' } },
    { id: 'boolean-intersect', label: 'Intersect', icon: { folder: 'app-icons', name: 'boolean-intersect-tool-boolean' } },
    { id: 'boolean-exclude', label: 'Exclude', icon: { folder: 'app-icons', name: 'boolean-exclude-tool-boolean' } },
    { id: 'boolean-merge', label: 'Merge', icon: { folder: 'app-icons', name: 'boolean-merge-tool-boolean' } },
    { id: 'boolean-outline', label: 'Outline', icon: { folder: 'app-icons', name: 'boolean-outline-tool-boolean' } },
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
  { id: 'filter-hsl', label: 'HSL', group: 'color-adjustments', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-hsv', label: 'HSV', group: 'color-adjustments', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-brightness', label: 'Brightness', group: 'color-adjustments', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-contrast', label: 'Contrast', group: 'color-adjustments', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-rgb', label: 'RGB', group: 'color-adjustments', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-invert', label: 'Invert', group: 'color-adjustments', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-sepia', label: 'Sepia', group: 'color-adjustments', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-grayscale', label: 'Grayscale', group: 'color-adjustments', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-enhance', label: 'Enhance', group: 'color-adjustments', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-adjustment', label: 'Adjustment', group: 'color-adjustments', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-hsl-adjustment', label: 'HSL Adjustment', group: 'color-adjustments', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-color-gradient', label: 'Color Gradient', group: 'color-adjustments', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-color-map', label: 'Color Map', group: 'color-adjustments', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-color-overlay', label: 'Color Overlay', group: 'color-adjustments', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-color-replace', label: 'Color Replace', group: 'color-adjustments', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-multi-color-replace', label: 'Multi Color Replace', group: 'color-adjustments', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },

  // Blur/Sharpen
  { id: 'filter-blur', label: 'Blur', group: 'blur-sharpen', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-radial-blur', label: 'Radial Blur', group: 'blur-sharpen', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-zoom-blur', label: 'Zoom Blur', group: 'blur-sharpen', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-motion-blur', label: 'Motion Blur', group: 'blur-sharpen', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-kawase-blur', label: 'Kawase Blur', group: 'blur-sharpen', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-tilt-shift', label: 'Tilt Shift', group: 'blur-sharpen', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-backdrop-blur', label: 'Backdrop Blur', group: 'blur-sharpen', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },

  // Displacement
  { id: 'filter-displacement', label: 'Displacement Map', group: 'displacement', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },

  // Distortion
  { id: 'filter-twist', label: 'Twist', group: 'distortion', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-bulge-pinch', label: 'Bulge/Pinch', group: 'distortion', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-shockwave', label: 'Shockwave', group: 'distortion', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },

  // Artistic Effects
  { id: 'filter-pixelate', label: 'Pixelate', group: 'artistic-effects', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-posterize', label: 'Posterize', group: 'artistic-effects', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-solarize', label: 'Solarize', group: 'artistic-effects', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-emboss', label: 'Emboss', group: 'artistic-effects', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-noise', label: 'Noise', group: 'artistic-effects', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-ascii', label: 'ASCII', group: 'artistic-effects', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-cross-hatch', label: 'Cross Hatch', group: 'artistic-effects', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-dot', label: 'Dot Screen', group: 'artistic-effects', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-crt', label: 'CRT', group: 'artistic-effects', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-old-film', label: 'Old Film', group: 'artistic-effects', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-glitch', label: 'Glitch', group: 'artistic-effects', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-rgb-split', label: 'RGB Split', group: 'artistic-effects', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-simplex-noise', label: 'Simplex Noise', group: 'artistic-effects', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },

  // Lighting
  { id: 'filter-bloom', label: 'Bloom', group: 'lighting', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-advanced-bloom', label: 'Advanced Bloom', group: 'lighting', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-glow', label: 'Glow', group: 'lighting', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-godray', label: 'God Ray', group: 'lighting', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-simple-lightmap', label: 'Simple Lightmap', group: 'lighting', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },

  // Stylize
  { id: 'filter-bevel', label: 'Bevel', group: 'stylize', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-drop-shadow', label: 'Drop Shadow', group: 'stylize', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-outline', label: 'Outline', group: 'stylize', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-reflection', label: 'Reflection', group: 'stylize', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },

  // Utility
  { id: 'filter-threshold', label: 'Threshold', group: 'utility', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
  { id: 'filter-convolution', label: 'Convolution', group: 'utility', icon: { folder: 'app-icons', name: 'color-palette-tool-filter' } },
]
