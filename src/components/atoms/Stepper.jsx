import React from 'react'
import Icon from '../icons/Icon'

const Stepper = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  size = 'sm',
  className = '',
  style = {},
  ...props
}) => {
  const handleIncrement = () => {
    const newValue = Number(value) + step
    if (max !== undefined && newValue > max) return
    onChange?.({ target: { value: newValue } })
  }

  const handleDecrement = () => {
    const newValue = Number(value) - step
    if (min !== undefined && newValue < min) return
    onChange?.({ target: { value: newValue } })
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    if (newValue === '' || newValue === '-') {
      onChange?.(e)
      return
    }

    const numValue = Number(newValue)
    if (isNaN(numValue)) return

    if (min !== undefined && numValue < min) return
    if (max !== undefined && numValue > max) return

    onChange?.(e)
  }

  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14

  return (
    <div className={`flex w-full items-center gap-2 ${className}`} style={style}>
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        className="input-outline w-full kol-mono-text hide-number-spinners"
        style={{
          fontSize: size === 'sm' ? '11px' : size === 'lg' ? '14px' : '12px',
          lineHeight: '120%',
          padding: size === 'sm' ? '6px 16px' : size === 'lg' ? '10px 24px' : '8px 20px'
        }}
        {...props}
      />
      <div className="flex flex-col bg-container-secondary rounded border border-fg-08 shrink-0">
        <button
          type="button"
          onClick={handleIncrement}
          className="flex items-center justify-center px-0.5 py-0.5 text-fg-64 hover:text-fg-100 transition-colors"
        >
          <Icon name="chevron-up" folder="active/ui" size={8} />
        </button>
        <div className="h-px bg-fg-08" />
        <button
          type="button"
          onClick={handleDecrement}
          className="flex items-center justify-center px-0.5 py-0.5 text-fg-64 hover:text-fg-100 transition-colors"
        >
          <Icon name="chevron-down" folder="active/ui" size={8} />
        </button>
      </div>
    </div>
  )
}

export default Stepper
