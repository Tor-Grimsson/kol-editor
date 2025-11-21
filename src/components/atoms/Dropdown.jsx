import { useEffect, useRef, useState } from 'react'

const SIZE_MAP = {
  sm: { fontSize: 11, paddingY: 12, paddingX: 24, radius: 20, icon: 10 },
  md: { fontSize: 12, paddingY: 14, paddingX: 24, radius: 22, icon: 12 },
  lg: { fontSize: 12, paddingY: 16, paddingX: 24, radius: 24, icon: 14 }
}

const Dropdown = ({
  options = [],
  value,
  onChange,
  size,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)
  const [resolvedSize, setResolvedSize] = useState('md')

  useEffect(() => {
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

    return () => {
      window.removeEventListener('resize', determineSize)
    }
  }, [size])

  const metrics = SIZE_MAP[resolvedSize] || SIZE_MAP.md

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelect = (option) => {
    onChange?.(option.value)
    setIsOpen(false)
  }

  const currentOption = options.find((opt) => opt.value === value) || options[0]

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block ${className}`}
      style={{ zIndex: isOpen ? 100 : 50 }}
    >
      <div
        className="min-w-[200px]"
          style={{
            border: '1px solid var(--kol-border-default)',
            borderRadius: isOpen
              ? `${metrics.radius}px ${metrics.radius}px 0 0`
              : `${metrics.radius}px`,
            backgroundColor: 'var(--kol-surface-primary)',
            color: 'var(--kol-surface-on-primary)',
            transition: 'background-color 0.2s, color 0.2s'
          }}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between transition-colors duration-200"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            padding: `${metrics.paddingY}px ${metrics.paddingX}px`,
            fontSize: `${metrics.fontSize}px`,
            lineHeight: '120%',
            fontFamily: 'var(--kol-font-family-mono)'
          }}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          data-state={isOpen ? 'open' : 'closed'}
        >
          <span className="opacity-100">{currentOption?.label}</span>
          <svg
            className="ml-auto transition-transform duration-300"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              width: `${metrics.icon}px`,
              height: `${metrics.icon}px`
            }}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m3 5 3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute w-full border border-t-0"
          style={{
            backgroundColor: 'var(--kol-surface-primary)',
            color: 'var(--kol-surface-on-primary)',
            borderColor: 'var(--kol-border-default)',
            top: '100%',
            left: 0,
            marginTop: '-1px',
            borderRadius: `0 0 ${metrics.radius}px ${metrics.radius}px`
          }}
          role="listbox"
        >
          <div style={{ padding: `0 ${metrics.paddingX}px` }}>
            <div
              style={{
                height: '1px',
                backgroundColor: 'var(--kol-border-default)'
              }}
            />
          </div>

          <div className="flex max-h-[300px] flex-col items-start overflow-y-auto py-2">
            {options.map((option) => {
              const isActive = option.value === currentOption?.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className="w-full text-left transition-opacity duration-150 relative"
                  style={{
                    backgroundColor: 'transparent',
                    opacity: isActive ? 1 : 0.4,
                    padding: `8px ${metrics.paddingX}px`,
                    fontSize: `${metrics.fontSize}px`,
                    lineHeight: '120%',
                    fontFamily: 'var(--kol-font-family-mono)'
                  }}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.opacity = '1'
                  }}
                  onMouseLeave={(event) => {
                    if (!isActive) {
                      event.currentTarget.style.opacity = '0.4'
                    }
                  }}
                >
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--kol-surface-on-primary)'
                      }}
                    />
                  )}
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dropdown
