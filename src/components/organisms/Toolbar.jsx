import { useRef, useState } from 'react'
import ToolButton from '../molecules/ToolButton'
import Separator from '../atoms/Separator'
import Icon from '../icons/Icon'
import { TOOLBAR_LAYOUT, TOOL_SUBMENUS, FILTER_OPTIONS, FILTER_GROUPS } from '../../constants/editor'

// Icon map using app-icons folder
const iconMap = {
  select: { folder: 'app-icons', name: 'pointer-selector-tool-select' },
  frame: { folder: 'app-icons', name: 'crop-tool-frame' },
  zoom: { folder: 'app-icons', name: 'zoom-magnify-tool-zoom' },
  flipX: { folder: 'app-icons', name: 'flip-x-tool-transform' },
  flipY: { folder: 'app-icons', name: 'flip-y-tool-transform' },
  rotateLeft: { folder: 'app-icons', name: 'turn-90-left-tool-rotate' },
  rotateRight: { folder: 'app-icons', name: 'turn-90-right-tool-rotate' },
  align: { folder: 'app-icons', name: 'auto-layout-tool-align' },
  pen: { folder: 'app-icons', name: 'pen-tool-draw' },
  draw: { folder: 'app-icons', name: 'pencil-tool-draw' },
  shape: { folder: 'app-icons', name: 'rectangle-tool-shape' },
  text: { folder: 'app-icons', name: 'font-03-tool-text' },
  photo: { folder: 'app-icons', name: 'photo-02-tool-photo' },
  boolean: { folder: 'app-icons', name: 'boolean-unite-tool-boolean' }
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
    <div className="relative border-b border-fg-08 bg-surface-primary" ref={toolbarRef}>
      <div className="flex items-center px-3 py-2 gap-1">
        {TOOLBAR_LAYOUT.map((item) => renderToolButton(item))}
        <button
          type="button"
          className={`ml-auto px-3 h-9 rounded border flex items-center gap-2 kol-mono-xs ${
            filterMenuOpen ? 'bg-surface-on-primary border-surface-on-primary text-surface-primary' : 'bg-surface-primary border-fg-08 hover:bg-fg-08 text-auto'
          }`}
          onClick={() => setFilterMenuOpen((prev) => !prev)}
        >
          Filters <Icon name="auto-layout-tool-align" folder="app-icons" size={16} />
        </button>
      </div>

      {filterMenuOpen && (
        <div className="absolute top-full right-4 mt-1 z-10 rounded border border-fg-08 bg-container-elevated min-w-[220px]">
          <div className="flex flex-col py-1">
            {FILTER_GROUPS.map((group) => {
              const groupFilters = FILTER_OPTIONS.filter(f => f.group === group.id)
              const isExpanded = expandedGroup === group.id

              return (
                <div key={group.id}>
                  <button
                    type="button"
                    className="w-full text-left hover:bg-fg-08 text-auto flex items-center justify-between"
                    style={{ padding: '8px 12px' }}
                    onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                  >
                    <span className="font-medium kol-mono-xs">{group.label}</span>
                    <span className="text-fg-48">{isExpanded ? '▼' : '▶'}</span>
                  </button>
                  {isExpanded && (
                    <div className="bg-fg-04">
                      {groupFilters.map((filter) => (
                        <button
                          key={filter.id}
                          type="button"
                          className="w-full text-left hover:bg-fg-08 text-fg-80 flex items-center gap-2"
                          style={{ padding: '8px 12px 8px 24px' }}
                          onClick={() => {
                            onFilterSelect(filter.id)
                            setFilterMenuOpen(false)
                          }}
                        >
                          <Icon name={filter.icon.name} folder={filter.icon.folder} size={14} />
                          <span className="kol-mono-xs">{filter.label}</span>
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
