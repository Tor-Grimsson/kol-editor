import { Application, Assets, Sprite, DisplacementFilter } from 'pixi.js'
import {
  AdjustmentFilter,
  AdvancedBloomFilter,
  AsciiFilter,
  BackdropBlurFilter,
  BevelFilter,
  BloomFilter,
  BulgePinchFilter,
  ColorGradientFilter,
  ColorMapFilter,
  ColorOverlayFilter,
  ColorReplaceFilter,
  ConvolutionFilter,
  CrossHatchFilter,
  CRTFilter,
  DotFilter,
  DropShadowFilter,
  EmbossFilter,
  GlitchFilter,
  GlowFilter,
  GodrayFilter,
  GrayscaleFilter,
  HslAdjustmentFilter,
  KawaseBlurFilter,
  MotionBlurFilter,
  MultiColorReplaceFilter,
  OldFilmFilter,
  OutlineFilter,
  PixelateFilter,
  RadialBlurFilter,
  ReflectionFilter,
  RGBSplitFilter,
  ShockwaveFilter,
  SimpleLightmapFilter,
  SimplexNoiseFilter,
  TiltShiftFilter,
  TwistFilter,
  ZoomBlurFilter,
} from 'pixi-filters'

/**
 * Apply a Pixi filter to a Konva node by converting to canvas,
 * applying the filter via Pixi, and returning the filtered image
 */
export async function applyPixiFilterToNode(node, filterType, filterParams) {
  try {
    // Get the node's canvas representation
    const canvas = node.toCanvas()

    // Create a temporary Pixi application
    const app = new Application()
    await app.init({
      width: canvas.width,
      height: canvas.height,
      backgroundColor: 0x000000,
      backgroundAlpha: 0,
    })

    // Load the canvas as a texture
    const texture = await Assets.load(canvas.toDataURL())
    const sprite = new Sprite(texture)

    // For displacement filter, create a displacement map sprite with Perlin-like noise
    let displacementSprite = null
    if (filterType === 'filter-displacement') {
      const noiseCanvas = document.createElement('canvas')
      noiseCanvas.width = canvas.width
      noiseCanvas.height = canvas.height
      const ctx = noiseCanvas.getContext('2d')
      const imageData = ctx.createImageData(canvas.width, canvas.height)

      const frequency = filterParams.frequency || 1
      const octaves = filterParams.octaves || 3
      const persistence = filterParams.persistence || 0.5

      // Generate multi-octave noise
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          let value = 0
          let amplitude = 1
          let freq = frequency / 100

          for (let oct = 0; oct < octaves; oct++) {
            const nx = x * freq
            const ny = y * freq

            // Simple pseudo-random noise based on position
            const noiseValue = (Math.sin(nx * 12.9898 + ny * 78.233) * 43758.5453) % 1
            value += noiseValue * amplitude

            amplitude *= persistence
            freq *= 2
          }

          // Normalize to 0-255
          const normalized = ((value / octaves) * 255) | 0
          const idx = (y * canvas.width + x) * 4
          imageData.data[idx] = normalized
          imageData.data[idx + 1] = normalized
          imageData.data[idx + 2] = normalized
          imageData.data[idx + 3] = 255
        }
      }
      ctx.putImageData(imageData, 0, 0)

      const displacementTexture = await Assets.load(noiseCanvas.toDataURL())
      displacementSprite = new Sprite(displacementTexture)
      app.stage.addChild(displacementSprite)
    }

    // Apply the appropriate filter
    const filter = createPixiFilter(filterType, filterParams, displacementSprite)
    if (filter) {
      sprite.filters = [filter]
    }

    app.stage.addChild(sprite)

    // Render and extract the result
    app.renderer.render(app.stage)
    const resultCanvas = app.renderer.extract.canvas(app.stage)

    // Cleanup
    app.destroy(true)

    return resultCanvas
  } catch (error) {
    console.error('Error applying Pixi filter:', error)
    return null
  }
}

/**
 * Create a Pixi filter instance based on type and parameters
 */
