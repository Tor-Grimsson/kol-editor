import { useState } from 'react'
import Tag from '../../atoms/Tag'
import Divider from '../../atoms/Divider'
import Icon from '../../atoms/icons/Icon'

export default function CollectionFilters({
  logomarks,
  onFilterChange,
  collections = [],
  totalCount,
  showCollectionCategories = true,
  collectionTitle = 'Collection'
}) {
  const [activeFilters, setActiveFilters] = useState(new Set())
  const [isExpanded, setIsExpanded] = useState(false)

  const categories = [...new Set(logomarks.map((l) => l.category))]
  const types = [...new Set(logomarks.map((l) => l.type))]
  const years = [...new Set(logomarks.map((l) => l.year))].sort()

  const allFilters = {
    category: categories,
    type: types,
    year: years,
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
    onFilterChange(newFilters)
  }

  const clearAllFilters = () => {
    setActiveFilters(new Set())
    onFilterChange(new Set())
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
          <h2 className="kol-mono-sm-fine">{collectionTitle}</h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-container-secondary rounded-sm transition-colors leading-none"
            aria-label="Toggle filters"
          >
            <Icon name="filter" size={16} />
          </button>
        </div>
        <p className="kol-mono-sm-fine">
          {logomarks.length} of {totalCount} items
        </p>
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

      {/* Collection Categories */}
      {showCollectionCategories && collections.length > 0 && (
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {collections.map((collection, index) => (
              <div
                key={index}
                className="bg-surface-secondary rounded-lg p-4 border border-auto hover:border-hover transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="kol-text font-medium text-auto">{collection.title}</h4>
                  <span className="kol-text-small text-auto/60">
                    {collection.count}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {collection.items.map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2 py-0.5 rounded-full bg-fg-16 text-auto text-xs border border-surface-16"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

          {/* Filter Groups */}
          <div className="space-y-4">
            {renderFilterGroup('Category', 'category', allFilters.category)}
            {renderFilterGroup('Type', 'type', allFilters.type)}
            {renderFilterGroup('Year', 'year', allFilters.year)}
          </div>
        </>
      )}
    </div>
  )
}
