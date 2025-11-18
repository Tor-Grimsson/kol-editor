import { useState, useMemo } from 'react'
import Tag from '../../atoms/Tag'
import Divider from '../../atoms/Divider'
import Icon from '../../atoms/icons/Icon'
import ViewToggle from '../../molecules/ViewToggle'

/**
 * ContentFilters - Universal filter component for content grids
 *
 * Reusable filter component with expandable panel, tag-based filtering,
 * and view mode toggle. Used across Collections, Specimens, Typefaces, Work, etc.
 *
 * @param {Object} props
 * @param {Array} props.items - Array of items to filter
 * @param {string} props.title - Section title (e.g., "All Typefaces", "Type Specimens")
 * @param {number} props.totalCount - Total count of all items (before filtering)
 * @param {Array} props.filterGroups - Array of filter group configs [{label, key, values}, ...]
 * @param {Function} props.renderItem - Function to render filtered items: (item, viewMode) => ReactNode
 * @param {Array} props.viewModeOptions - Optional view mode options for ViewToggle
 * @param {string} props.defaultViewMode - Default view mode (default: 'list')
 * @param {Function} props.onFilterChange - Optional callback when filters change
 * @param {Array} props.mutuallyExclusiveFilters - Array of filter keys that should be mutually exclusive (e.g., ['name'])
 * @param {Array} props.customFilterKeys - Array of filter keys that are handled by renderItem, not by ContentFilters (e.g., ['axis'])
 */
const ContentFilters = ({
  items,
  title,
  totalCount,
  filterGroups = [],
  renderItem,
  viewModeOptions,
  defaultViewMode = 'list',
  onFilterChange,
  mutuallyExclusiveFilters = [],
  customFilterKeys = []
}) => {
  const [activeFilters, setActiveFilters] = useState(new Set())
  const [isExpanded, setIsExpanded] = useState(false)
  const [viewMode, setViewMode] = useState(defaultViewMode)

  const toggleFilter = (filterType, value) => {
    const newFilters = new Set(activeFilters)
    const filterKey = `${filterType}:${value}`

    if (newFilters.has(filterKey)) {
      newFilters.delete(filterKey)
    } else {
      // If this filter type is mutually exclusive, remove any existing filters of the same type
      if (mutuallyExclusiveFilters.includes(filterType)) {
        Array.from(newFilters).forEach(existingFilter => {
          if (existingFilter.startsWith(`${filterType}:`)) {
            newFilters.delete(existingFilter)
          }
        })
      }
      newFilters.add(filterKey)
    }

    setActiveFilters(newFilters)
    if (onFilterChange) {
      onFilterChange(newFilters, viewMode)
    }
  }

  const clearAllFilters = () => {
    setActiveFilters(new Set())
    if (onFilterChange) {
      onFilterChange(new Set(), viewMode)
    }
  }

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
    if (onFilterChange) {
      onFilterChange(activeFilters, mode)
    }
  }

  // Filter items based on active filters
  const filteredItems = useMemo(() => {
    if (activeFilters.size === 0) return items

    return items.filter((item) => {
      let matches = true
      activeFilters.forEach((filter) => {
        const [filterType, value] = filter.split(':')
        // Skip custom filter keys that are handled by renderItem
        if (customFilterKeys.includes(filterType)) return
        if (item[filterType] !== value) matches = false
      })
      return matches
    })
  }, [items, activeFilters, customFilterKeys])

  const renderFilterGroup = (group) => (
    <div key={group.key}>
      <h4 className="kol-mono-sm">{group.label}</h4>
      <div className="flex flex-wrap gap-2 pt-2">
        {group.values.map((value) => {
          const filterKey = `${group.key}:${value}`
          const isActive = activeFilters.has(filterKey)

          return (
            <div key={value} onClick={() => toggleFilter(group.key, value)}>
              <Tag
                variant="default"
                className={isActive ? 'border-fg-32' : 'border-fg-08'}
              >
                {value}
              </Tag>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="w-full">
      {/* Header with Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="kol-mono-sm-fine">{title}</h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-container-secondary rounded-sm transition-colors leading-none"
            aria-label="Toggle filters"
          >
            <Icon name="filter" size={16} />
          </button>
          {activeFilters.size > 0 && (
            <span className="kol-mono-xs text-fg-64">
              {activeFilters.size} {activeFilters.size === 1 ? 'filter' : 'filters'} active
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="kol-mono-xs text-fg-64">
            {filteredItems.length} of {totalCount}
          </span>
          {viewModeOptions && (
            <ViewToggle
              viewMode={viewMode}
              onViewChange={handleViewModeChange}
              options={viewModeOptions}
            />
          )}
        </div>
      </div>

      <Divider className="mb-4" />

      {isExpanded && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="kol-heading-md">Filter Collection</h3>
            {activeFilters.size > 0 && (
              <button
                onClick={clearAllFilters}
                className="kol-text-sm transition-colors underline"
              >
                Clear all ({activeFilters.size})
              </button>
            )}
          </div>

          {/* Filter Groups - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-4">
              {filterGroups.slice(0, 2).map((group) => renderFilterGroup(group))}
            </div>
            {/* Right Column */}
            <div className="space-y-4">
              {filterGroups.slice(2).map((group) => renderFilterGroup(group))}
            </div>
          </div>
        </>
      )}

      {/* Render filtered items */}
      <div className="mt-8">
        {renderItem(filteredItems, viewMode)}
      </div>
    </div>
  )
}

export default ContentFilters
