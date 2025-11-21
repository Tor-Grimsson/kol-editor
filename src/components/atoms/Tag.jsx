export default function Tag({
  text,
  children,
  variant = 'default',
  className = ''
}) {
  const baseClass = variant === 'inverse' ? 'control-unified-inverse' : 'tag-control'
  const content = children || text

  return (
    <div className={`cursor-pointer ${baseClass} whitespace-nowrap ${className}`}>
      <span>{content}</span>
    </div>
  )
}
