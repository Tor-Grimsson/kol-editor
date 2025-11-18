const Label = ({ children, htmlFor, className = '' }) => {
  return (
    <label htmlFor={htmlFor} className={`text-zinc-500 ${className}`}>
      {children}
    </label>
  )
}

export default Label
