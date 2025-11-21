import IconRollRotate from './IconRollRotate'

/**
 * NiftySwifty - Icon roll animation component
 *
 * Combines IconRollRotate (45° rotation) with IconRollBase (vertical roll effect).
 * Uses arrow-down icon which appears as arrow-downright due to rotation.
 *
 * @param {Object} props
 * @param {string} props.iconName - Name of the icon to display (default: 'arrow-down')
 * @param {number} props.size - Size of the icon in pixels (default: 24)
 * @param {boolean} props.isHovered - External hover state control
 * @param {string} props.className - Additional classes
 */
export default function NiftySwifty({
  iconName = 'arrow-up',
  size = 24,
  isHovered = false,
  className = ''
}) {
  return (
    <div className={`nifty-swifty-container ${className}`.trim()}>
      <IconRollRotate
        iconName={iconName}
        size={size}
        isHovered={isHovered}
      />
    </div>
  )
}
