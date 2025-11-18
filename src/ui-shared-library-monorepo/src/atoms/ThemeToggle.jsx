import { useEffect, useState } from 'react'
import { applyTheme, getInitialTheme, subscribeToSystemTheme } from '../utils/theme'

/**
 * @deprecated This component is deprecated in favor of ThemeToggleButton + useTheme hook.
 *
 * **Migration Guide:**
 * ```jsx
 * // Old (deprecated):
 * import { ThemeToggle } from '@kol/ui'
 * <ThemeToggle variant="default" />
 *
 * // New (recommended):
 * import { ThemeToggleButton, useTheme } from '@kol/ui'
 * const { theme, toggleTheme } = useTheme()
 * <ThemeToggleButton
 *   variant="default"
 *   isToggled={theme === 'dark'}
 *   onClick={toggleTheme}
 * />
 * ```
 *
 * **Why migrate?**
 * - Better separation of concerns (theme logic in hook, UI in component)
 * - Controlled component pattern (more predictable, easier to test)
 * - Improved animation (horizontal swap with 180° rotation)
 * - Better responsive behavior (built-in mobile/desktop variants)
 *
 * This component will remain for backward compatibility but won't receive updates.
 * The `previewOnly` prop is maintained for styleguide demonstrations.
 */
const ThemeToggle = ({ variant = 'default', className = '', previewOnly = false }) => {
  const [theme, setTheme] = useState(() => getInitialTheme())

  useEffect(() => {
    if (previewOnly) return

    const initial = getInitialTheme()
    setTheme(initial)

    const unsubscribe = subscribeToSystemTheme((next) => {
      const stored = localStorage.getItem('theme')
      if (!stored) {
        applyTheme(next)
        setTheme(next)
      }
    })

    return unsubscribe || (() => {})
  }, [previewOnly])

  const handleToggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    if (!previewOnly) {
      applyTheme(next)
    }
    setTheme(next)
  }

  const baseBorder = 'var(--kol-border-default)'
  const hoverBorder = 'var(--kol-surface-on-primary)'

  const handleMouseOver = (event) => {
    event.currentTarget.style.borderColor = hoverBorder
  }

  const handleMouseOut = (event) => {
    event.currentTarget.style.borderColor = baseBorder
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`flex size-8 items-center justify-center rounded-full transition-opacity duration-300 hover:opacity-80 ${className}`}
        style={{ color: 'var(--kol-surface-on-primary)' }}
      >
        <div className="size-6 overflow-hidden rounded-full bg-transparent">
          <div
            className="flex w-12 transition-transform duration-700 ease-in-out"
            style={{ transform: theme === 'dark' ? 'translateX(0)' : 'translateX(-50%)' }}
          >
            <span className="flex size-6 items-center justify-center">
              <ToggleIcon rotated={theme === 'dark'} size={20} />
            </span>
            <span className="flex size-6 items-center justify-center">
              <ToggleIcon rotated={theme === 'dark'} size={20} />
            </span>
          </div>
        </div>
      </button>
    )
  }

  const containerClasses = variant === 'compact'
    ? `flex w-full items-center justify-between rounded-full border px-4 py-2 text-sm transition-colors duration-300 bg-transparent min-h-[44px] ${className}`
    : `group flex w-fit items-center gap-3 rounded-full border p-1 pl-4 transition-colors duration-300 bg-transparent ${className}`

  const labelClass = variant === 'compact'
    ? 'text-sm font-medium'
    : 'text-sm w-20 text-left transition-opacity duration-[400ms]'

  const monoStyle = { fontFamily: 'var(--kol-font-family-mono)' }

  return (
    <button
      type="button"
      onClick={handleToggle}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      className={containerClasses}
      style={{ borderColor: baseBorder, color: 'var(--kol-surface-on-primary)' }}
    >
      <span
        className={`${labelClass} ${variant === 'compact' ? '' : 'group-hover:opacity-80 group-active:opacity-60'}`.trim()}
        style={monoStyle}
      >
        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
      </span>
      {variant !== 'compact' && <span className="block h-4 w-0.5" style={{ backgroundColor: 'var(--kol-surface-on-primary)' }}></span>}

      <div className="size-6 overflow-hidden rounded-full bg-transparent transition-colors duration-700">
        <div
          className="flex w-12 transition-transform duration-700 ease-in-out"
          style={{ transform: theme === 'dark' ? 'translateX(0)' : 'translateX(-50%)' }}
        >
          <span className="flex size-6 items-center justify-center">
            <ToggleIcon rotated={theme === 'dark'} size={variant === 'compact' ? 18 : 16} />
          </span>
          <span className="flex size-6 items-center justify-center">
            <ToggleIcon rotated={theme === 'dark'} size={variant === 'compact' ? 18 : 16} />
          </span>
        </div>
      </div>
    </button>
  )
}

const ToggleIcon = ({ rotated, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-transform duration-500 ${rotated ? 'rotate-180' : 'rotate-0'}`}
  >
    <path d="M12 2C6.486 2 2 6.486 2 12C2 17.514 6.486 22 12 22C17.514 22 22 17.514 22 12C22 6.486 17.514 2 12 2ZM11 11H4.069C4.15475 10.3136 4.32955 9.64126 4.589 9H11V11ZM11 15H4.589C4.32955 14.3587 4.15475 13.6864 4.069 13H11V15ZM11 4.069V7H5.765C7.06342 5.38055 8.94071 4.32948 11 4.069ZM5.765 17H11V19.931C8.94071 19.6705 7.06342 18.6194 5.765 17ZM13 19.931V4.069C16.939 4.564 20 7.927 20 12C20 16.073 16.939 19.436 13 19.931Z" fill="currentColor" />
  </svg>
)

export default ThemeToggle
