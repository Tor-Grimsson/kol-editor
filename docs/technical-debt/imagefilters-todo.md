# ImageFilters Library - Implementation TODOs

**File:** `src/lib/imagefilters.js`
**Priority:** Medium
**Status:** Stub functions exist, need implementation

## Unimplemented Filters (lines 264-279)

### 1. Translate Filter
**Line:** 265
**Function:** `ImageFilters.Translate(srcImageData, x, y, interpolation)`

**Purpose:** Translate (offset) image pixels by x,y coordinates

**Implementation needs:**
- Support x,y pixel offset (can be negative)
- Handle edge cases (pixels outside bounds)
- Support interpolation modes: 'nearest', 'bilinear', 'bicubic'
- Return new ImageData with translated content

**Use case:** Pan/shift image content, create offset effects

---

### 2. Scale Filter
**Line:** 268
**Function:** `ImageFilters.Scale(srcImageData, scaleX, scaleY, interpolation)`

**Purpose:** Scale image by scaleX, scaleY factors

**Implementation needs:**
- Scale dimensions by scaleX, scaleY factors (e.g., 0.5 = half size, 2.0 = double)
- Support non-uniform scaling (different X/Y)
- Support interpolation modes: 'nearest', 'bilinear', 'bicubic'
- Create new ImageData with scaled dimensions
- Handle sub-pixel positioning

**Use case:** Resize images, create zoom effects

---

### 3. Rotate Filter
**Line:** 271
**Function:** `ImageFilters.Rotate(srcImageData, originX, originY, angle, resize, interpolation)`

**Purpose:** Rotate image around origin point by angle (radians)

**Implementation needs:**
- Rotate around specified origin point (originX, originY)
- Angle in radians (0 to 2π)
- `resize` flag: if true, expand canvas to fit rotated content; if false, crop to original size
- Support interpolation modes: 'nearest', 'bilinear', 'bicubic'
- Handle edge cases and transparent areas

**Use case:** Rotate images, create rotation effects

---

### 4. Affine Transform Filter
**Line:** 274
**Function:** `ImageFilters.Affine(srcImageData, matrix, resize, interpolation)`

**Purpose:** Apply arbitrary affine transformation matrix

**Implementation needs:**
- Accept 2x3 or 3x3 affine transformation matrix
- Support combined translate/rotate/scale/skew operations
- `resize` flag: expand canvas if needed
- Support interpolation modes
- Handle matrix multiplication for pixel mapping

**Matrix format:**
```
[a, b, c]   where: x' = ax + by + c
[d, e, f]          y' = dx + ey + f
```

**Use case:** Complex transformations, perspective effects, combined operations

---

### 5. UnsharpMask Filter
**Line:** 277
**Function:** `ImageFilters.UnsharpMask(srcImageData, level)`

**Purpose:** Sharpen image using unsharp masking technique

**Implementation needs:**
- Apply Gaussian blur to create mask
- Subtract mask from original (creates high-pass filter)
- Add result back to original at specified level/strength
- `level` parameter controls sharpening strength (0.0 to 1.0+)

**Algorithm:**
```
sharpened = original + level × (original - blurred)
```

**Use case:** Sharpen photos, enhance edges, improve clarity

---

## Enhancement TODOs

### 6. Bilinear Interpolation for DisplacementMapFilter
**Line:** 1197
**Current:** Uses default interpolation
**Enhancement:** Implement bilinear interpolation option

**Benefits:**
- Smoother displacement results
- Better quality for continuous displacement maps
- Reduce pixelation artifacts

**Implementation:**
- Add interpolation mode parameter
- Implement bilinear sample function
- Use weighted average of 4 nearest pixels

---

### 7. Edge Action Handling in Nearest Neighbor
**Line:** 2013
**Current:** Simple nearest neighbor, no edge handling
**Enhancement:** Add edge action modes

**Modes to support:**
- `clamp`: Use edge pixel value (current behavior)
- `wrap`: Wrap around to opposite edge
- `mirror`: Mirror/reflect at edges
- `transparent`: Use transparent pixels outside bounds

**Implementation:**
- Add edge action parameter to transform functions
- Implement coordinate wrapping logic for each mode
- Handle out-of-bounds pixel access gracefully

---

## Implementation Priority

**High Priority:**
1. **Scale** - Most commonly used, needed for zoom/resize
2. **Rotate** - Essential for basic image manipulation
3. **UnsharpMask** - Important for photo editing quality

**Medium Priority:**
4. **Translate** - Useful but can workaround with canvas positioning
5. **Bilinear interpolation** - Quality improvement

**Low Priority:**
6. **Affine** - Advanced feature, can be built from Scale+Rotate+Translate
7. **Edge actions** - Nice-to-have for advanced use cases

---

## Technical Notes

**Interpolation Modes:**
- **Nearest neighbor**: Fastest, lowest quality, good for pixel art
- **Bilinear**: Good balance of speed/quality, smooth results
- **Bicubic**: Highest quality, slowest, best for photos

**Performance Considerations:**
- All filters operate on ImageData pixel arrays
- Consider WebGL/GPU acceleration for real-time use
- May need Web Worker for large images to avoid UI blocking

**Dependencies:**
- Requires existing `ImageFilters.utils` helper functions
- GaussianBlur and BoxBlur already implemented for UnsharpMask
- ConvolutionFilter provides foundation for edge detection

---

## References

- Original library: Based on Java ImageJ filters
- Huxtable.com filters (BoxBlur implementation)
- Mario Klingemann filters (2010)

**Next Steps:**
1. Choose highest priority filter to implement
2. Write unit tests for expected behavior
3. Implement with nearest neighbor first, then add interpolation
4. Benchmark performance on typical image sizes
5. Add to filter UI once stable
