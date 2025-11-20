import React, { useState, useRef, useEffect } from 'react'

/**
 * DropdownFixed - Custom dropdown with smooth animations
 *
 * Fixed version using the exact same code as Dropdown
 *
 * @param {Object} props
 * @param {Array} props.options - Array of option objects [{label: string, value: any}]
 * @param {any} props.value - Current selected value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.size - Size variant: 'sm' | 'md' | 'lg' (default: 'sm')
 * @param {string} props.className - Additional classes
 * @param {string} props.fontSize - Font size for text (e.g., '11px', '12px', '14px')
 */
const DropdownFixed = ({
  options = [],
  value,
  onChange,
  size = 'sm',
  className = '',
  fontSize
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  // Close dropdown when clicking outside
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

  // Handle keyboard navigation
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

  const currentOption = options.find(opt => opt.value === value) || options[0]

  // Size configurations - Tailwind-style padding with consistent horizontal padding
  const sizeConfig = {
    sm: {
      padding: '12px 24px',   // py-3 px-6
      fontSize: '11px',
      buttonPadding: '12px 24px',
      optionPadding: '12px 24px',
      iconSize: '10px'
    },
    md: {
      padding: '14px 24px',   // py-[14px] px-6
      fontSize: '12px',
      buttonPadding: '14px 24px',
      optionPadding: '14px 24px',
      iconSize: '12px'
    },
    lg: {
      padding: '16px 24px',   // py-4 px-6
      fontSize: '12px',
      buttonPadding: '16px 24px',
      optionPadding: '16px 24px',
      iconSize: '14px'
    }
  }

  // Border radius by size - non-responsive (stays same on all screen sizes)
  const sizeBorderRadius = {
    sm: '20px',   // Smallest border radius for compact variant
    md: '22px',   // Medium border radius
    lg: '24px'    // Largest border radius for prominent variant
  }

  const currentSize = sizeConfig[size] || sizeConfig.md
  const currentBorderRadius = sizeBorderRadius[size] || sizeBorderRadius.md

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block ${className}`}
      style={{ zIndex: isOpen ? 100 : 50 }}
    >
      {/* Unified border container */}
      <div
        className="min-w-[200px]"
        style={{
          borderRadius: isOpen
            ? `${currentBorderRadius} ${currentBorderRadius} 0 0`
            : currentBorderRadius,
          display: 'inline-flex',
          alignItems: 'center',
          border: '1px solid var(--kol-border-default)',
          backgroundColor: 'transparent',
          transition: 'background-color 0.2s, color 0.2s'
        }}
      >
        {/* Dropdown Button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between transition-colors duration-200"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            padding: currentSize.buttonPadding,
            fontSize: fontSize || currentSize.fontSize,
            fontFamily: 'var(--kol-font-family-mono)'
          }}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          data-state={isOpen ? 'open' : 'closed'}
        >
          <span className="opacity-100">
            {currentOption?.label}
          </span>
          <svg
            className="ml-auto transition-transform duration-300"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              width: currentSize.iconSize,
              height: currentSize.iconSize
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

      {/* Dropdown List */}
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
            borderRadius: `0 0 ${currentBorderRadius} ${currentBorderRadius}`
          }}
          role="listbox"
        >
          {/* Divider line */}
          <div style={{ padding: `0 ${currentSize.optionPadding}` }}>
            <div
              style={{
                height: '1px',
                backgroundColor: 'var(--kol-border-default)'
              }}
            />
          </div>
          <div className="flex max-h-[300px] flex-col items-start overflow-y-auto" style={{ padding: '0px 0', marginTop: '-16px', marginBottom: '8px' }}>
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
                    padding: currentSize.optionPadding,
                    fontSize: fontSize || currentSize.fontSize,
                    fontFamily: 'var(--kol-font-family-mono)'
                  }}
                  role="option"
                  aria-selected={isActive}
                  data-active={isActive}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.opacity = '0.4'
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

export default DropdownFixed
