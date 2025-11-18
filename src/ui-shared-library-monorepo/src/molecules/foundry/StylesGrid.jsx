import React from 'react'
import { StyleCard } from '../../atoms/foundry/index.js'

/**
 * StylesGrid - Grid of font weight examples
 *
 * Foundry molecule that composes multiple StyleCard atoms
 * into a responsive grid layout with hover handlers
 *
 * @param {Object} props
 * @param {Array<{label: string, weight: number}>} props.styles - Array of style objects
 * @param {Object} props.currentStyle - Currently selected style object
 * @param {boolean} props.isItalic - Whether to display all styles as italic
 * @param {Function} props.onStyleHover - Callback fired when hovering over a style
 * @param {Function} props.onStyleClick - Callback fired when clicking a style
 * @param {string} props.className - Additional classes
 */
const StylesGrid = ({ styles, currentStyle, isItalic = false, onStyleHover, onStyleClick, className = '', fontFamily = 'TGMalromur' }) => {
  return (
    <div className={`flex flex-col gap-3 ${className}`.trim()}>
      {styles.map((style, index) => (
        <StyleCard
          key={`${style.label}-${index}`}
          label={style.label}
          weight={style.weight}
          width={style.width}
          italic={isItalic}
          isActive={
            currentStyle?.label === style.label &&
            (style.weight ? currentStyle?.weight === style.weight : currentStyle?.width === style.width)
          }
          onMouseEnter={() => onStyleHover?.(style)}
          onClick={() => onStyleClick?.(style)}
          fontFamily={fontFamily}
        />
      ))}
    </div>
  )
}

export default StylesGrid
