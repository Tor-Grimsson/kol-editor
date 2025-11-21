import { Link, useInRouterContext } from 'react-router-dom'
import Icon from "../icons/Icon"

/**
 * LinkWithIcon Component
 *
 * A styled link component with an icon
 *
 * @param {string} to - The route/URL to link to
 * @param {string} children - Link text
 * @param {string} iconName - Icon name (defaults to 'arrow-right')
 * @param {number} iconSize - Icon size in pixels (defaults to 12)
 * @param {string} iconPosition - Icon position: 'left' or 'right' (defaults to 'right')
 * @param {string} className - Additional classes (optional)
 */
const LinkWithIcon = ({
  to,
  children,
  iconName = 'arrow-right',
  iconSize = 12,
  iconPosition = 'right',
  className = ''
}) => {
  const isLeft = iconPosition === 'left'
  // Auto-swap arrow-right to arrow-left when position is left
  const displayIconName = isLeft && iconName === 'arrow-right' ? 'arrow-left' : iconName
  const hasRouter = typeof useInRouterContext === 'function' ? useInRouterContext() : false
  const Component = hasRouter ? Link : 'a'
  const linkProps = hasRouter
    ? { to }
    : { href: to, target: '_blank', rel: 'noreferrer noopener' }

  return (
    <Component
      {...linkProps}
      className={`link-with-icon-animate inline-flex items-center kol-mono-sm text-auto ${className}`}
    >
      {isLeft && (
        <Icon
          name={displayIconName}
          size={iconSize}
          className="icon-slide icon-slide-left"
        />
      )}
      {children}
      {!isLeft && (
        <Icon
          name={iconName}
          size={iconSize}
          className="icon-slide icon-slide-right"
        />
      )}
    </Component>
  )
}

export default LinkWithIcon
