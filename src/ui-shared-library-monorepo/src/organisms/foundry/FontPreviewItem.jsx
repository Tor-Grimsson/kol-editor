import { useState, useRef, useLayoutEffect, useCallback, useEffect } from 'react'
import { FontControlsPanel, DisplaySpecimen } from '../../molecules/foundry/index.js'
import Divider from '../../atoms/Divider.jsx'

const DEFAULT_SIZE = 96

/**
 * FontPreviewItem - Interactive font preview organism
 *
 * Complex organism that combines FontControlsPanel molecule with
 * sophisticated auto-sizing and text clipping logic. Manages all
 * state for font customization and display.
 *
 * Features:
 * - Auto-sizing via binary search algorithm
 * - Manual size adjustment with slider
 * - Text clipping to fit container
 * - Style and weight selection
 * - Leading and spacing controls
 * - Responsive layout with compact mode
 *
 * @param {Object} props
 * @param {Function} props.onFontSizeChange - Callback when size changes
 * @param {number} props.initialSize - Starting font size
 * @param {boolean} props.disableAutoSize - Disable auto-sizing
 * @param {string} props.text - Text to display
 * @param {number} props.initialLineHeight - Initial line height (90-140 range)
 * @param {boolean} props.compactOnDesktop - Hide some controls on desktop
 * @param {string} props.cardClassName - Additional card classes
 * @param {number} props.bgOpacity - Background opacity (0-100)
 * @param {string} props.textColor - Text color override
 * @param {string} props.textClassName - Additional text classes
 * @param {string} props.fontFamily - Font family name
 * @param {string} props.fontStyle - Font style ('normal' or 'italic')
 * @param {string} props.initialWeight - Initial font weight name
 */
