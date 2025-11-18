import Icon from './icons/Icon'

/**
 * IconRollBase - Stack container with two identical icons
 *
 * Outer div: absolute positioned with overflow hidden
 * Inner Stack: flex container that switches between flex-end and flex-start
 *
 * @param {Object} props
 * @param {string} props.iconName - Name of the icon (default: 'arrow-down')
 * @param {number} props.size - Size of the icon in pixels (default: 24)
 * @param {boolean} props.isHovered - Controls which icon is visible
 */
export default function IconRollBase({
  iconName = 'arrow-up',
  size = 24,
  isHovered = false
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Stack - the flex container that animates */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isHovered ? 'flex-start' : 'flex-end',
          alignItems: 'center',
          width: '100%',
          height: `${size * 2}px`, // Double height to fit both icons
          transition: 'justify-content 0.3s ease',
          backgroundColor: isHovered ? 'rgba(0,255,0,0.3)' : 'rgba(0,0,255,0.3)' // Debug: green when hovered, blue when not
        }}
      >
        {/* Top icon - visible when isHovered = true */}
        <Icon name={iconName} size={size} />

        {/* Bottom icon - visible when isHovered = false */}
        <Icon name={iconName} size={size} />
      </div>
    </div>
  )
}
