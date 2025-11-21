import React from 'react'
import Icon from "../icons/Icon"

const SIZE_MAP = {
  sm: { fontSize: 11, icon: 12 },
  md: { fontSize: 12, icon: 14 },
  lg: { fontSize: 14, icon: 16 }
}

const Input = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  size,
  uppercase = false,
  iconLeft,
  iconSize = null,
  className = '',
  style = {},
  ...props
}) => {
  const [resolvedSize, setResolvedSize] = React.useState('md')

  React.useEffect(() => {
    const determineSize = () => {
      if (size) {
        setResolvedSize(size)
        return
      }

      if (typeof window === 'undefined') {
        setResolvedSize('md')
        return
      }

      if (window.innerWidth >= 1024) {
        setResolvedSize('lg')
      } else if (window.innerWidth >= 768) {
        setResolvedSize('md')
      } else {
        setResolvedSize('sm')
      }
    }

    determineSize()
    window.addEventListener('resize', determineSize)
    return () => window.removeEventListener('resize', determineSize)
  }, [size])

  const metrics = SIZE_MAP[resolvedSize] || SIZE_MAP.md
  const sizeClass =
    resolvedSize === 'sm'
      ? 'input-sm'
      : resolvedSize === 'lg'
      ? 'input-lg'
      : 'input-md'
  const caseClass = uppercase ? 'uppercase' : ''

  const combinedClass = `input-outline ${sizeClass} ${caseClass} kol-mono-text ${className}`.trim()

  const inlineStyle = {
    fontSize: `${metrics.fontSize}px`,
    lineHeight: '120%',
    ...style
  }

  const resolvedIconSize = iconLeft ? (iconSize ?? metrics.icon) : null

  // Icon positioning - use CSS padding values
  const iconLeftPosition = resolvedSize === 'sm' ? 16 : resolvedSize === 'lg' ? 24 : 20

  if (iconLeft && resolvedIconSize) {
    inlineStyle.paddingLeft = `calc(${iconLeftPosition}px + ${resolvedIconSize}px + 12px)`
  }

  return (
    <div className="relative flex w-full items-center">
      {iconLeft && (
        <span
          className="absolute flex items-center text-auto opacity-50 pointer-events-none"
          style={{
            left: `${iconLeftPosition}px`,
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          <Icon name={iconLeft} size={resolvedIconSize ?? 12} />
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${combinedClass} w-full`}
        style={inlineStyle}
        {...props}
      />
    </div>
  )
}

export default Input
