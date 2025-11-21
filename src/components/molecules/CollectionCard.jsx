import { useState } from 'react'
import { Tag, Pill, Illustration, Logomark, Grid } from '../atoms'

/**
 * CollectionCard - Reusable card component for collections
 * Supports illustrations, logomarks, and videos with consistent layout and hover behavior
 *
 * @param {Object} item - The item data object
 * @param {string} type - Type of collection item: 'illustration' | 'logomark' | 'video'
 * @param {Function} onClick - Optional click handler (used for videos)
 * @param {Function} renderPreview - Optional custom preview renderer
 * @param {string} backgroundColor - Optional background color class
 */
export default function CollectionCard({
  item,
  type = 'illustration',
  onClick,
  renderPreview,
  backgroundColor
}) {
  const [isHovered, setIsHovered] = useState(false)

  // Determine background color
  const isIllustrationLike = type === 'illustration' || type === 'grid'
  const bgClass = backgroundColor || (isIllustrationLike ? 'bg-fg-88' : 'bg-surface-primary')

  // Determine aspect ratio based on type
  const aspectClass = type === 'video' ? 'aspect-video' : 'aspect-square'

  // Determine if this is a clickable card
  const isClickable = !!onClick

  // Render the preview content based on type
  const renderPreviewContent = () => {
    if (renderPreview) {
      return (
        <div className="absolute inset-0">
          {renderPreview(item, isHovered)}
        </div>
      )
    }

    switch (type) {
      case 'illustration':
        const illustrationAlt = `${item.name} - ${item.description || item.type}`
        return (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className={`transition-all duration-300 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
            >
              <Illustration
                name={item.illustrationName}
                size={320}
                alt={illustrationAlt}
              />
            </div>
          </div>
        )
      case 'grid':
        const gridAlt = `${item.name} - ${item.description || item.type}`
        return (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className={`transition-all duration-300 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
            >
              <Grid
                name={item.gridName || item.illustrationName}
                size={320}
                alt={gridAlt}
              />
            </div>
          </div>
        )

      case 'logomark':
        const logoSize = item.type === 'Wordmark' ? 160 : 96
        const logoAlt = `${item.name} ${item.type} logo`
        return (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className={`transition-all duration-300 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
            >
              <Logomark
                name={item.logoName}
                size={logoSize}
                alt={logoAlt}
              />
            </div>
          </div>
        )

      case 'video':
        return (
          <div className="absolute inset-0 bg-surface-secondary flex items-center justify-center">
            <div className="text-fg-24 kol-mono-text">▶</div>
          </div>
        )

      default:
        return null
    }
  }

  // Determine text content based on type
  const getTitle = () => {
    if (type === 'video') return item.title
    return item.name
  }

  const getSubtext = () => {
    if (type === 'video') return item.subtitle
    return item.description
  }

  const CardWrapper = isClickable ? 'button' : 'div'

  // Determine aria-label for the card wrapper
  const getAriaLabel = () => {
    if (!isClickable) return undefined
    if (type === 'video') return `Play ${item.title}`
    return `View ${item.name}`
  }

  return (
    <CardWrapper
      className={`group relative ${aspectClass} ${bgClass} border border-auto rounded overflow-hidden hover:border-hover transition-all duration-300 ${
        isClickable ? 'cursor-pointer' : 'cursor-default'
      } w-full`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      aria-label={getAriaLabel()}
    >
      {/* Preview Content */}
      {renderPreviewContent()}

      {/* Text Overlay */}
      <div className="relative z-10 p-4 pb-5 flex flex-col justify-end h-full min-h-[200px]">
        {/* Info Panel - Only visible on hover */}
        <div
          className={`space-y-3 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 text-left">
              <h3 className="kol-mono-text mb-1">
                {getTitle()}
              </h3>
              {getSubtext() && (
                <p className="kol-mono-sm-fine text-fg-48">
                  {getSubtext()}
                </p>
              )}
            </div>
            {/* Optional badge (e.g., TD pill for Touch Designer videos) */}
            {item.touchDesigner && (
              <Pill variant="subtle" size="sm">TD</Pill>
            )}
          </div>

          {/* Tags */}
          {item.type && item.year && (
            <div className="flex flex-wrap gap-2">
              <Tag variant="light" size="sm">
                {item.type}
              </Tag>
              <Tag variant="muted" size="sm">
                {item.year}
              </Tag>
            </div>
          )}
        </div>
      </div>
    </CardWrapper>
  )
}
