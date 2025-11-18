import React from 'react'
import Icon from '../icons/Icon'

/**
 * FeatureCard - Title and description card
 *
 * Foundry atom for displaying individual OpenType features
 * Features bordered card with opacity hover effect (50% → 100%)
 *
 * @param {Object} props
 * @param {string} props.title - Feature title
 * @param {string} props.description - Feature description
 * @param {string} props.icon - Optional icon name (e.g., 'foundation')
 * @param {boolean} props.isActive - Whether this card is currently active (last hovered)
 * @param {Function} props.onMouseEnter - Callback fired on mouse enter
 * @param {string} props.className - Additional classes
 */
const FeatureCard = ({ title, description, icon, isActive = false, onMouseEnter, className = '' }) => {
  return (
    <div
      className={`feature-card ${isActive ? 'active' : ''} ${className}`.trim()}
      onMouseEnter={onMouseEnter}
    >
      {icon ? (
        <div className="flex flex-row justify-between items-start">
          <h3 className="kol-helper-uc-md">
            {title}
          </h3>
          <Icon name={icon} size={16} />
        </div>
      ) : (
        <h3 className="kol-helper-uc-md">
          {title}
        </h3>
      )}
      <p className="kol-mono-sm-fine text-fg-64">
        {description}
      </p>
    </div>
  )
}

export default FeatureCard
