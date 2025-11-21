import Icon from "../icons/Icon"

export default function ButtonNav({
  direction = 'next',
  onClick,
  children,
  className = ''
}) {
  const isBack = direction === 'back' || direction === 'left'
  const iconRotation = isBack ? '-rotate-90' : 'rotate-90'
  const label = children || (isBack ? 'Back' : 'Next')

  return (
    <button
      onClick={onClick}
      className={`btn-nav inline-flex items-center justify-center gap-2 w-fit px-4 py-1 rounded-full bg-fg-04 cursor-pointer ${className}`}
    >
      {isBack && (
        <span className="inline-flex items-center h-[12px]">
          <Icon name="arrow-up" size={12} className={iconRotation} />
        </span>
      )}
      <span className="kol-helper-xs">{label}</span>
      {!isBack && (
        <span className="inline-flex items-center h-[12px]">
          <Icon name="arrow-up" size={12} className={iconRotation} />
        </span>
      )}
    </button>
  )
}
