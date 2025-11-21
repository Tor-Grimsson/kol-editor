import { useRef, useState } from 'react'
import ToolButton from '../molecules/ToolButton'
import Separator from '../atoms/Separator'
import Icon from '../icons/Icon'
import { TOOLBAR_LAYOUT, TOOL_SUBMENUS, FILTER_OPTIONS, FILTER_GROUPS } from '../../constants/editor'

// Icon map using active icon folders
const iconMap = {
  select: { folder: 'library/tools', name: 'pointer-selector-tool-select' },
  frame: { folder: 'library/tools', name: 'crop-tool-frame' },
  zoom: { folder: 'library/tools', name: 'zoom-magnify-tool-zoom' },
  flipX: { folder: 'library/tools', name: 'flip-x-tool-transform' },
  flipY: { folder: 'active/tools', name: 'flip-y' },
  rotateLeft: { folder: 'active/tools', name: 'rotate-left' },
  rotateRight: { folder: 'active/tools', name: 'rotate-right' },
  align: { folder: 'active/tools', name: 'align-auto' },
  pen: { folder: 'library/tools', name: 'pen-tool-draw' },
  draw: { folder: 'library/tools', name: 'pencil-tool-draw' },
  shape: { folder: 'library/tools', name: 'rectangle-tool-shape' },
  text: { folder: 'library/tools', name: 'font-03-tool-text' },
  photo: { folder: 'library/tools', name: 'photo-02-tool-photo' },
  boolean: { folder: 'library/tools', name: 'boolean-unite-tool-boolean' }
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
          Filters <Icon name="align-auto" folder="active/tools" size={16} />
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
