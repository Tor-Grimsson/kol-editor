import { useRef } from 'react'
import ToolbarButton from '../molecules/ToolbarButton'
import Separator from '../atoms/Separator'
import Icon from '../icons/Icon'
import { TOOLBAR_LAYOUT, TOOL_SUBMENUS, FILTER_OPTIONS } from '../../constants/editor'
import PointerIcon from '../../assets/icons/custom/pointer.svg'
import ZoomIcon from '../../assets/icons/tui/zoom.svg'
import CropIcon from '../../assets/icons/tui/crop.svg'
import FlipXIcon from '../../assets/icons/tui/flip-x.svg'
import FlipYIcon from '../../assets/icons/tui/flip-y.svg'
import RotateLeftIcon from '../../assets/icons/tui/rotate-left.svg'
import RotateRightIcon from '../../assets/icons/tui/rotate-right.svg'
import DrawIcon from '../../assets/icons/tui/draw.svg'
import ShapeIcon from '../../assets/icons/tui/shape.svg'
import TextIcon from '../../assets/icons/tui/text.svg'

const iconMap = {
  select: PointerIcon,
  zoom: ZoomIcon,
  crop: CropIcon,
  flipX: FlipXIcon,
  flipY: FlipYIcon,
  rotateLeft: RotateLeftIcon,
  rotateRight: RotateRightIcon,
  draw: DrawIcon,
  shape: ShapeIcon,
  text: TextIcon
}

const Toolbar = ({
  activeTool,
  dropdownState,
  toolSelections,
  filterMenuOpen,
  onToolbarButton,
  onToggleDropdown,
  onToolOption,
  onFilterSelect,
  setFilterMenuOpen
}) => {
  const toolbarRef = useRef(null)
  const toolbarButtonRefs = useRef(new Map())

  const renderToolButton = (item) => {
    if (item.type === 'separator') return <Separator key={item.id} />

    const hasDropdown = Boolean(item.dropdown && TOOL_SUBMENUS[item.id]?.length)

    return (
      <ToolbarButton
        key={item.id}
        icon={iconMap[item.id]}
        label={item.label}
        active={activeTool === item.id}
        hasDropdown={hasDropdown}
        dropdownOpen={dropdownState.toolId === item.id}
        onClick={() => onToolbarButton(item.id)}
        onDropdownToggle={() => onToggleDropdown(item.id, toolbarButtonRefs, toolbarRef)}
        buttonRef={(node) => {
          if (node) toolbarButtonRefs.current.set(item.id, node)
          else toolbarButtonRefs.current.delete(item.id)
        }}
      />
    )
  }

  const renderToolOptionsPanel = () => {
    if (!dropdownState.toolId) return null
    const options = TOOL_SUBMENUS[dropdownState.toolId]
    if (!options?.length) return null

    return (
      <div
        className="absolute z-20 pointer-events-none"
        style={{ top: 'calc(100% + 8px)', left: dropdownState.left, transform: 'translateX(-50%)' }}
      >
        <div className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 shadow-xl pointer-events-auto">
          {options.map((option) => {
            const isActive = toolSelections[dropdownState.toolId] === option.id
            const fallback = <span className="text-[10px] uppercase">{option.label[0]}</span>

            return (
              <button
                key={option.id}
                className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                  isActive
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-zinc-800 border-transparent text-zinc-300 hover:bg-zinc-700'
                }`}
                title={option.label}
                onClick={() => onToolOption(dropdownState.toolId, option.id)}
              >
                {option.icon ? <Icon name={option.icon} size={16} fallback={fallback} /> : fallback}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="relative border-b border-zinc-800 bg-zinc-900" ref={toolbarRef}>
      <div className="flex items-center px-3 py-2 gap-1">
        {TOOLBAR_LAYOUT.map((item) => renderToolButton(item))}
        <button
          type="button"
          className={`ml-auto px-3 h-9 rounded border border-zinc-700 ${
            filterMenuOpen ? 'bg-blue-600 border-blue-500' : 'bg-zinc-900 hover:bg-zinc-800'
          }`}
          onClick={() => setFilterMenuOpen((prev) => !prev)}
        >
          Filters ¾
        </button>
      </div>

      {renderToolOptionsPanel()}

      {filterMenuOpen && (
        <div className="absolute top-full right-4 mt-1 z-10 rounded border border-zinc-800 bg-zinc-900 shadow-lg min-w-[180px]">
          <div className="px-3 py-2 text-zinc-400 uppercase tracking-wide">Filters</div>
          <div className="flex flex-col">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className="px-3 py-1 text-left hover:bg-zinc-800 text-zinc-200"
                onClick={() => onFilterSelect(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Toolbar
