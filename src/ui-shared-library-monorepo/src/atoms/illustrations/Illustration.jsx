/**
 * Illustration Component
 *
 * A reusable atom for displaying illustration marks with consistent styling.
 * Supports loading SVG files or using hardcoded shapes.
 *
 * @example
 * <Illustration name="kolkrabbi" size={64} />
 * <Illustration id={1} size={64} />
 */

const svgModules = import.meta.glob('./svg/*.svg', { eager: true, query: '?raw', import: 'default' })

const ICON_CACHE = Object.entries(svgModules).reduce((acc, [path, svgContent]) => {
  const fileName = path.split('/').pop() || ''
  const iconName = fileName.replace('.svg', '')
  acc[iconName] = svgContent
  return acc
}, {})

const Illustration = ({
  id,
  name,
  size = 320,
  variant = 'primary',
  className = '',
  alt = '',
  ...props
}) => {
  const getIllustrationShape = (illustrationId) => {
    const shapes = {
      1: (
        <div className="w-20 h-20 relative">
          <div className="absolute inset-0 bg-foreground rounded-full" />
          <div className="absolute inset-2 bg-background rounded-full" />
        </div>
      ),
      2: (
        <div className="w-24 h-16 bg-foreground" />
      ),
      3: (
        <div className="w-20 h-20 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-foreground transform rotate-45" />
        </div>
      ),
      4: (
        <div className="w-24 h-16 bg-foreground flex items-center justify-center">
          <div className="text-4xl font-mono">G</div>
        </div>
      ),
      5: (
        <div className="w-20 h-20 relative grid grid-cols-3 gap-0.5">
          {[...Array(9)].map((_, i) => (
            <div key={i} className={i % 2 === 0 ? 'bg-foreground' : 'bg-transparent'} />
          ))}
        </div>
      ),
      6: (
        <div className="w-20 h-20 flex items-center justify-center">
          <div className="w-0 h-0 border-l-[40px] border-l-transparent border-r-[40px] border-r-transparent border-b-[60px] border-b-foreground" />
        </div>
      ),
      7: (
        <div className="w-20 h-20 grid grid-cols-4 gap-0.5">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="bg-foreground aspect-square" />
          ))}
        </div>
      ),
      8: (
        <div className="w-20 h-20 relative flex items-center justify-center">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="28" r="8" fill="currentColor" />
          </svg>
        </div>
      ),
      9: (
        <div className="w-20 h-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-foreground transform -rotate-12" />
          <div className="absolute inset-4 bg-background transform rotate-12" />
        </div>
      ),
      10: (
        <div className="w-20 h-20 relative">
          <div className="absolute inset-0 border-4 border-foreground rounded-full" />
        </div>
      ),
      11: (
        <div className="w-20 h-20 flex items-center justify-center">
          <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[50px] border-b-foreground" />
        </div>
      ),
      12: (
        <div className="w-20 h-20 flex items-center justify-center">
          <div className="w-16 h-12 border-4 border-foreground relative">
            <div className="absolute inset-0 border-2 border-background m-1" />
          </div>
        </div>
      ),
      13: (
        <div className="w-24 h-16 grid grid-cols-8 gap-px bg-background p-1">
          {[...Array(40)].map((_, i) => (
            <div key={i} className={`${i % 3 === 0 ? 'bg-foreground' : 'bg-foreground/20'} aspect-square`} />
          ))}
        </div>
      ),
      14: (
        <div className="w-20 h-20 relative">
          <div className="absolute inset-0 border-4 border-foreground border-t-transparent border-r-transparent" />
        </div>
      ),
      15: (
        <div className="w-20 h-20 relative">
          <div className="absolute inset-0 bg-foreground transform rotate-45" />
        </div>
      ),
      16: (
        <div className="w-16 h-16 relative flex items-center justify-center">
          <div className="w-2 h-12 bg-foreground absolute" />
          <div className="w-12 h-2 bg-foreground absolute" />
        </div>
      ),
      17: (
        <div className="w-20 h-20 relative">
          <div className="absolute inset-0 bg-foreground/60 rounded-full" />
          <div className="absolute inset-2 bg-background/20 rounded-full" />
        </div>
      ),
      18: (
        <div className="w-20 h-20 relative flex items-center justify-center">
          <div className="absolute w-12 h-12 border-2 border-foreground rounded-full" />
          <div className="absolute w-8 h-8 border-2 border-foreground/60 rounded-full left-6 top-6" />
        </div>
      ),
      19: (
        <div className="w-20 h-20 relative overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-foreground"
              style={{
                width: '60px',
                height: '2px',
                left: '10px',
                top: `${10 + i * 5}px`,
                transform: `rotate(${i * 15}deg)`,
              }}
            />
          ))}
        </div>
      ),
      20: (
        <div className="w-20 h-20 flex items-center justify-center">
          <div className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-b-[40px] border-b-foreground relative">
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-6 bg-foreground" />
          </div>
        </div>
      ),
      21: (
        <div className="w-20 h-20 relative">
          <div className="absolute inset-0 border-4 border-foreground rounded-full" />
          <div className="absolute inset-3 border-2 border-foreground rounded-full" />
          <div className="absolute inset-6 border-2 border-foreground rounded-full" />
        </div>
      ),
      22: (
        <div className="w-20 h-20 flex items-center justify-center">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="24" r="8" fill="currentColor" />
            <circle cx="28" cy="22" r="2" fill="currentColor" />
            <circle cx="36" cy="22" r="2" fill="currentColor" />
          </svg>
        </div>
      ),
      23: (
        <div className="w-16 h-20 flex items-end justify-center gap-1">
          {[1, 1.2, 0.8, 1.5, 1.1].map((height, i) => (
            <div key={i} className="w-2 bg-foreground" style={{ height: `${height * 16}px` }} />
          ))}
        </div>
      ),
      24: (
        <div className="w-20 h-20 relative">
          <div className="absolute inset-0 border-2 border-foreground rounded-full" />
          <div className="absolute inset-2 border-2 border-foreground/60 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-accent-primary rounded-full" />
        </div>
      ),
    }
    return shapes[illustrationId] || shapes[1]
  }

  const getVariantClass = (variant) => {
    const variants = {
      primary: 'bg-surface-secondary',
      secondary: 'bg-surface-secondary',
      tertiary: 'bg-surface-inverse',
      quaternary: 'bg-surface-secondary'
    }
    return variants[variant] || variants.primary
  }

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

  const dimension = typeof size === 'number' ? `${size}px` : size

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: dimension, height: dimension }}
      role="img"
      aria-label={alt || name || `Illustration ${id || ''}`}
      {...props}
    >
      {name ? (
        ICON_CACHE[name] ? (
          <span
            className="inline-block"
            style={{
              width: dimension,
              height: dimension,
              lineHeight: 0,
            }}
            dangerouslySetInnerHTML={{ __html: applySizeToMarkup(ICON_CACHE[name], dimension) }}
          />
        ) : (
          <div style={{ color: 'var(--kol-surface-on-primary)' }}>
            {name}
          </div>
        )
      ) : (
        getIllustrationShape(id)
      )}
    </div>
  )
}

export default Illustration
