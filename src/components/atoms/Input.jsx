const Input = ({
  type = 'text',
  value,
  onChange,
  min,
  max,
  step,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'outline-none transition-colors'

  const typeStyles = {
    text: 'bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100',
    number: 'bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100',
    range: 'accent-blue-500',
    color: 'border border-zinc-700 rounded bg-transparent cursor-pointer',
  }

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={`${baseStyles} ${typeStyles[type] || typeStyles.text} ${className}`}
      {...props}
    />
  )
}

export default Input
