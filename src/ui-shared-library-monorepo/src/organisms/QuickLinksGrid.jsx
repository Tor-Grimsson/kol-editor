import LinkCard from '../molecules/LinkCard'

/**
 * QuickLinksGrid - Organism
 *
 * A responsive grid of LinkCard components for navigation sections.
 * Displays a collection of links with headings, descriptions, and CTAs.
 *
 * @param {Object} props
 * @param {Array} props.cards - Array of card data objects
 * @param {string} [props.columns='md:grid-cols-3'] - Grid column configuration (Tailwind classes)
 * @param {string} [props.gap='gap-6'] - Gap between cards (Tailwind class)
 * @param {string} [props.className] - Additional CSS classes for container
 *
 * @example
 * <QuickLinksGrid
 *   cards={[
 *     {
 *       title: "Illustrations",
 *       description: "Browse the complete illustration portfolio...",
 *       to: "/collections/illustrations",
 *       linkLabel: "View Gallery"
 *     },
 *     {
 *       title: "Logomarks",
 *       description: "Explore a curated selection of logomark designs...",
 *       to: "/collections/logomarks",
 *       linkLabel: "View Marks"
 *     }
 *   ]}
 *   columns="md:grid-cols-2 lg:grid-cols-3"
 * />
 *
 * Card data structure:
 * {
 *   title: string,              // Required: Card heading
 *   description: string,         // Required: Card description
 *   to: string,                  // Required: Link destination
 *   linkLabel: string,           // Optional: Link text (default: "Learn More")
 *   titleClass: string,          // Optional: Typography class for title
 *   descriptionClass: string,    // Optional: Typography class for description
 *   className: string            // Optional: Additional classes for individual card
 * }
 */
const QuickLinksGrid = ({
  cards = [],
  columns = 'md:grid-cols-3',
  gap = 'gap-6',
  className = ''
}) => {
  if (cards.length === 0) {
    return null
  }

  return (
    <div className={`grid grid-cols-1 ${columns} ${gap} ${className}`}>
      {cards.map((card, index) => (
        <LinkCard
          key={card.to || index}
          title={card.title}
          description={card.description}
          to={card.to}
          linkLabel={card.linkLabel}
          titleClass={card.titleClass}
          descriptionClass={card.descriptionClass}
          className={card.className}
        />
      ))}
    </div>
  )
}

export default QuickLinksGrid
