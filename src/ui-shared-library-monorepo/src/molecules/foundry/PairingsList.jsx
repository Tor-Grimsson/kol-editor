import React from 'react'
import { PairingCard } from '../../atoms/foundry/index.js'

/**
 * PairingsList - Vertical list of font style comparisons
 *
 * Foundry molecule that composes multiple PairingCard atoms
 * into a vertical list with consistent spacing
 *
 * @param {Object} props
 * @param {Array} props.pairings - Array of pairing objects with structure:
 *   {
 *     leftTitle: string,
 *     leftTag: string,
 *     leftDescription: string,
 *     leftFontFamily: string (optional),
 *     rightTitle: string,
 *     rightTag: string,
 *     rightDescription: string,
 *     rightFontFamily: string (optional)
 *   }
 * @param {string} props.className - Additional classes
 */
const PairingsList = ({ pairings, className = '' }) => {
  return (
    <div className={`w-full flex flex-col gap-4 ${className}`.trim()}>
      {pairings.map((pairing, index) => (
        <PairingCard
          key={index}
          leftTitle={pairing.leftTitle}
          leftTag={pairing.leftTag}
          leftDescription={pairing.leftDescription}
          leftFontFamily={pairing.leftFontFamily}
          rightTitle={pairing.rightTitle}
          rightTag={pairing.rightTag}
          rightDescription={pairing.rightDescription}
          rightFontFamily={pairing.rightFontFamily}
        />
      ))}
    </div>
  )
}

export default PairingsList
