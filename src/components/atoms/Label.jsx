const Label = ({ children, htmlFor, className = '' }) => {
  return (
    <label htmlFor={htmlFor} className={`text-fg-48 ${className}`}>
      {children}
    </label>
  )
}

export default Label
