import React from 'react'

/**
 * Divider - Horizontal or vertical divider line
 *
 * Simple atom for creating separator lines
 * Uses bg-fg-08 for consistent 8% opacity across themes
 * Vertical variant includes wrapper div for proper flex behavior
 *
 * @param {Object} props
 * @param {string} props.variant - 'horizontal' or 'vertical' (default: 'horizontal')
 * @param {string} props.className - Additional classes
 */
const Divider = ({ variant = 'horizontal', className = '' }) => {
  const isVertical = variant === 'vertical'

  if (isVertical) {
    return (
      <div className={`self-stretch flex justify-center items-center ${className}`.trim()}>
        <div className="bg-fg-08" style={{ width: '1px', height: '100%' }} />
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="bg-fg-08 h-px w-full" />
    </div>
  )
}

export default Divider
