import LinkWithIcon from '../atoms/LinkWithIcon'

/**
 * LinkCard - Molecule
 *
 * A card component with heading, description, and call-to-action link.
 * Used for navigation sections, quick links, and feature highlights.
 *
 * @param {Object} props
 * @param {string} props.title - Card heading
 * @param {string} props.description - Card description text
 * @param {string} props.to - Link destination (route or URL)
 * @param {string} [props.linkLabel='Learn More'] - Link text
 * @param {string} [props.titleClass='kol-heading-xs'] - Typography class for title
 * @param {string} [props.descriptionClass='kol-mono-xs'] - Typography class for description
 * @param {string} [props.className] - Additional CSS classes for card container
 *
 * @example
 * <LinkCard
 *   title="Illustrations"
 *   description="Browse the complete illustration portfolio featuring visual explorations."
 *   to="/collections/illustrations"
 *   linkLabel="View Gallery"
 * />
 */
const LinkCard = ({
  title,
  description,
  to,
  linkLabel = 'Learn More',
  titleClass = 'kol-heading-xs',
  descriptionClass = 'kol-mono-xs',
  className = ''
}) => {
  return (
    <div className={`bg-container-primary p-8 rounded-sm ${className}`}>
      <div className="space-y-4">
        <h3 className={`${titleClass} text-auto`}>
          {title}
        </h3>
        <p className={`${descriptionClass} text-fg-64`}>
          {description}
        </p>
        <LinkWithIcon to={to}>
          {linkLabel}
        </LinkWithIcon>
      </div>
    </div>
  )
}

export default LinkCard
