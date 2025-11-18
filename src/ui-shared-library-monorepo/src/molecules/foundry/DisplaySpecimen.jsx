import { useState, useRef, useLayoutEffect } from 'react'

/**
 * DisplaySpecimen - Text display with automatic clipping
 *
 * Foundry molecule that displays specimen text with intelligent
 * word-boundary clipping to fit container. Uses binary search
 * algorithm with padding-aware height calculation.
 *
 * Features:
 * - Padding-aware text clipping
 * - Binary search for optimal word count
 * - Responsive to container size changes
 * - Configurable height and styling
 *
 * @param {Object} props
 * @param {string} props.text - Full text to display
 * @param {number} props.fontSize - Font size in pixels
 * @param {number} props.fontWeight - Font weight (100-900)
 * @param {string} props.fontStyle - Font style ('normal' or 'italic')
 * @param {number} props.leading - Line height adjustment (0-50, added to 90%)
 * @param {number} props.spacing - Letter spacing in pixels
 * @param {string} props.fontFamily - Font family name
 * @param {string} props.textClassName - Additional text classes
 * @param {string} props.textColor - Text color override
 * @param {string} props.heightClass - Container height class (default: 'h-[560px]')
 * @param {string} props.className - Additional container classes
 */
const DisplaySpecimen = ({
  text = '',
  fontSize = 96,
  fontWeight = 900,
  fontStyle = 'normal',
  leading = 10,
  spacing = 0,
  fontFamily = 'TGMalromur',
  textClassName = '',
  textColor,
  heightClass = 'h-[560px]',
  className = ''
}) => {
  const containerRef = useRef(null)
  const textRef = useRef(null)
  const [visibleText, setVisibleText] = useState(text)

  // TEXT CLIPPING LOGIC
  // Clips text to fit visible area - uses binary search to find max words that fit
  useLayoutEffect(() => {
    const container = containerRef.current
    const textElement = textRef.current
    if (!container || !textElement) return

    const calculateClipping = () => {
      // Get computed padding from the container
      const computedStyle = window.getComputedStyle(container)
      const paddingTop = parseFloat(computedStyle.paddingTop) || 0
      const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0

      // Calculate available height excluding padding
      const availableHeight = container.clientHeight - paddingTop - paddingBottom
      const words = text.split(' ')
      let clippedText = ''

      // Binary search to find maximum number of words that fit
      let low = 0
      let high = words.length

      while (low <= high) {
        const mid = Math.floor((low + high) / 2)
        const testText = words.slice(0, mid).join(' ')
        textElement.textContent = testText

        const textHeight = textElement.offsetHeight

        if (textHeight <= availableHeight) {
          clippedText = testText
          low = mid + 1
        } else {
          high = mid - 1
        }
      }

      setVisibleText(clippedText)
    }

    calculateClipping()

    // Recalculate on window resize (handles responsive padding changes)
    window.addEventListener('resize', calculateClipping)

    return () => {
      window.removeEventListener('resize', calculateClipping)
    }
  }, [text, fontSize, leading, spacing, fontWeight, fontStyle])

  return (
    <div
      ref={containerRef}
      className={`foundryCard w-full ${heightClass} p-6 lg:p-12 ${className}`.trim()}
    >
      <div className="h-full w-full flex items-start justify-start">
        <p
          ref={textRef}
          className={`transition-colors duration-300 max-w-full text-left ${textClassName}`.trim()}
          style={{
            fontFamily: fontFamily,
            fontStyle: fontStyle,
            fontSize: `${fontSize}px`,
            fontWeight: fontWeight,
            lineHeight: `${90 + leading}%`,
            letterSpacing: `${spacing}px`,
            wordWrap: 'normal',
            overflowWrap: 'normal',
            hyphens: 'none',
            whiteSpace: 'normal',
            color: textColor
          }}
        >
          {visibleText}
        </p>
      </div>
    </div>
  )
}

export default DisplaySpecimen
