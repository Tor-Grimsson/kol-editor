import { useRef } from 'react'
import ToolButton from '../molecules/ToolButton'
import Separator from '../atoms/Separator'
import { TOOLBAR_LAYOUT, TOOL_SUBMENUS, FILTER_OPTIONS } from '../../constants/editor'

// Icon map using tools-name folder structure
const iconMap = {
  select: { folder: 'tools-name/other', name: 'pointer-selector' },
  frame: { folder: 'tools-name/shape-align', name: 'square' },
  zoom: { folder: 'tools-name/other', name: 'zoom-magnify' },
  crop: { folder: 'tools-name/other', name: 'crop' },
  flipX: { folder: 'tools-name/shape-align', name: 'flip-x' },
  flipY: { folder: 'tools-name/shape-align', name: 'flip-y' },
  rotateLeft: { folder: 'tools-name/other', name: 'turn-90-left' },
  rotateRight: { folder: 'tools-name/other', name: 'turn-90-right' },
  draw: { folder: 'tools-name/shape-align', name: 'pencil' },
  shape: { folder: 'tools-name/shape-align', name: 'rectangle' },
  text: { folder: 'tools-name/other', name: 'font=03' },
  boolean: { folder: 'tools-name/shape-align', name: 'boolean-unite' }
}

const Toolbar = ({
  activeTool,
  dropdownState,
  filterMenuOpen,
  onToolbarButton,
  onToggleDropdown,
  onFilterSelect,
  setFilterMenuOpen
}) => {
  const toolbarRef = useRef(null)
  const toolbarButtonRefs = useRef(new Map())

  const renderToolButton = (item) => {
    if (item.type === 'separator') return <Separator key={item.id} />

    const subtools = TOOL_SUBMENUS[item.id]?.map(sub => ({
      id: sub.id,
      label: sub.label,
      icon: sub.icon
    })) || []

    const tool = {
      id: item.id,
      label: item.label,
      icon: iconMap[item.id],
      subtools,
      disabled: item.disabled
    }

    return (
      <ToolButton
        key={item.id}
        tool={tool}
        isActive={activeTool === item.id}
        onSelect={(selectedTool) => {
          // If a subtool was selected, use it, otherwise use the main tool
          const toolId = selectedTool?.id || item.id
          onToolbarButton(toolId)
        }}
        onToggleDropdown={() => onToggleDropdown(item.id, toolbarButtonRefs, toolbarRef)}
        showDropdown={dropdownState.toolId === item.id}
        dropdownLeft={dropdownState.left}
      />
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
          Filters �
        </button>
      </div>

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
