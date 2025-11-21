import React from 'react'

/**
 * BaselineGrid - SVG baseline grid overlay
 *
 * Atom component that renders a configurable baseline grid using SVG patterns.
 * Used for typography alignment, spacing verification, and visual rhythm testing.
 *
 * @param {Object} props
 * @param {number} props.gridSize - Grid unit size in pixels (default: 8)
 * @param {number} props.strokeWidth - Line thickness (default: 0.5)
 * @param {number} props.opacity - Line opacity 0-1 (default: 0.12)
 * @param {string} props.color - CSS color value (default: 'currentColor')
 * @param {boolean} props.horizontalOnly - Show only horizontal lines (default: true)
 * @param {string} props.id - Unique pattern ID (default: 'baseline-grid')
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 */
const BaselineGrid = ({
  gridSize = 8,
  strokeWidth = 0.5,
  opacity = 0.12,
  color = 'currentColor',
  horizontalOnly = true,
  id = 'baseline-grid',
  className = '',
  style = {}
}) => {
  // Generate path for grid pattern
  const gridPath = horizontalOnly
    ? `M 0 0 L ${gridSize} 0`  // Horizontal line only
    : `M ${gridSize} 0 L 0 0 0 ${gridSize}`  // Grid (horizontal + vertical)

  return (
    <svg
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        opacity,
        width: '200vw',
        height: '500vh',
        left: '-50vw',
        top: '-200vh',
        ...style
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id={id}
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={gridPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

export default BaselineGrid
