import React from 'react'

/**
 * StyleCard - Individual font weight display card
 *
 * Foundry atom for displaying a single font weight/style
 * Shows weight name and numeric weight value with hover effect
 *
 * @param {Object} props
 * @param {string} props.label - Weight label (e.g., "Bold", "Regular Italic")
 * @param {number} props.weight - Numeric weight value (100-900)
 * @param {boolean} props.italic - Whether to apply italic style
 * @param {boolean} props.isActive - Whether this card is currently selected
 * @param {Function} props.onMouseEnter - Callback fired on mouse enter
 * @param {string} props.className - Additional classes
 */
const StyleCard = ({ label, weight, width, italic = false, isActive = false, onMouseEnter, onClick, className = '', fontFamily = 'TGMalromur' }) => {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={`style-card ${isActive ? 'active' : ''} ${className}`.trim()}
    >
      <div className="style-card-left">
        <div
          className="style-card-text"
          style={{
            fontFamily,
            fontStyle: italic ? 'italic' : 'normal',
            fontWeight: weight || 400,
            fontVariationSettings: width ? `'wdth' ${width}` : undefined
          }}
        >
          {label}
        </div>
      </div>
      <div className="style-card-right">
        <div
          className="style-card-text"
          style={{
            fontFamily
          }}
        >
          {width || weight}
        </div>
      </div>
    </div>
  )
}

export default StyleCard
