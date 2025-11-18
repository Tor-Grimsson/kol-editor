import GlyphGrid from './GlyphGrid.jsx'

/**
 * GlyphCategory - Displays a labeled category of glyphs
 *
 * Foundry molecule that combines a category title with a GlyphGrid.
 * Used to organize character sets into labeled sections.
 *
 * @param {Object} props
 * @param {string} props.title - Category title (e.g., "Uppercase", "Punctuation & Symbols")
 * @param {Array<string>} props.glyphs - Array of characters to display
 * @param {string} props.fontStyle - Font style: 'normal' or 'italic'
 * @param {string} props.className - Additional classes
 */
const GlyphCategory = ({
  title,
  glyphs,
  fontStyle = 'normal',
  fontFamily = 'TGMalromur',
  className = ''
}) => {
  return (
    <div className={`w-full flex flex-col gap-4 ${className}`.trim()}>
      <h3 className="kol-helper-uc-s" style={{ letterSpacing: '0.2em' }}>{title}</h3>
      <GlyphGrid glyphs={glyphs} fontStyle={fontStyle} fontFamily={fontFamily} />
    </div>
  )
}

export default GlyphCategory