function createPixiFilter(filterType, params, displacementSprite) {
  switch (filterType) {
    // Color Adjustments
    case 'filter-adjustment':
      return new AdjustmentFilter(params)
    case 'filter-hsl-adjustment':
      return new HslAdjustmentFilter(params)
    case 'filter-color-gradient':
      return new ColorGradientFilter(params)
    case 'filter-color-map':
      return new ColorMapFilter(params)
    case 'filter-color-overlay':
      return new ColorOverlayFilter(params)
    case 'filter-color-replace':
      return new ColorReplaceFilter(params)
    case 'filter-multi-color-replace':
      return new MultiColorReplaceFilter(params)

    // Blur
    case 'filter-radial-blur':
      return new RadialBlurFilter(params)
    case 'filter-zoom-blur':
      return new ZoomBlurFilter(params)
    case 'filter-motion-blur':
      return new MotionBlurFilter(params)
    case 'filter-kawase-blur':
      return new KawaseBlurFilter(params)
    case 'filter-tilt-shift':
      return new TiltShiftFilter(params)
    case 'filter-backdrop-blur':
      return new BackdropBlurFilter(params)

    // Displacement
    case 'filter-displacement':
      if (displacementSprite) {
        const filter = new DisplacementFilter({ sprite: displacementSprite })
        filter.scale.x = params.scaleX || 20
        filter.scale.y = params.scaleY || 20
        return filter
      }
      return null

    // Distortion
    case 'filter-twist':
      return new TwistFilter(params)
    case 'filter-bulge-pinch':
      return new BulgePinchFilter(params)
    case 'filter-shockwave':
      return new ShockwaveFilter(params)

    // Artistic
    case 'filter-ascii':
      return new AsciiFilter(params)
    case 'filter-cross-hatch':
      return new CrossHatchFilter(params)
    case 'filter-dot':
      return new DotFilter(params)
    case 'filter-crt':
      return new CRTFilter(params)
    case 'filter-old-film':
      return new OldFilmFilter(params)
    case 'filter-glitch':
      return new GlitchFilter(params)
    case 'filter-rgb-split':
      return new RGBSplitFilter(params)
    case 'filter-simplex-noise':
      return new SimplexNoiseFilter(params)

    // Lighting
    case 'filter-bloom':
      return new BloomFilter(params)
    case 'filter-advanced-bloom':
      return new AdvancedBloomFilter(params)
    case 'filter-glow':
      return new GlowFilter(params)
    case 'filter-godray':
      return new GodrayFilter(params)
    case 'filter-simple-lightmap':
      return new SimpleLightmapFilter(params)

    // Stylize
    case 'filter-bevel':
      return new BevelFilter(params)
    case 'filter-drop-shadow':
      return new DropShadowFilter(params)
    case 'filter-outline':
      return new OutlineFilter(params)
    case 'filter-reflection':
      return new ReflectionFilter(params)

    // Utility
    case 'filter-convolution':
      return new ConvolutionFilter(params)
    case 'filter-pixi-emboss':
      return new EmbossFilter(params)
    case 'filter-pixi-grayscale':
      return new GrayscaleFilter(params)
    case 'filter-pixi-pixelate':
      return new PixelateFilter(params)

    default:
      return null
  }
}

/**
 * Apply a Pixi filter directly to an Image element
 * Used for image fills on shapes
 */
export async function applyPixiFilterToImage(imageElement, filterType, filterParams) {
  try {
    // Create a canvas from the image
    const canvas = document.createElement('canvas')
    canvas.width = imageElement.width
    canvas.height = imageElement.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(imageElement, 0, 0)

    // Create a temporary Pixi application
    const app = new Application()
    await app.init({
      width: canvas.width,
      height: canvas.height,
      backgroundColor: 0x000000,
      backgroundAlpha: 0,
    })

    // Load the canvas as a texture
    const texture = await Assets.load(canvas.toDataURL())
    const sprite = new Sprite(texture)

    // Create the filter
    const filter = createPixiFilter(filterType, filterParams)
    if (!filter) {
      app.destroy(true)
      return null
    }

    sprite.filters = [filter]
    app.stage.addChild(sprite)

    // Render and extract
    app.render()
    const resultCanvas = app.renderer.extract.canvas(app.stage)

    // Cleanup
    app.destroy(true)

    return resultCanvas
  } catch (error) {
    console.error('Failed to apply Pixi filter to image:', error)
    return null
  }
}
