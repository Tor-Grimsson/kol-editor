import Pill from '../atoms/Pill'

/**
 * OverviewHero - Hero section for overview/landing pages
 *
 * Reusable hero component for collection/category overview pages
 * Shows badge, title, description, and optional category pills
 *
 * @param {Object} props
 * @param {string} props.badge - Badge text (e.g., "Collections", "Specimens", "Typefaces")
 * @param {string} props.badgeVariant - Pill variant for badge (default: "inverse")
 * @param {string} props.title - Main heading
 * @param {string} props.description - Body text description
 * @param {Array} props.categories - Array of category strings to display as pills
 * @param {string} props.className - Additional classes
 */
const OverviewHero = ({
  badge,
  badgeVariant = 'inverse',
  title,
  description,
  categories = [],
  className = ''
}) => {
  return (
    <section className={`w-full px-8 pt-24 pb-24 lg:pt-36 lg:pb-36 mt-24 ${className}`.trim()}>
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center text-center space-y-6">
          {badge && (
            <Pill variant={badgeVariant}>{badge}</Pill>
          )}

          <h1 className="kol-display-lg text-auto">
            {title}
          </h1>

          <div className="w-32 h-[1px] bg-fg-24" />

          {description && (
            <p className="kol-mono-text text-fg-64 max-w-[700px]">
              {description}
            </p>
          )}

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-4">
              {categories.map((category, index) => (
                <Pill key={index} variant="subtle">{category}</Pill>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default OverviewHero
