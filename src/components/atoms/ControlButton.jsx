import React from 'react'

/**
 * ControlButton Component
 *
 * Utility button with fixed padding for toggles and contextual controls.
 * Padding fixed at 8×16 across all breakpoints.
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional classes
 * @param {Object} props.style - Inline styles
 * @param {string} props.type - Button type attribute (default: 'button')
 * @param {boolean} props.disabled - Disabled state
 */
const ControlButton = ({
  children,
  onClick,
  className = '',
  style = {},
  type = 'button',
  disabled = false,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className={`btn-control kol-mono-text ${className}`.trim()}
      style={style}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default ControlButton
