import Icon from '../icons/Icon'

const ObjectItem = ({
  object,
  isSelected,
  onSelect,
  onToggleVisibility,
  onDelete
}) => {
  return (
    <div
      className={`flex items-center justify-between rounded px-2 py-1 ${
        isSelected ? 'bg-blue-600/30' : 'bg-zinc-800'
      }`}
      onClick={onSelect}
    >
      <span>{object.name}</span>
      <div className="flex items-center gap-1 text-zinc-400">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleVisibility()
          }}
          className={object.visible ? '' : 'opacity-40'}
        >
          <Icon name="visible2" size={14} />
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
  )
}

export default ObjectItem
