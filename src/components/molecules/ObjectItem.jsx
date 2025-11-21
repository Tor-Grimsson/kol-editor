import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Icon from '../icons/Icon'

const ObjectItem = ({
  object,
  isSelected,
  onSelect,
  onToggleVisibility,
  onDelete,
  showLine,
  nestLevel = 0
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: object.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div className="relative" ref={setNodeRef} style={style}>
      {/* Drop line indicator - shows BEFORE this item */}
      {showLine && (
        <div
          className="absolute -top-0.5 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10"
          style={{
            left: `${nestLevel * 16}px`,
            width: `calc(100% - ${nestLevel * 16}px)`
          }}
        />
      )}

      <div
        onClick={onSelect}
        data-layer-id={object.id}
        {...attributes}
        {...listeners}
        className={`h-9 px-4 py-3 rounded flex justify-between items-center overflow-hidden cursor-grab active:cursor-grabbing ${
          isSelected
            ? 'bg-zinc-800/50 outline-1 outline-offset-[-1px] outline-orange-500'
            : 'opacity-40 bg-zinc-800/50'
        }`}
        style={{
          marginLeft: `${nestLevel * 16}px`
        }}
      >
        <div className="text-zinc-300 text-xs font-semibold font-mono uppercase leading-3 tracking-tight">
          OBJECT
        </div>
        <div className="flex justify-start items-center gap-4">
          {isSelected ? (
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
          ) : (
            <div className="w-2.5 h-2.5 rounded-full border border-zinc-300" />
          )}
        </div>
      </div>
    </div>
  )
}

export default ObjectItem
