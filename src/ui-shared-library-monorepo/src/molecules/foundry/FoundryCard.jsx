import React from 'react'

/**
 * FoundryCard - Base card component with variants
 *
 * Foundry molecule providing consistent card styling with variants.
 * Uses CSS variable --card-opacity for background transparency control.
 *
 * Variants:
 * - default: Base card with --surface-secondary background
 * - padded: Base card with responsive padding (16/24/32px)
 * - inverted: Flips background/foreground colors with theme
 * - light: Forces --surface-primary background
 * - dark: Forces --surface-inverse background
 *
 * @param {Object} props
 * @param {('default'|'padded'|'inverted'|'light'|'dark')} props.variant - Card style variant
 * @param {number} props.opacity - Background opacity percentage (0-100)
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional classes
 */
const FoundryCard = ({
  variant = 'default',
  opacity = 100,
  children,
  className = ''
}) => {
  // Build class names based on variant
  const variantClasses = {
    default: 'foundryCard',
    padded: 'foundryCard foundryCardPadded',
    inverted: 'foundryCard foundryCardInverted',
    light: 'foundryCard foundryCardLight',
    dark: 'foundryCard foundryCardDark'
  }

  const baseClasses = variantClasses[variant] || variantClasses.default

  // Clamp opacity between 0-100
  const clampedOpacity = Math.max(0, Math.min(100, opacity))

  return (
    <div
      className={`${baseClasses} ${className}`.trim()}
      style={{ '--card-opacity': `${clampedOpacity}%` }}
    >
      {children}
    </div>
  )
}

export default FoundryCard
