import { useState } from 'react'
import Tag from '../../atoms/Tag'
import Divider from '../../atoms/Divider'
import Icon from '../../atoms/icons/Icon'

export default function SpecimenFilters({
  specimens,
  onFilterChange,
  totalCount,
  viewModes = ['hubs', 'all', 'by-typeface']
}) {
  const [activeFilters, setActiveFilters] = useState(new Set())
  const [isExpanded, setIsExpanded] = useState(false)
  const [viewMode, setViewMode] = useState('hubs') // 'hubs' | 'all' | 'by-typeface'

  // Extract unique values for filters
  const typefaces = [...new Set(specimens.map((s) => s.typeface))].sort()
  const categories = [...new Set(specimens.map((s) => s.category))].sort()

  const allFilters = {
    typeface: typefaces,
    category: categories
  }

  const toggleFilter = (filterType, value) => {
    const newFilters = new Set(activeFilters)
    const filterKey = `${filterType}:${value}`

    if (newFilters.has(filterKey)) {
      newFilters.delete(filterKey)
    } else {
      newFilters.add(filterKey)
    }

    setActiveFilters(newFilters)
    onFilterChange(newFilters, viewMode)
  }

  const clearAllFilters = () => {
    setActiveFilters(new Set())
    onFilterChange(new Set(), viewMode)
  }

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
    onFilterChange(activeFilters, mode)
  }

  const renderFilterGroup = (label, filterType, items) => (
    <div>
      <h4 className="kol-mono-sm">{label}</h4>
      <div className="flex flex-wrap gap-2 pt-2">
        {items.map((item) => {
          const filterKey = `${filterType}:${item}`
          const isActive = activeFilters.has(filterKey)

          return (
            <div key={item} onClick={() => toggleFilter(filterType, item)}>
              <Tag
                variant="default"
                className={isActive ? 'border-fg-32' : 'border-fg-08'}
              >
                {item}
              </Tag>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="kol-mono-sm-fine">Type Specimens</h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-container-secondary rounded-sm transition-colors leading-none"
            aria-label="Toggle filters"
          >
            <Icon name="filter" size={16} className="text-auto" />
          </button>
        </div>
        <p className="kol-mono-sm-fine">
          {specimens.length} of {totalCount} items
        </p>
      </div>

      <Divider className="mb-4" />

      {isExpanded && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="kol-heading-md">Filter Specimens</h3>
            {activeFilters.size > 0 && (
              <button
                onClick={clearAllFilters}
                className="kol-text-sm transition-colors underline"
              >
                Clear all ({activeFilters.size})
              </button>
            )}
          </div>

          {/* View Mode Selection */}
          <div className="mb-6">
            <h4 className="kol-mono-sm mb-3">View Mode</h4>
            <div className="flex flex-wrap gap-2">
              <div onClick={() => handleViewModeChange('hubs')}>
                <Tag
                  variant="default"
                  className={viewMode === 'hubs' ? 'border-fg-32' : 'border-fg-08'}
                >
                  Specimen Hubs
                </Tag>
              </div>
              <div onClick={() => handleViewModeChange('all')}>
                <Tag
                  variant="default"
                  className={viewMode === 'all' ? 'border-fg-32' : 'border-fg-08'}
                >
                  All Specimens
                </Tag>
              </div>
              <div onClick={() => handleViewModeChange('by-typeface')}>
                <Tag
                  variant="default"
                  className={viewMode === 'by-typeface' ? 'border-fg-32' : 'border-fg-08'}
                >
                  By Typeface
                </Tag>
              </div>
            </div>
          </div>

          {/* Filter Groups - Only show when not in 'hubs' mode */}
          {viewMode !== 'hubs' && (
            <div className="space-y-4">
              {renderFilterGroup('Typeface', 'typeface', allFilters.typeface)}
              {renderFilterGroup('Category', 'category', allFilters.category)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
