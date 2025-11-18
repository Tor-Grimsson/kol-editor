/**
 * Grid Component
 *
 * Atom responsible for rendering grid exploration SVGs with consistent sizing.
 * Mirrors the Illustration component API so existing collection molecules can
 * swap assets without additional changes.
 */

const svgModules = import.meta.glob('./svg/*.svg', { eager: true, query: '?raw', import: 'default' })

const GRID_CACHE = Object.entries(svgModules).reduce((acc, [path, svgContent]) => {
  const fileName = path.split('/').pop() || ''
  const iconName = fileName.replace('.svg', '')
  acc[iconName] = svgContent
  return acc
}, {})

const fallbackMarkup = `
<svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="320" height="320" rx="16" fill="currentColor" fill-opacity="0.08" />
  <path d="M40 80H280" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-opacity="0.4" />
  <path d="M40 160H280" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-opacity="0.4" />
  <path d="M40 240H280" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-opacity="0.4" />
  <path d="M80 40V280" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-opacity="0.4" />
  <path d="M160 40V280" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-opacity="0.4" />
  <path d="M240 40V280" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-opacity="0.4" />
</svg>
`

const Grid = ({
  name,
  size = 320,
  className = '',
  alt = '',
  ...props
}) => {
  const dimension = typeof size === 'number' ? `${size}px` : size

  const applySizeToMarkup = (markup, sizeValue) => {
    let updated = markup

    if (/width="/i.test(updated)) {
      updated = updated.replace(/width="[^"]*"/i, `width="${sizeValue}"`)
    } else {
      updated = updated.replace('<svg', `<svg width="${sizeValue}"`)
    }

    if (/height="/i.test(updated)) {
      updated = updated.replace(/height="[^"]*"/i, `height="${sizeValue}"`)
    } else {
      updated = updated.replace('<svg', `<svg height="${sizeValue}"`)
    }

    return updated
  }

  const markup = name && GRID_CACHE[name] ? GRID_CACHE[name] : fallbackMarkup

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: dimension, height: dimension, color: 'var(--kol-surface-on-primary)' }}
      role="img"
      aria-label={alt || name || 'Grid composition'}
      {...props}
    >
      <span
        className="inline-block"
        style={{
          width: dimension,
          height: dimension,
          lineHeight: 0
        }}
        dangerouslySetInnerHTML={{ __html: applySizeToMarkup(markup, dimension) }}
      />
    </div>
  )
}

export default Grid
