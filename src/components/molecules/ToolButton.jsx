import { useState } from 'react'
import Icon from '../icons/Icon'

const ToolButton = ({
  tool,
  isActive,
  onSelect,
  onToggleDropdown,
  showDropdown,
  dropdownLeft
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const hasSubtools = tool.subtools && tool.subtools.length > 0
  const isDisabled = tool.disabled

  return (
    <div className="relative inline-block">
      <button
        className={`relative h-9 px-2 rounded transition-colors group ${
          isDisabled
            ? 'text-fg-24 cursor-not-allowed opacity-40'
            : isActive
            ? 'bg-surface-on-primary text-auto'
            : 'text-fg-64 hover:bg-container-primary hover:text-auto'
        }`}
        onMouseEnter={() => !isDisabled && setIsHovered(true)}
        onMouseLeave={() => !isDisabled && setIsHovered(false)}
        onClick={isDisabled ? undefined : onSelect}
        title={isDisabled ? `${tool.label} (Coming soon)` : tool.label}
        disabled={isDisabled}
      >
        <div className="flex items-center gap-1">
          {typeof tool.icon === 'string' ? (
            <Icon name={tool.icon} size={20} />
          ) : (
            <Icon name={tool.icon.name} folder={tool.icon.folder} size={20} />
          )}

          {/* Hover caret - only show if tool has subtools */}
          {hasSubtools && isHovered && (
            <div
              className="absolute bottom-0 right-0 w-3 h-3 flex items-center justify-center cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onToggleDropdown()
              }}
            >
              <Icon name="dropdown-caret" folder="active/content" size={8} />
            </div>
          )}
        </div>
      </button>

      {/* Dropdown menu */}
      {showDropdown && hasSubtools && (
        <div
          className="absolute top-full mt-1 bg-surface-primary border border-fg-08 rounded py-1 z-50 w-fit"
          style={{ left: dropdownLeft }}
        >
          {tool.subtools.map((subtool) => (
            <button
              key={subtool.id}
              className={`w-full px-3 py-2 text-left flex items-center gap-2 ${
                subtool.disabled
                  ? 'text-fg-32 cursor-not-allowed opacity-50'
                  : 'text-fg-80 hover:bg-container-primary hover:text-auto'
              }`}
              onClick={() => {
                if (!subtool.disabled) {
                  onSelect(subtool)
                }
              }}
              disabled={subtool.disabled}
              title={subtool.disabled ? `${subtool.label} (Coming soon)` : subtool.label}
            >
              {typeof subtool.icon === 'string' ? (
                <Icon name={subtool.icon} size={16} />
              ) : (
                <Icon name={subtool.icon.name} folder={subtool.icon.folder} size={16} />
              )}
              <span className="text-sm whitespace-nowrap">{subtool.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ToolButton
