import React from 'react'
import { GlyphItem } from '../../atoms/foundry/index.js'

/**
 * GlyphGrid - Grid layout of glyph items
 *
 * Foundry molecule that composes multiple GlyphItem atoms
 * into a flexible wrap grid layout
 *
 * @param {Object} props
 * @param {Array<string>} props.glyphs - Array of glyph characters to display
 * @param {string} props.fontStyle - Font style: 'normal' or 'italic'
 * @param {React.Ref} props.glyphsGridRef - Optional ref for the grid container
 * @param {string} props.className - Additional classes
 */
const GlyphGrid = ({ glyphs, fontStyle = 'normal', fontFamily = 'TGMalromur', glyphsGridRef, className = '' }) => {
  return (
    <div
      ref={glyphsGridRef}
      className={`flex flex-wrap gap-4 w-full ${className}`.trim()}
    >
      {glyphs?.map((glyph, index) => (
        <GlyphItem
          key={index}
          glyph={glyph}
          fontStyle={fontStyle}
          fontFamily={fontFamily}
        />
      ))}
    </div>
  )
}

export default GlyphGrid
