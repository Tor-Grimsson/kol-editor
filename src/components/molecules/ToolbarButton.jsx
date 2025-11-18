import Button from '../atoms/Button'
import Icon from '../icons/Icon'

const ToolbarButton = ({
  icon,
  label,
  active = false,
  hasDropdown = false,
  dropdownOpen = false,
  onClick,
  onDropdownToggle,
  buttonRef
}) => {
  return (
    <div className="flex items-center">
      <button
        type="button"
        ref={buttonRef}
        onClick={onClick}
        className={`w-9 h-9 rounded flex items-center justify-center ${
          active ? 'bg-blue-600' : 'bg-zinc-800 hover:bg-zinc-700'
        }`}
        title={label}
      >
        <img src={icon} alt="" className="w-4 h-4 invert brightness-150" />
      </button>
      {hasDropdown && (
        <button
          type="button"
          className={`w-5 h-9 border-l border-zinc-700 text-zinc-400 ${
            dropdownOpen ? 'bg-blue-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700'
          }`}
          onClick={onDropdownToggle}
          title={`${label} options`}
        >
          <Icon name="caret-down" size={12} />
        </button>
      )}
    </div>
  )
}

export default ToolbarButton