const FontPreviewItem = ({
  onFontSizeChange,
  initialSize = DEFAULT_SIZE,
  disableAutoSize = false,
  text = 'Tradition meets precision.',
  initialLineHeight = 100,
  variant = 'default',
  cardClassName = '',
  bgOpacity = 100,
  textColor,
  textClassName = '',
  fontFamily = 'TGMalromur',
  fontStyle = 'normal',
  initialWeight = 'Black'
}) => {
  // STATE MANAGEMENT
  const initialStyleVariant = fontStyle === 'italic' ? 'italic' : 'roman'
  const [styleVariant, setStyleVariant] = useState(initialStyleVariant)
  const [weight, setWeight] = useState(initialWeight)
  const [size, setSize] = useState(initialSize)
  const [autoSize, setAutoSize] = useState(initialSize)
  const [leading, setLeading] = useState(initialLineHeight - 90)
  const [spacing, setSpacing] = useState(0)
  const [hasUserAdjustedSize, setHasUserAdjustedSize] = useState(disableAutoSize)

  // Sync internal styleVariant with fontStyle prop changes
  useEffect(() => {
    const newStyleVariant = fontStyle === 'italic' ? 'italic' : 'roman'
    setStyleVariant(newStyleVariant)
  }, [fontStyle])

  // REFS
  const containerRef = useRef(null)
  const lastReportedSizeRef = useRef(null)
  const initialSizeAppliedRef = useRef(false)

  // CARD STYLES
  const cardStyles = {}
  if (typeof bgOpacity === 'number') {
    cardStyles['--card-opacity'] = `${Math.max(0, Math.min(100, bgOpacity))}%`
  }

  // FONT OPTIONS
  const weightLabels = ['Thin', 'Extralight', 'Light', 'Regular', 'Medium', 'Semibold', 'Bold', 'Extrabold', 'Black']

  const styleOptions = [
    { label: 'Roman', value: 'roman' },
    { label: 'Italic', value: 'italic' }
  ]

  const weightOptions = weightLabels.map((label) => ({
    label,
    value: label
  }))

  const weightValues = {
    'Thin': 100,
    'Extralight': 200,
    'Light': 300,
    'Regular': 400,
    'Medium': 500,
    'Semibold': 600,
    'Bold': 700,
    'Extrabold': 800,
    'Black': 900
  }

  const computedFontStyle = styleVariant === 'italic' ? 'italic' : 'normal'

  // AUTO-SIZE CALCULATION
  // Uses binary search to find largest font size that fits in container
  // Note: Currently disabled in FontPreviewSection but used for slider bounds
  const calculateAutoSize = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    if (!containerWidth || !containerHeight) return

    // Create temporary element for measurement
    const tempText = document.createElement('div')
    tempText.style.position = 'absolute'
    tempText.style.visibility = 'hidden'
    tempText.style.whiteSpace = 'normal'
    tempText.style.fontFamily = fontFamily
    tempText.style.fontStyle = computedFontStyle
    tempText.style.fontWeight = weightValues[weight] || 900
    tempText.style.lineHeight = `${90 + leading}%`
    tempText.style.letterSpacing = `${spacing}px`
    tempText.style.width = `${containerWidth}px`
    tempText.textContent = text
    document.body.appendChild(tempText)

    let low = 8
    let high = 512
    let best = low

    // Binary search: try font sizes between 8px and 512px
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      tempText.style.fontSize = `${mid}px`

      const fitsHeight = tempText.offsetHeight <= containerHeight

      if (fitsHeight) {
        best = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    document.body.removeChild(tempText)
    setAutoSize(best)
  }, [text, leading, spacing, weight, styleVariant, fontFamily, computedFontStyle])

  // AUTO-SIZE TRIGGERS
  // Recalculate when container resizes or window resizes
  useLayoutEffect(() => {
    calculateAutoSize()

    // Watch container size changes with ResizeObserver
    let disconnectObserver = null
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => calculateAutoSize())
      const container = containerRef.current

      if (container) {
        observer.observe(container)
      }

      disconnectObserver = () => observer.disconnect()
    }

    // Watch window resize as fallback
    let removeResizeListener = null
    if (typeof window !== 'undefined') {
      const handleResize = () => calculateAutoSize()
      window.addEventListener('resize', handleResize)
      removeResizeListener = () => window.removeEventListener('resize', handleResize)
    }

    return () => {
      if (disconnectObserver) {
        disconnectObserver()
      }
      if (removeResizeListener) {
        removeResizeListener()
      }
    }
  }, [calculateAutoSize])

  // APPLY AUTO-SIZE TO STATE
  // Update displayed size when auto-size changes (unless user manually adjusted)
  useLayoutEffect(() => {
    if (autoSize <= 0 || hasUserAdjustedSize) return

    setSize(prev => {
      if (Number.isNaN(autoSize)) return prev

      // Only update if first time or significant change
      if (!initialSizeAppliedRef.current || Math.abs(prev - autoSize) > 0.5) {
        initialSizeAppliedRef.current = true
        return autoSize
      }

      return prev
    })
  }, [autoSize, hasUserAdjustedSize])

  // SLIDER BOUNDS
  // Slider min/max based on auto-size calculation
  const sliderMin = autoSize > 0 ? Math.min(12, autoSize) : 12
  const sliderMax = disableAutoSize ? 300 : (autoSize > 0 ? autoSize : 300)

  // USER SIZE ADJUSTMENT HANDLER
  // Track when user manually changes size via slider
  const handleSizeChange = (value) => {
    const numericValue = Number(value)
    const clamped = Math.max(sliderMin, Math.min(numericValue, sliderMax))

    setSize(clamped)

    // Mark as user-adjusted if different from auto-size
    if (autoSize > 0) {
      setHasUserAdjustedSize(Math.abs(clamped - sliderMax) > 0.5)
    } else {
      setHasUserAdjustedSize(false)
    }
  }

  // DISPLAY SIZE CALCULATION
  // Actual size to render (respects slider bounds)
  const displaySize = disableAutoSize ? size : (autoSize > 0 ? Math.min(size, sliderMax) : size)
  const fontWeightValue = weightValues[weight] || 900

  // NOTIFY PARENT OF SIZE CHANGES
  // Call parent callback when size changes
  useLayoutEffect(() => {
    if (typeof onFontSizeChange === 'function' && !Number.isNaN(displaySize)) {
      if (lastReportedSizeRef.current !== displaySize) {
        lastReportedSizeRef.current = displaySize
        onFontSizeChange(displaySize)
      }
    }
  }, [displaySize, onFontSizeChange])

  // ADDITIONAL CONTROLS (character set tags)
  const additionalControls = (
    <>
      {['Alt Q', 'Alt $', 'liga'].map(charSet => (
        <div
          key={charSet}
          className="cursor-pointer control-unified whitespace-nowrap"
        >
          {charSet}
        </div>
      ))}
    </>
  )

  return (
    <div
      className={`${cardClassName} w-full h-full flex flex-col`.trim()}
      style={cardStyles}
    >
      {/* Top + Bottom Section with pb-12 */}
      <div className="flex flex-col pb-12">
        {/* Font Controls Panel */}
        <FontControlsPanel
          weightOptions={weightOptions}
          selectedWeight={weight}
          onWeightChange={setWeight}
          size={displaySize}
          onSizeChange={handleSizeChange}
          sizeMin={sliderMin}
          sizeMax={sliderMax}
          leading={leading}
          onLeadingChange={setLeading}
          spacing={spacing}
          onSpacingChange={setSpacing}
          variant={variant}
        />

        {/* Specimen Display */}
        <div ref={containerRef}>
          <DisplaySpecimen
            text={text}
            fontSize={displaySize}
            fontWeight={fontWeightValue}
            fontStyle={computedFontStyle}
            leading={leading}
            spacing={spacing}
            fontFamily={fontFamily}
            textClassName={textClassName}
            textColor={textColor}
          />
        </div>
      </div>

      {/* Divider with padding */}
      <div className="w-full pb-12">
        <Divider variant="horizontal" />
      </div>
    </div>
  )
}

export default FontPreviewItem
