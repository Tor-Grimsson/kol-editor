import { useRef, useState } from 'react'
import ToolButton from '../molecules/ToolButton'
import Separator from '../atoms/Separator'
import Icon from '../icons/Icon'
import { TOOLBAR_LAYOUT, TOOL_SUBMENUS, FILTER_OPTIONS, FILTER_GROUPS } from '../../constants/editor'

// Icon map using tools-name folder structure
const iconMap = {
  select: { folder: 'tools-name/other', name: 'pointer-selector' },
  frame: { folder: 'tools-name/other', name: 'crop' },
  zoom: { folder: 'tools-name/other', name: 'zoom-magnify' },
  flipX: { folder: 'tools-name/shape-align', name: 'flip-x' },
  flipY: { folder: 'tools-name/shape-align', name: 'flip-y' },
  rotateLeft: { folder: 'tools-name/other', name: 'turn-90-left' },
  rotateRight: { folder: 'tools-name/other', name: 'turn-90-right' },
  align: { folder: 'tools-name/shape-align', name: 'auto-layout' },
  pen: { folder: 'tools-name/shape-align', name: 'pen' },
  draw: { folder: 'tools-name/shape-align', name: 'pencil' },
  shape: { folder: 'tools-name/shape-align', name: 'rectangle' },
  text: { folder: 'tools-name/other', name: 'font=03' },
  photo: { folder: 'a1', name: 'photo-02' },
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
  const [expandedGroup, setExpandedGroup] = useState(null)

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
          className={`ml-auto px-3 h-9 rounded border border-zinc-700 flex items-center gap-2 ${
            filterMenuOpen ? 'bg-blue-600 border-blue-500' : 'bg-zinc-900 hover:bg-zinc-800'
          }`}
          onClick={() => setFilterMenuOpen((prev) => !prev)}
        >
          Filters <Icon name="auto-layout" folder="tools-name/shape-align" size={16} />
        </button>
      </div>

      {filterMenuOpen && (
        <div className="absolute top-full right-4 mt-1 z-10 rounded border border-zinc-800 bg-zinc-900 shadow-lg min-w-[220px]">
          <div className="flex flex-col py-1">
            {FILTER_GROUPS.map((group) => {
              const groupFilters = FILTER_OPTIONS.filter(f => f.group === group.id)
              const isExpanded = expandedGroup === group.id

              return (
                <div key={group.id}>
                  <button
                    type="button"
                    className="w-full text-left hover:bg-zinc-800 text-zinc-200 flex items-center justify-between"
                    style={{ padding: '8px 12px' }}
                    onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                  >
                    <span className="font-medium">{group.label}</span>
                    <span className="text-zinc-500">{isExpanded ? '▼' : '▶'}</span>
                  </button>
                  {isExpanded && (
                    <div className="bg-zinc-950">
                      {groupFilters.map((filter) => (
                        <button
                          key={filter.id}
                          type="button"
                          className="w-full text-left hover:bg-zinc-800 text-zinc-300 flex items-center gap-2"
                          style={{ padding: '8px 12px 8px 24px' }}
                          onClick={() => {
                            onFilterSelect(filter.id)
                            setFilterMenuOpen(false)
                          }}
                        >
                          <Icon name={filter.icon.name} folder={filter.icon.folder} size={14} />
                          <span className="text-sm">{filter.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Toolbar
