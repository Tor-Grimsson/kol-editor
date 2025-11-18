import React from 'react'

/**
 * GlyphItem - Single glyph character display
 *
 * Foundry atom for displaying individual glyph characters
 * Features bordered box with hover theme flip effect
 *
 * @param {Object} props
 * @param {string} props.glyph - Single character to display
 * @param {string} props.fontStyle - Font style: 'normal' or 'italic'
 * @param {string} props.fontFamily - Font family name
 * @param {boolean} props.isSelected - Whether this glyph is selected
 * @param {Function} props.onClick - Callback fired on click
 * @param {Function} props.onMouseEnter - Callback fired on mouse enter
 * @param {string} props.className - Additional classes
 */
const GlyphItem = ({
  glyph,
  fontStyle = 'normal',
  fontFamily = 'TGMalromur',
  isSelected = false,
  onClick,
  onMouseEnter,
  className = ''
}) => {
  const handleClick = () => {
    onClick?.(glyph)
  }

  const handleMouseEnter = () => {
    onMouseEnter?.(glyph)
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={`${isSelected ? 'bg-auto text-auto-inverse' : 'hoverFlipTheme'} aspect-square border rounded-lg flex items-center justify-center text-3xl leading-none transition-colors duration-300 w-16 h-16 cursor-pointer ${className}`.trim()}
      style={{
        fontFamily: fontFamily,
        fontStyle: fontStyle,
        borderColor: 'var(--kol-border-default)'
      }}
    >
      {glyph}
    </div>
  )
}

export default GlyphItem
