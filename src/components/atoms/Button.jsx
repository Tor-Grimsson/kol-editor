const Button = ({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  square = false,
  disabled = false,
  title,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded flex items-center justify-center transition-colors'

  const variants = {
    default: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100',
    primary: 'bg-blue-600 hover:bg-blue-500 text-white',
    ghost: 'bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
  }

  // Square buttons (icon buttons) have fixed width/height
  const squareSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  }

  // Regular buttons expand to fit content
  const regularSizes = {
    sm: 'px-2 h-7 text-xs',
    md: 'px-3 h-9 text-sm',
    lg: 'px-4 h-11 text-base',
  }

  const sizeStyles = square ? squareSizes[size] : regularSizes[size]
  const disabledStyles = disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      className={`${baseStyles} ${variants[variant]} ${sizeStyles} ${disabledStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
