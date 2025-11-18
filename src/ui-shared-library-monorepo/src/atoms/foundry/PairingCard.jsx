import React from 'react'
import Divider from '../Divider'

/**
 * PairingCard - Font pairing display card
 *
 * Foundry atom for displaying font pairing recommendations
 * Shows two font examples side by side with tags and descriptions
 *
 * @param {Object} props
 * @param {string} props.leftTitle - Left font display text
 * @param {string} props.leftTag - Left category tag (e.g., "Stylistic")
 * @param {string} props.leftDescription - Left usage description
 * @param {string} props.leftFontFamily - CSS font-family for left title
 * @param {string} props.rightTitle - Right font display text
 * @param {string} props.rightTag - Right category tag (e.g., "Stylistic Alternates")
 * @param {string} props.rightDescription - Right usage description
 * @param {string} props.rightFontFamily - CSS font-family for right title
 * @param {string} props.className - Additional classes
 */
const PairingCard = ({
  leftTitle,
  leftTag,
  leftDescription,
  leftFontFamily,
  rightTitle,
  rightTag,
  rightDescription,
  rightFontFamily,
  className = ''
}) => {
  return (
    <div
      className={`pairing-card p-4 rounded inline-flex justify-between items-center overflow-hidden ${className}`.trim()}
    >
      {/* Left text section */}
      <div className="inline-flex flex-col justify-start items-start" style={{ width: '128px' }}>
        {/* Title */}
        <div className="pb-2 inline-flex justify-center items-center gap-2">
          <div
            className="foundry-title justify-start"
            style={leftFontFamily ? { fontFamily: leftFontFamily } : undefined}
          >
            {leftTitle}
          </div>
        </div>

        {/* Tag */}
        <div className="self-stretch pb-4 inline-flex justify-center items-center gap-2">
          <div className="flex-1 kol-mono-sm-fine text-fg-64" style={{ fontSize: '12px' }}>
            {leftTag}
          </div>
        </div>

        {/* Description */}
        <div className="self-stretch inline-flex justify-center items-center gap-2">
          <div className="flex-1 justify-start kol-helper-fine-xxxs italic text-fg-32">
            {leftDescription}
          </div>
        </div>
      </div>

      {/* Vertical divider */}
      <Divider variant="vertical" />

      {/* Right text section */}
      <div className="inline-flex flex-col justify-start items-start" style={{ width: '128px' }}>
        {/* Title */}
        <div className="pb-2 inline-flex justify-center items-center gap-2">
          <div
            className="foundry-title justify-start"
            style={rightFontFamily ? { fontFamily: rightFontFamily } : undefined}
          >
            {rightTitle}
          </div>
        </div>

        {/* Tag */}
        <div className="self-stretch pb-4 inline-flex justify-center items-center gap-2">
          <div className="flex-1 kol-mono-sm-fine text-fg-64" style={{ fontSize: '12px' }}>
            {rightTag}
          </div>
        </div>

        {/* Description */}
        <div className="self-stretch inline-flex justify-center items-center gap-2">
          <div className="flex-1 justify-start kol-helper-fine-xxxs italic text-fg-32">
            {rightDescription}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PairingCard
