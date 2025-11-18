export const applyTheme = (mode = 'light') => {
  if (typeof document === 'undefined') return

  const theme = mode === 'dark' ? 'dark' : 'light'
  const root = document.documentElement

  root.classList.toggle('dark', theme === 'dark')
  root.dataset.theme = theme
  localStorage.setItem('theme', theme)

  window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme } }))
}

export const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark'

  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme
  }

  return 'dark'
}

export const subscribeToSystemTheme = (handler) => {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const listener = (event) => handler(event.matches ? 'dark' : 'light')

  mediaQuery.addEventListener('change', listener)
  return () => mediaQuery.removeEventListener('change', listener)
}
