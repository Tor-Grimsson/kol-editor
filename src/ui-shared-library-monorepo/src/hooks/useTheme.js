import { useEffect, useState } from 'react'
import { applyTheme, getInitialTheme, subscribeToSystemTheme } from '../utils/theme'

/**
 * Custom hook for managing theme state
 *
 * Handles:
 * - Initial theme detection (localStorage or system preference)
 * - Theme toggling and persistence
 * - System theme change subscription
 *
 * @returns {Object} { theme, toggleTheme, setTheme }
 *
 * @example
 * function Navbar() {
 *   const { theme, toggleTheme } = useTheme()
 *   const isToggled = theme === 'dark'
 *
 *   return (
 *     <ThemeToggleButton
 *       isToggled={isToggled}
 *       onClick={toggleTheme}
 *     />
 *   )
 * }
 */
export const useTheme = () => {
  const [theme, setTheme] = useState(() => getInitialTheme())

  // Initialize theme and subscribe to system changes
  useEffect(() => {
    const initial = getInitialTheme()
    setTheme(initial)

    // Subscribe to theme-change events from other components
    const handleThemeChange = (event) => {
      setTheme(event.detail.theme)
    }
    window.addEventListener('theme-change', handleThemeChange)

    // Subscribe to system theme changes
    // Only applies theme if user hasn't explicitly set a preference (no localStorage)
    const unsubscribe = subscribeToSystemTheme((nextTheme) => {
      const stored = localStorage.getItem('theme')
      if (!stored) {
        applyTheme(nextTheme)
        setTheme(nextTheme)
      }
    })

    return () => {
      window.removeEventListener('theme-change', handleThemeChange)
      if (unsubscribe) unsubscribe()
    }
  }, [])

  // Toggle between light and dark
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    applyTheme(nextTheme)
    setTheme(nextTheme)
  }

  return { theme, toggleTheme, setTheme }
}
