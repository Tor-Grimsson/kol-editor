import React, { useState } from 'react'
import Icon from "../icons/Icon"

/**
 * ButtonFixed - Simplified button component with single visual style
 *
 * Fixed version with one visual style and three size options only
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Button content
 * @param {'sm'|'md'|'lg'} props.size - Button size (default: 'md')
 * @param {boolean} props.uppercase - Text transform uppercase (default: true)
 * @param {string} props.iconLeft - Icon name to display on the left
 * @param {string} props.iconRight - Icon name to display on the right
 * @param {string} props.iconLeftHover - Icon to show on hover (left position)
 * @param {string} props.iconRightHover - Icon to show on hover (right position)
 * @param {string} props.iconOnly - Icon name for icon-only button
 * @param {string} props.iconOnlyHover - Icon to show on hover (icon-only)
 * @param {boolean} props.animateIcon - Disable default hover states to focus on icon animation
 * @param {number} props.iconSize - Size of the icon in pixels (default: 16)
 * @param {string} props.href - Link destination (makes it an <a>)
 * @param {Function} props.onClick - Click handler (makes it a <button>)
 * @param {string} props.className - Additional classes
 * @param {Object} props.style - Inline styles
 * @param {string} props.type - Button type attribute (default: 'button')
 * @param {boolean} props.disabled - Disabled state
 */
const ButtonFixed = ({
  children,
  size = 'sm',
  uppercase = false,
  iconLeft,
  iconRight,
  iconLeftHover,
  iconRightHover,
  iconOnly,
  iconOnlyHover,
  animateIcon = false,
  iconSize = 16,
  href,
  onClick,
  className = '',
  style = {},
  type = 'button',
  disabled = false,
  ...props
}) => {
  // Size configurations - Tailwind-style padding with consistent horizontal padding
  const sizeConfig = {
    sm: {
      padding: '12px 24px',   // py-3 px-6
      fontSize: '11px',
      fontClass: 'kol-mono-xs'
    },
    md: {
      padding: '14px 24px',   // py-[14px] px-6
      fontSize: '12px',
      fontClass: 'kol-mono-xs'
    },
    lg: {
      padding: '16px 24px',   // py-4 px-6
      fontSize: '14px',
      fontClass: 'kol-mono-xs'
    }
  }

  const currentSize = sizeConfig[size] || sizeConfig.md
  const sizePadding = currentSize.padding

  // Hover state for inline styles (CSS :hover doesn't work with inline styles)
  const [isHovered, setIsHovered] = useState(false)

  // Render icon with optional hover state
  const renderIcon = (iconName, iconHoverName) => {
    if (!iconName && !iconHoverName) return null

    // If no hover icon, render single icon
    if (!iconHoverName) {
      return <Icon name={iconName} size={iconSize} />
    }

    // Render both default and hover icons with positioning
    return (
      <span className="icon-swap-container" style={{ position: 'relative', display: 'inline-flex', width: iconSize, height: iconSize, overflow: 'hidden' }}>
        <Icon
          name={iconName}
          size={iconSize}
          className="icon-default"
          style={{ position: 'absolute' }}
        />
        <Icon
          name={iconHoverName}
          size={iconSize}
          className="icon-hover"
          style={{ position: 'absolute' }}
        />
      </span>
    )
  }

  // Render content with icons
  const renderContent = () => {
    // Icon-only button
    if (iconOnly) {
      return renderIcon(iconOnly, iconOnlyHover)
    }

    // Button with icon(s) and text
    if (iconLeft || iconRight || iconLeftHover || iconRightHover) {
      return (
        <span className="flex items-center gap-2">
          {(iconLeft || iconLeftHover) && renderIcon(iconLeft, iconLeftHover)}
          <span>
            {children}
          </span>
          {(iconRight || iconRightHover) && renderIcon(iconRight, iconRightHover)}
        </span>
      )
    }

    // Text-only button
    return (
      <span>
        {children}
      </span>
    )
  }

  // Inline button styles - no dependency on control CSS classes
  // Use isHovered state for dynamic hover colors
  const mergedStyle = iconOnly
    ? {
        lineHeight: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: sizePadding,
        backgroundColor: !disabled && isHovered ? 'var(--kol-surface-on-primary)' : 'var(--kol-surface-primary)',
        color: !disabled && isHovered ? '#000000' : 'var(--kol-surface-on-primary)',
        border: '1px solid var(--kol-border-default)',
        borderRadius: '9999px',
        fontSize: currentSize.fontSize,
        fontFamily: 'var(--kol-font-family-mono)',
        fontWeight: 500,
        textTransform: uppercase ? 'uppercase' : 'none',
        letterSpacing: '0.05em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
        ...style
      }
    : {
        padding: sizePadding,
        backgroundColor: !disabled && isHovered ? 'var(--kol-surface-on-primary)' : 'var(--kol-surface-primary)',
        color: !disabled && isHovered ? '#000000' : 'var(--kol-surface-on-primary)',
        border: '1px solid var(--kol-border-default)',
        borderRadius: '9999px',
        fontSize: currentSize.fontSize,
        fontFamily: 'var(--kol-font-family-mono)',
        fontWeight: 500,
        textTransform: uppercase ? 'uppercase' : 'none',
        letterSpacing: '0.05em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
        ...style
      }

  // Render as button
  if (onClick || !href) {
    return (
      <button
        onClick={onClick}
        type={type}
        style={mergedStyle}
        disabled={disabled}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => !disabled && setIsHovered(false)}
        aria-label={iconOnly ? (props['aria-label'] || 'Button') : undefined}
        {...props}
      >
        {renderContent()}
      </button>
    )
  }

  // Render as link
  return (
    <a
      href={href}
      style={mergedStyle}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
      aria-label={iconOnly ? (props['aria-label'] || 'Link') : undefined}
      {...props}
    >
      {renderContent()}
    </a>
  )
}

export default ButtonFixed
