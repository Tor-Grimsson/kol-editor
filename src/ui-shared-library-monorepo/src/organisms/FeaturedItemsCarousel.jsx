import { useState, useEffect } from 'react'
import CarouselNavigation from '../molecules/CarouselNavigation'
import Pill from '../atoms/Pill'
import LinkWithIcon from '../atoms/LinkWithIcon'

/**
 * FeaturedItemsCarousel - Organism
 *
 * A rotating carousel for featured items with auto-rotation and manual navigation.
 * Displays items with metadata, content preview, and call-to-action.
 *
 * @param {Object} props
 * @param {Array} props.items - Array of items to display in carousel
 * @param {Function} props.renderContent - Function to render item content: (item) => ReactNode
 * @param {boolean} [props.autoRotate=true] - Enable auto-rotation
 * @param {number} [props.interval=5000] - Auto-rotation interval in milliseconds
 * @param {string} [props.counterLabel='Featured Work'] - Label for the counter section
 * @param {string} [props.className] - Additional CSS classes for container
 * @param {Object} [props.layout] - Layout configuration
 * @param {string} [props.layout.contentHeight='500px'] - Fixed height for content area
 *
 * @example
 * <FeaturedItemsCarousel
 *   items={featuredItems}
 *   renderContent={(item) => {
 *     if (item.type === 'video') {
 *       return <video src={item.videoUrl} autoPlay loop muted />
 *     }
 *     return <img src={item.imageUrl} alt={item.name} />
 *   }}
 *   autoRotate={true}
 *   interval={5000}
 * />
 *
 * Item structure:
 * {
 *   name: string,           // Item title
 *   type: string,           // Item type (for badge)
 *   subtitle: string,       // Item subtitle
 *   description: string,    // Item description
 *   route: string,          // Link destination
 *   linkLabel: string,      // Optional: Custom link text (default: "View Collection")
 *   badgeVariant: string,   // Optional: Pill variant (default: "subtle")
 *   badgeSize: string,      // Optional: Pill size (default: "sm")
 *   // ... any custom fields for renderContent
 * }
 */
const FeaturedItemsCarousel = ({
  items = [],
  renderContent,
  autoRotate = true,
  interval = 5000,
  counterLabel = 'Featured Work',
  className = '',
  layout = {}
}) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { contentHeight = '500px' } = layout

  // Auto-rotate carousel
  useEffect(() => {
    if (!autoRotate || items.length === 0) return

    const rotationInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % items.length)
    }, interval)

    return () => clearInterval(rotationInterval)
  }, [items.length, autoRotate, interval])

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + items.length) % items.length)
  }

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % items.length)
  }

  if (items.length === 0) {
    return null
  }

  const currentItem = items[currentSlide]

  return (
    <div className={`w-full ${className}`}>
      {/* Header with counter and navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <span className="kol-label-mono-xs text-auto">{counterLabel}</span>
          <span className="kol-mono-xs text-fg-64">
            {currentSlide + 1} / {items.length}
          </span>
        </div>
        <CarouselNavigation
          onPrevious={handlePrevSlide}
          onNext={handleNextSlide}
          iconSize={16}
        />
      </div>

      {/* Carousel content */}
      <div className="bg-container-primary p-12 lg:p-16 rounded">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12" style={{ minHeight: contentHeight }}>
          {/* Left column: Metadata */}
          <div className="space-y-6 flex flex-col justify-center">
            <div className="w-fit">
              <Pill
                variant={currentItem.badgeVariant || 'subtle'}
                size={currentItem.badgeSize || 'sm'}
              >
                {currentItem.type}
              </Pill>
            </div>

            <h2 className="kol-heading-xl text-auto">
              {currentItem.name || currentItem.title}
            </h2>

            {currentItem.subtitle && (
              <p className="kol-text-compact-xl text-fg-80">
                {currentItem.subtitle}
              </p>
            )}

            {currentItem.description && (
              <p className="kol-mono-text-lg text-fg-64">
                {currentItem.description}
              </p>
            )}

            <div className="w-16 h-[1px] bg-fg-24" />

            <LinkWithIcon to={currentItem.route}>
              {currentItem.linkLabel || 'View Collection'}
            </LinkWithIcon>
          </div>

          {/* Right column: Content preview */}
          <div
            className="bg-surface-secondary flex items-center justify-center p-8 rounded-[4px] overflow-hidden"
            style={{ height: contentHeight }}
          >
            {renderContent && renderContent(currentItem)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturedItemsCarousel
