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
          active ? 'bg-surface-on-primary' : 'bg-container-primary hover:bg-fg-24'
        }`}
        title={label}
      >
        <img src={icon} alt="" className="w-4 h-4 invert brightness-150" />
      </button>
      {hasDropdown && (
        <button
          type="button"
          className={`w-5 h-9 border-l border-fg-08 text-fg-64 ${
            dropdownOpen ? 'bg-surface-on-primary text-auto' : 'bg-container-primary hover:bg-fg-24'
          }`}
          onClick={onDropdownToggle}
          title={`${label} options`}
        >
          <Icon name="caret-down-ui-dropdown" folder="app-icons" size={12} />
        </button>
      )}
    </div>
  )
}

export default ToolbarButton
