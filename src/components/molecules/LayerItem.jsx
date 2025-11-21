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
          className="absolute -top-0.5 left-0 right-0 h-0.5 bg-surface-on-primary rounded-full z-10"
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
        data-layer-id={layer.id}
        {...attributes}
        {...listeners}
        className={`group px-4 rounded flex justify-between items-center overflow-hidden cursor-grab active:cursor-grabbing ${
          showOutline
            ? 'bg-container-primary/50 outline-2 outline-offset-[-2px] outline-surface-on-primary'
            : isSelected
            ? 'bg-container-primary/50 outline-1 outline-offset-[-1px] outline-surface-on-primary'
            : hasSelectedChild
            ? 'bg-container-primary/50 outline-1 outline-offset-[-1px] outline-fg-32'
            : 'opacity-40 bg-container-primary/50 outline-1 outline-offset-[-1px] outline-container-primary/50'
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
                name={isExpanded ? 'caret-down-ui-dropdown' : 'caret-right-ui-expand'}
                folder="app-icons"
                size={12}
                className="text-fg-64"
              />
            </div>
          )}
          <div className="w-1 h-1 bg-fg-80 rounded-full" />
          <div className="text-fg-80 kol-mono-xs font-semibold uppercase leading-3 tracking-tight">
            CANVAS
          </div>
        </div>
        <div className="flex justify-start items-center gap-4">
          <Icon
            name={layer.visible ? 'eye-on' : 'eye-off'}
            folder="active/status"
            size={12}
            className="text-auto cursor-pointer"
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
