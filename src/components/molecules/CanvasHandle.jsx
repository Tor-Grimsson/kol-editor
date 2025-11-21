const CanvasHandle = ({
  type = 'corner', // 'corner', 'edge', 'center'
  position,
  onPointerDown,
  cursor,
  title
}) => {
  const baseClass = 'absolute'

  const typeClasses = {
    corner: 'w-[10px] h-[10px] bg-surface-on-primary border border-surface-on-primary',
    edge: 'w-[12px] h-[12px] bg-surface-primary border-2 border-surface-on-primary rounded-full',
    center: 'w-4 h-4 bg-surface-on-primary/20 border border-surface-on-primary rounded-full cursor-move flex items-center justify-center'
  }

  const size = type === 'corner' ? 10 : type === 'edge' ? 12 : 16

  const style = {
    left: position.x - size / 2,
    top: position.y - size / 2,
    cursor: cursor || (type === 'center' ? 'move' : 'pointer')
  }

  return (
    <button
      className={`${baseClass} ${typeClasses[type]}`}
      style={style}
      onPointerDown={onPointerDown}
      title={title}
    >
      {type === 'center' && <span className="w-1 h-1 bg-surface-on-primary rounded-full" />}
    </button>
  )
}

export default CanvasHandle
