# Image Filter Toolkit - Complete Filter Reference

This document provides a comprehensive list of all filters available in the PixiJS Image Filter Toolkit project.

## Table of Contents
- [Enhanced Layer Editor Filters (TUI)](#enhanced-layer-editor-filters-tui)
- [Color Manipulation Filters (PixiJS)](#color-manipulation-filters-pixijs)
- [Visual Effects Filters (PixiJS)](#visual-effects-filters-pixijs)
- [Advanced Effects Filters (PixiJS)](#advanced-effects-filters-pixijs)

---

## Enhanced Layer Editor Filters (TUI)

These filters are available in the Enhanced Layer Editor using TUI Image Editor.

### Color Effects

#### Grayscale
**Description**: Converts the image to black and white.
**Parameters**: None

#### Sepia
**Description**: Applies a warm, brownish tone reminiscent of old photographs.
**Parameters**: None

#### Invert
**Description**: Inverts all colors in the image (creates a negative effect).
**Parameters**: None

#### Vintage
**Description**: Applies a vintage/retro color effect.
**Parameters**: None

#### Polaroid
**Description**: Simulates the look of Polaroid instant photos.
**Parameters**: None

#### Technicolor
**Description**: Emulates the classic Technicolor film look with enhanced colors.
**Parameters**: None

#### Brownie
**Description**: Applies a brown-tinted nostalgic effect.
**Parameters**: None

#### Kodachrome
**Description**: Simulates the distinctive Kodachrome film color palette.
**Parameters**: None

### Color Overlay

#### Tint
**Description**: Applies a color tint overlay to the image.
**Parameters**:
- `color`: Hex color code (default: #ff0000)
- `opacity`: Tint opacity 0-1 (default: 0.5)

#### Multiply
**Description**: Multiplies the image colors with a selected color.
**Parameters**:
- `color`: Hex color code (default: #ff0000)

#### Blend
**Description**: Blends a color with the image using add mode.
**Parameters**:
- `color`: Hex color code
- `mode`: Blend mode (default: 'add')

### Adjustment Filters

#### Brightness
**Description**: Adjusts the overall brightness of the image.
**Parameters**:
- `brightness`: -1 to 1 (default: 0)

#### Contrast
**Description**: Adjusts the contrast (difference between light and dark).
**Parameters**:
- `contrast`: -1 to 1 (default: 0)

#### Saturation
**Description**: Adjusts color intensity/saturation.
**Parameters**:
- `saturation`: -1 to 1 (default: 0)

### Blur Filters

#### Blur
**Description**: Applies a blur effect to soften the image.
**Parameters**:
- `blur`: 0 to 1 (default: 0.3)

#### Sharpen
**Description**: Enhances edges to make the image appear sharper.
**Parameters**: None

### Artistic Effects

#### Emboss
**Description**: Creates a raised 3D relief effect.
**Parameters**: None

#### Noise
**Description**: Adds random grain/noise to the image.
**Parameters**:
- `noise`: 0 to 1000 (default: 100)

### Distortion Effects

#### Pixelate
**Description**: Creates a pixelated/mosaic effect.
**Parameters**:
- `blocksize`: 2 to 50 pixels (default: 8)

#### Remove White
**Description**: Makes white/light colors transparent.
**Parameters**:
- `distance`: 0 to 1 (default: 0.2) - Threshold for white removal

---

## Color Manipulation Filters (PixiJS)

Available in the Color Manipulation demo page.

### Color Matrix Filter
**Description**: Applies color transformation using a matrix.
**Presets**:
- Normal
- Grayscale
- Sepia
- Negative
- Desaturate
- Vintage
- Polaroid
- Kodachrome
- Technicolor
- Brownie
**Parameters**: Predefined matrix transformations

### HSL Adjustment Filter
**Description**: Adjusts Hue, Saturation, and Lightness independently.
**Parameters**:
- `hue`: -180 to 180 degrees (default: 0)
- `saturation`: -1 to 1 (default: 0)
- `lightness`: -1 to 1 (default: 0)

### Color Replace Filter
**Description**: Replaces one color with another based on tolerance.
**Parameters**:
- `originalColor`: Hex color to replace (default: #ff0000)
- `newColor`: Replacement color (default: #00ff00)
- `tolerance`: 0 to 1 (default: 0.4) - How similar colors must be to match

### Color Overlay Filter
**Description**: Overlays a solid color on the image with alpha blending.
**Parameters**:
- `color`: Hex color code (default: #ff00ff)
- `alpha`: 0 to 1 (default: 0.5)

---

## Visual Effects Filters (PixiJS)

Available in the Visual Effects demo page.

### Glitch Filter
**Description**: Creates digital glitch/distortion effects.
**Parameters**:
- `slices`: 1 to 20 (default: 5) - Number of glitch slices
- `offset`: 0 to 200 (default: 100) - Displacement amount
**Auto-animate**: Yes, refreshes periodically

### CRT Filter
**Description**: Simulates old CRT monitor/TV display.
**Parameters**:
- `curvature`: 0 to 10 (default: 1) - Screen curvature amount
- `lineWidth`: 0 to 5 (default: 1) - Scanline thickness
- `lineContrast`: 0 to 1 (default: 0.25)
- `noise`: 0 to 1 (default: 0.3)
- `vignetting`: 0 to 1 (default: 0.3) - Edge darkening
**Auto-animate**: Yes, animated scanlines

### Old Film Filter
**Description**: Simulates aged film footage with scratches and grain.
**Parameters**:
- `sepia`: 0 to 1 (default: 0.3) - Brown tint intensity
- `noise`: 0 to 1 (default: 0.3) - Film grain amount
- `scratch`: 0 to 1 (default: 0.5) - Scratch intensity
- `vignetting`: 0 to 1 (default: 0.3) - Edge darkening
**Auto-animate**: Yes, animated scratches

### RGB Split Filter
**Description**: Separates and offsets RGB color channels (chromatic aberration).
**Parameters**:
- `red`: [-20, 20] x/y offset (default: [-10, 0])
- `green`: [-20, 20] x/y offset (default: [0, 10])
- `blue`: [-20, 20] x/y offset (default: [10, 0])

### ASCII Filter
**Description**: Converts image to ASCII art using characters.
**Parameters**:
- `size`: 4 to 20 pixels (default: 8) - Character cell size

### Zoom Blur Filter
**Description**: Radial blur emanating from a center point.
**Parameters**:
- `strength`: 0 to 1 (default: 0.1) - Blur intensity
- `center`: [0-1, 0-1] (default: [0.5, 0.5]) - Blur origin point
- `innerRadius`: 0 to 500 (default: 0) - Start radius
- `radius`: -1 (full) or pixels (default: -1) - End radius

### Tilt Shift Filter
**Description**: Creates miniature/selective focus effect.
**Parameters**:
- `blur`: 0 to 200 (default: 100) - Blur amount
- `gradientBlur`: 0 to 1000 (default: 600) - Transition smoothness
- `start`: Y position for focus start (default: 0)
- `end`: Y position for focus end (default: 600)

### Twist Filter
**Description**: Applies a spiral twist distortion.
**Parameters**:
- `radius`: 50 to 500 (default: 200) - Effect radius
- `angle`: 0 to 10 (default: 4) - Twist intensity
- `offset`: [x, y] center point (default: center)

---

## Advanced Effects Filters (PixiJS)

Available in the Advanced Effects demo page.

### Blur Effects

#### Kawase Blur Filter
**Description**: High-quality blur using Kawase algorithm (fast and smooth).
**Parameters**:
- `blur`: 0 to 20 (default: 4) - Blur strength
- `quality`: 1 to 10 (default: 3) - Blur passes

#### Motion Blur Filter
**Description**: Directional blur simulating motion.
**Parameters**:
- `velocity`: [x, y] direction (default: [0, 20])
- `kernelSize`: 5 to 50 (default: 5) - Blur size

#### Radial Blur Filter
**Description**: Circular blur rotating around a center point.
**Parameters**:
- `angle`: 0 to 180 degrees (default: 0)
- `center`: [0-1, 0-1] (default: [0.5, 0.5])
- `radius`: -1 or pixels (default: 100)
- `kernelSize`: 3 to 25 (default: 5)

### Artistic Effects

#### Cross Hatch Filter
**Description**: Pen-and-ink cross-hatching effect.
**Parameters**: None (automatic line detection)

#### Dot Filter
**Description**: Halftone dot pattern (comic book style).
**Parameters**:
- `scale`: 0.1 to 1 (default: 0.5) - Dot size
- `angle`: 0 to 360 degrees (default: 5) - Pattern rotation

#### Emboss Filter
**Description**: 3D raised relief effect.
**Parameters**:
- `strength`: 0 to 20 (default: 5) - Effect intensity

#### Outline Filter
**Description**: Draws a colored outline around the image.
**Parameters**:
- `thickness`: 0 to 10 (default: 1) - Outline width
- `color`: Hex color code (default: #000000)
- `alpha`: 0 to 1 (default: 1) - Outline opacity

#### Grayscale Filter
**Description**: Simple black and white conversion.
**Parameters**: None

#### Bevel Filter
**Description**: Adds beveled edges with lighting.
**Parameters**:
- `rotation`: 0 to 360 degrees (default: 45) - Light direction
- `thickness`: 0 to 10 (default: 2) - Bevel size
- `lightAlpha`: 0 to 1 (default: 0.7) - Highlight intensity
- `shadowAlpha`: 0 to 1 (default: 0.7) - Shadow intensity

### Advanced Lighting

#### Advanced Bloom Filter
**Description**: HDR bloom effect with threshold.
**Parameters**:
- `threshold`: 0 to 1 (default: 0.5) - Brightness threshold
- `bloomScale`: 0 to 5 (default: 1) - Bloom intensity
- `brightness`: 0 to 5 (default: 1) - Overall brightness
- `blur`: 0 to 20 (default: 8) - Bloom blur
- `quality`: 1 to 20 (default: 4) - Blur quality

#### Drop Shadow Filter
**Description**: Adds a realistic drop shadow.
**Parameters**:
- `rotation`: 0 to 360 degrees (default: 45) - Shadow direction
- `distance`: 0 to 50 (default: 5) - Shadow offset
- `blur`: 0 to 20 (default: 2) - Shadow softness
- `alpha`: 0 to 1 (default: 1) - Shadow opacity
- `color`: Hex color code (default: #000000)

#### Godray Filter
**Description**: Volumetric light rays (god rays/crepuscular rays).
**Parameters**:
- `angle`: 0 to 360 degrees (default: 30) - Ray direction
- `gain`: 0 to 1 (default: 0.5) - Ray intensity
- `lacunarity`: 0 to 5 (default: 2.5) - Ray detail
- `time`: Animated over time

#### Simple Lightmap Filter
**Description**: Applies a lightmap texture for lighting.
**Parameters**:
- `color`: Hex color code (default: #ffffff)
- `alpha`: 0 to 1 (default: 1)

### Distortion Effects

#### Bulge Pinch Filter
**Description**: Bulges or pinches the image at a point.
**Parameters**:
- `center`: [0-1, 0-1] (default: [0.5, 0.5]) - Effect center
- `radius`: 50 to 500 (default: 200) - Effect radius
- `strength`: -1 to 1 (default: 0.5) - Positive=bulge, Negative=pinch

#### Shockwave Filter
**Description**: Animated circular shockwave distortion.
**Parameters**:
- `center`: [x, y] pixels (default: center)
- `radius`: Animates outward
- `wavelength`: 20 to 200 (default: 160) - Wave spacing
- `amplitude`: 10 to 100 (default: 30) - Wave height
- `speed`: 100 to 1000 (default: 500) - Animation speed
**Auto-animate**: Yes, expanding wave

#### Reflection Filter
**Description**: Creates a water reflection effect.
**Parameters**:
- `mirror`: true/false (default: true) - Enable mirroring
- `boundary`: 0 to 1 (default: 0.5) - Reflection position
- `amplitude`: [0, 0] to [0, 20] (default: [0, 20]) - Wave height
- `waveLength`: [0, 0] to [100, 100] (default: [30, 100]) - Wave spacing
**Auto-animate**: Yes, animated waves

### Color & Pattern

#### Color Gradient Filter
**Description**: Applies a color gradient overlay.
**Parameters**:
- `type`: 'linear' or 'radial' (default: 'linear')
- `stops`: Array of color stops with position 0-1
- `alpha`: 0 to 1 (default: 1)
- `angle`: 0 to 360 degrees (default: 90) - For linear gradients

#### Simplex Noise Filter
**Description**: Generates Perlin/Simplex noise patterns.
**Parameters**:
- `scale`: 0 to 1 (default: 0.5) - Noise frequency

---

## Filter Combinations

Many filters can be stacked together for complex effects:

### Example Combinations:
- **Vintage Photo**: Sepia + Noise + Vignetting + Old Film
- **Neon Glow**: HSL Adjustment + Advanced Bloom + Color Overlay
- **Miniature**: Tilt Shift + Saturation Boost + Slight Contrast
- **Comic Book**: Dot Filter + Cross Hatch + Outline + High Contrast
- **Dreamy**: Kawase Blur + Bloom + Reduced Saturation
- **Retro TV**: CRT + RGB Split + Noise
- **Underwater**: Color Overlay (blue tint) + Kawase Blur + Godray
- **Thermal Vision**: Color Replace + Grayscale + High Contrast

---

## Performance Notes

### Fast Filters (Real-time on most devices):
- Grayscale, Sepia, Invert
- Brightness, Contrast, Saturation
- Color Overlay, Tint
- Simple blur effects

### Medium Filters (May require optimization):
- Kawase Blur, Radial Blur
- Drop Shadow, Outline
- RGB Split, Zoom Blur
- Cross Hatch, Dot

### Heavy Filters (Use sparingly):
- Advanced Bloom (high quality settings)
- Motion Blur (high kernel size)
- Godray
- Multiple stacked filters
- High-resolution images with multiple effects

---

## Browser Compatibility

All filters require WebGL support:
- Chrome 56+
- Firefox 51+
- Safari 15+
- Edge 79+

Some advanced filters may require WebGL 2.0 for optimal performance.

---

## Credits

- **TUI Image Editor**: Toast UI (NHN Cloud)
- **PixiJS**: Goodboy Digital
- **pixi-filters**: PixiJS Community

Last Updated: 2025-11-15
