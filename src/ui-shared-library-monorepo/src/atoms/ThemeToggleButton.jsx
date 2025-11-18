import Icon from './icons/Icon'

export default function ThemeToggleButton({
  variant = 'default',
  onClick,
  isToggled = false,
  className = ''
}) {

  // Compact variant: Always show full button at all breakpoints, full width
  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className={`btn-outline theme-toggle-horizontal ${isToggled ? 'toggled' : ''} ${className}`}
        style={{
          fontSize: '16px',
          padding: '0 20px',
          height: '44px',
          minHeight: '44px',
          lineHeight: '44px',
          textTransform: 'none',
          alignItems: 'center',
          gap: '16px',
          justifyContent: 'space-between',
          display: 'flex',
          width: '100%'
        }}
      >
        <span style={{ fontFamily: 'var(--kol-font-family-mono)', fontWeight: 'var(--font-weight-normal)' }}>
          {isToggled ? 'Dark Mode' : 'Light Mode'}
        </span>
        <span
          className="icon-swap-container"
          style={{
            position: 'relative',
            display: 'inline-flex',
            width: '16px',
            height: '16px',
            overflow: 'hidden'
          }}
        >
          <Icon
            name="theme-toggle"
            size={16}
            style={{ position: 'absolute', transition: 'transform 0.3s ease' }}
          />
          <Icon
            name="theme-toggle"
            size={16}
            style={{ position: 'absolute', transition: 'transform 0.3s ease' }}
          />
        </span>
      </button>
    )
  }

  // Default variant: Responsive behavior (icon on mobile, full button on tablet+)
  return (
    <>
      {/* Mobile: Icon-only */}
      <button
        onClick={onClick}
        aria-label="Toggle theme"
        className={`md:hidden theme-toggle-horizontal ${isToggled ? 'toggled' : ''} ${className}`}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: 'var(--kol-surface-on-primary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span
          className="icon-swap-container"
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '18px',
            height: '18px',
            overflow: 'hidden'
          }}
        >
          <Icon
            name="theme-toggle"
            size={18}
            style={{ position: 'absolute', transition: 'transform 0.3s ease' }}
          />
          <Icon
            name="theme-toggle"
            size={18}
            style={{ position: 'absolute', transition: 'transform 0.3s ease' }}
          />
        </span>
      </button>

      {/* Tablet: Full button with text */}
      <button
        onClick={onClick}
        className={`hidden md:inline-flex lg:hidden btn-outline theme-toggle-horizontal ${isToggled ? 'toggled' : ''} ${className}`}
        style={{
          fontSize: '14px',
          padding: '2px 20px',
          textTransform: 'none',
          alignItems: 'center',
          gap: '16px',
          width: '160px',
          justifyContent: 'space-between'
        }}
      >
        <span style={{ fontFamily: 'var(--kol-font-family-mono)', fontWeight: 'var(--font-weight-normal)' }}>
          {isToggled ? 'Dark Mode' : 'Light Mode'}
        </span>
        <span
          className="icon-swap-container"
          style={{
            position: 'relative',
            display: 'inline-flex',
            width: '14px',
            height: '14px',
            overflow: 'hidden'
          }}
        >
          <Icon
            name="theme-toggle"
            size={14}
            style={{ position: 'absolute', transition: 'transform 0.3s ease' }}
          />
          <Icon
            name="theme-toggle"
            size={14}
            style={{ position: 'absolute', transition: 'transform 0.3s ease' }}
          />
        </span>
      </button>

      {/* Desktop: Larger sizing for default variant */}
      <button
        onClick={onClick}
        className={`hidden lg:inline-flex btn-outline theme-toggle-horizontal ${isToggled ? 'toggled' : ''} ${className}`}
        style={{
          fontSize: '16px',
          padding: '2px 20px',
          textTransform: 'none',
          alignItems: 'center',
          gap: '16px',
          width: '180px',
          justifyContent: 'space-between'
        }}
      >
        <span style={{ fontFamily: 'var(--kol-font-family-mono)', fontWeight: 'var(--font-weight-normal)' }}>
          {isToggled ? 'Dark Mode' : 'Light Mode'}
        </span>
        <span
          className="icon-swap-container"
          style={{
            position: 'relative',
            display: 'inline-flex',
            width: '16px',
            height: '16px',
            overflow: 'hidden'
          }}
        >
          <Icon
            name="theme-toggle"
            size={16}
            style={{ position: 'absolute', transition: 'transform 0.3s ease' }}
          />
          <Icon
            name="theme-toggle"
            size={16}
            style={{ position: 'absolute', transition: 'transform 0.3s ease' }}
          />
        </span>
      </button>
    </>
  )
}
