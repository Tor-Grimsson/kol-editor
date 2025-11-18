import Icon from '../icons/Icon'

const LayerItem = ({
  layer,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp,
  canMoveDown,
  children
}) => {
  return (
    <div className="space-y-1">
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        className={`w-full flex items-center justify-between rounded border px-3 py-2 ${
          isSelected ? 'border-blue-500 bg-blue-600/20' : 'border-transparent bg-zinc-800'
        }`}
      >
        <div className="flex items-center gap-1">
          {layer.objects?.length > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpand()
              }}
              className="w-4 h-4 text-zinc-400 hover:text-white"
            >
              <Icon name={isExpanded ? 'caret-down' : 'caret-right'} size={12} />
            </button>
          ) : (
            <span className="w-4" />
          )}
          <span>{layer.name}</span>
        </div>

        <div className="flex items-center gap-1 text-zinc-400">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleVisibility()
            }}
            title={layer.visible ? 'Hide' : 'Show'}
            className={layer.visible ? '' : 'opacity-40'}
          >
            <Icon name="visible2" size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMoveUp()
            }}
            disabled={!canMoveUp}
            className="disabled:opacity-30"
          >
            <Icon name="up-arrow" size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMoveDown()
            }}
            disabled={!canMoveDown}
            className="disabled:opacity-30"
          >
            <Icon name="down-arrow" size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="hover:text-red-400"
          >
            <Icon name="trash" size={14} />
          </button>
        </div>
      </div>

      {isExpanded && children}
    </div>
  )
}

export default LayerItem
