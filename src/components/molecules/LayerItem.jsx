import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Icon from '../icons/Icon'

const LayerItem = ({
  layer,
  isSelected,
  hasSelectedChild,
  hasChildren,
  isExpanded,
  onSelect,
  onToggleExpand,
  onToggleVisibility,
  showOutline,
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
  } = useSortable({ id: layer.id })

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
        role="button"
        tabIndex={0}
        onClick={onSelect}
        {...attributes}
        {...listeners}
        className={`group px-4 rounded flex justify-between items-center overflow-hidden cursor-grab active:cursor-grabbing ${
          isSelected
            ? 'bg-zinc-800/50 outline-1 outline-offset-[-1px] outline-orange-500'
            : hasSelectedChild
            ? 'bg-zinc-800/50 outline-1 outline-offset-[-1px] outline-amber-300/40'
            : 'opacity-40 bg-zinc-800/50 outline-1 outline-offset-[-1px] outline-zinc-800/50'
        } ${
          showOutline ? 'outline-2 outline-blue-500' : ''
        }`}
        style={{
          height: '48px',
          marginLeft: `${nestLevel * 16}px`
        }}
      >
        <div className="flex justify-start items-center gap-2">
          {hasChildren && (
            <div
              className="cursor-pointer hidden group-hover:flex items-center"
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpand()
              }}
            >
              <Icon
                name={isExpanded ? 'caret-down' : 'caret-right'}
                folder="c"
                size={12}
                className="text-zinc-400"
              />
            </div>
          )}
          <div className="w-1 h-1 bg-zinc-300 rounded-full" />
          <div className="text-zinc-300 text-xs font-semibold font-mono uppercase leading-3 tracking-tight">
            CANVAS
          </div>
        </div>
        <div className="flex justify-start items-center gap-4">
          <Icon
            name={layer.visible ? 'eye' : 'eye-off'}
            folder="tools-name/other"
            size={12}
            className="text-white cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              onToggleVisibility()
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default LayerItem
