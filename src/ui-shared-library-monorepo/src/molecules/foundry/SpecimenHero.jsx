import LinkWithIcon from '../../atoms/LinkWithIcon'

/**
 * SpecimenHero - Hero section for specimen hub pages
 *
 * Foundry molecule for specimen collection landing pages
 * Shows back link, title, subtitle, and description
 *
 * @param {Object} props
 * @param {string} props.title - Main heading (e.g., "Málrómur Specimens", "Prose Styles")
 * @param {string} props.subtitle - Italic subtitle below title
 * @param {string} props.description - Body text description
 * @param {string} props.fontFamily - CSS font-family for title (e.g., "TGMalromur")
 * @param {string} props.fontStyle - CSS font-style for title (e.g., "italic", "normal")
 * @param {number} props.fontWeight - CSS font-weight for title (optional)
 * @param {string} props.backLink - Back link URL (defaults to /foundry/specimens)
 * @param {React.ReactNode} props.children - Optional additional content (e.g., CTAs) below description
 * @param {string} props.className - Additional classes
 */
const SpecimenHero = ({
  title,
  subtitle,
  description,
  fontFamily = 'TGMalromur',
  fontStyle,
  fontWeight,
  backLink = '/foundry/specimens',
  children,
  className = ''
}) => {
  return (
    <section className={`w-full px-8 py-24 lg:py-32 mt-24 flex flex-col items-center justify-center text-center ${className}`.trim()}>
      <div className="max-w-[900px] mx-auto space-y-8">
        <LinkWithIcon
          to={backLink}
          iconName="arrow-right"
          iconPosition="left"
          iconSize={12}
          className="hover:text-fg-64"
        >
          Back to All Specimens
        </LinkWithIcon>

        <h1
          className="text-auto text-7xl font-normal leading-tight"
          style={{
            fontFamily,
            ...(fontStyle && { fontStyle }),
            ...(fontWeight && { fontWeight })
          }}
        >
          {title}
        </h1>

        <div className="w-32 h-[1px] bg-fg-24 mx-auto" />

        <p className="text-auto text-2xl font-normal font-['TGMalromur'] leading-8 italic opacity-70">
          {subtitle}
        </p>

        <p className="text-auto text-lg font-normal font-['TGMalromur'] leading-7 max-w-[700px] mx-auto pt-4">
          {description}
        </p>

        {children}
      </div>
    </section>
  )
}

export default SpecimenHero
