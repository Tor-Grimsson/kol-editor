import React from 'react'

/**
 * ButtonBullshit - Simple button with hover state that works in light & dark mode
 */
const ButtonBullshit = ({
  children,
  onClick,
  className = '',
  style = {},
  ...props
}) => {
  const buttonStyle = {
    borderRadius: '9999px',
    padding: '8px 20px',
    fontFamily: 'var(--kol-font-family-mono)',
    fontWeight: '470',
    fontSize: '14px',
    lineHeight: '100%',
    letterSpacing: '0.03em',
    background: 'var(--kol-surface-primary)',
    color: 'var(--kol-surface-on-primary)',
    border: '1px solid var(--kol-border-default)',
    cursor: 'pointer',
    transition: 'background-color 0.2s, color 0.2s',
    ...style
  }

  return (
    <button
      type="button"
      onClick={onClick}
      style={buttonStyle}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}

export default ButtonBullshit
