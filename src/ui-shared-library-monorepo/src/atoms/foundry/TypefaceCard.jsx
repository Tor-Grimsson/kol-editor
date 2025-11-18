import Icon from '../icons/Icon'

/**
 * TypefaceCard - Typeface preview card
 *
 * Foundry atom for displaying typeface specimens in the "Other Typefaces" section
 * Shows font name, subtitle, large specimen, and description
 *
 * @param {Object} props
 * @param {string} props.name - Typeface name (e.g., "TRÖLLATUNGA")
 * @param {string} props.subtitle - Subtitle/variant (e.g., "Fall Foliage")
 * @param {string} props.description - Brief description of the typeface
 * @param {string} props.fontFamily - CSS font-family name for the specimen preview
 * @param {string} props.fontStyle - CSS font-style (e.g., "italic", "normal")
 * @param {boolean} props.isActive - Whether this card is currently active (last hovered)
 * @param {Function} props.onMouseEnter - Callback fired on mouse enter
 * @param {string} props.className - Additional classes
 */
const TypefaceCard = ({
  name,
  subtitle,
  description,
  fontFamily,
  fontStyle,
  isActive = false,
  onMouseEnter,
  className = ''
}) => {
  return (
    <div
      className={`typeface-card bg-surface-inverse p-4 rounded flex flex-col gap-6 cursor-pointer h-64 ${isActive ? 'active' : ''} ${className}`.trim()}
      onMouseEnter={onMouseEnter}
    >
      {/* Header: Name + icon */}
      <div className="flex flex-row justify-between items-start">
        <div className="flex flex-col gap-1">
          <h3 className="kol-helper-uc-s">{name}</h3>
          <p className="kol-helper-fine-xxs italic text-fg-64">{subtitle}</p>
        </div>
        <Icon name="foundation" size={16} />
      </div>

      {/* Large specimen */}
      <div className="flex-1 flex items-center justify-center py-4 border border-fg-08 rounded">
        <span
          className="foundry-title"
          style={{
            fontSize: '64px',
            lineHeight: '100%',
            ...(fontFamily && { fontFamily }),
            ...(fontStyle && { fontStyle })
          }}
        >
          Specimen
        </span>
      </div>

      {/* Description */}
      <p className="kol-helper-xxs text-fg-48 line-clamp-1">
        {description}
      </p>
    </div>
  )
}

export default TypefaceCard
