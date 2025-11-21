import IconRollBase from './IconRollBase'

/**
 * IconRollRotate - Wrapper that rotates IconRollBase by 45 degrees
 *
 * This is the parent container that makes arrow-down appear as arrow-downright.
 * It only has one state - always rotated 45°.
 *
 * @param {Object} props
 * @param {string} props.iconName - Name of the icon (default: 'arrow-down')
 * @param {number} props.size - Size of the icon in pixels (default: 24)
 * @param {boolean} props.isHovered - Passed to IconRollBase
 */
export default function IconRollRotate({
  iconName = 'arrow-up',
  size = 24,
  isHovered = false
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        transform: 'rotate(135deg)', // 135deg to make arrow-up point down-right
        pointerEvents: 'none'
      }}
    >
      <IconRollBase
        iconName={iconName}
        size={size}
        isHovered={isHovered}
      />
    </div>
  )
}
