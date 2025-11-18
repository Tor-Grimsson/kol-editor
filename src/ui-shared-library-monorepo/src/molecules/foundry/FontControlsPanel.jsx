import React from 'react'
import { Dropdown, Slider } from '../../atoms/index.js'

/**
 * FontControlsPanel - Grouped font controls
 *
 * Foundry molecule that composes Dropdown and Slider atoms
 * into a unified control panel for font customization
 *
 * Features:
 * - Style variant dropdown (Roman/Italic)
 * - Weight dropdown (Thin through Black)
 * - Size slider with dynamic bounds
 * - Leading (line-height) slider
 * - Spacing (letter-spacing) slider
 *
 * @param {Object} props
 * @param {Array<{label: string, value: string}>} props.styleOptions - Style dropdown options
 * @param {Array<{label: string, value: string}>} props.weightOptions - Weight dropdown options
 * @param {string} props.selectedStyle - Currently selected style
 * @param {string} props.selectedWeight - Currently selected weight
 * @param {Function} props.onStyleChange - Callback for style changes
 * @param {Function} props.onWeightChange - Callback for weight changes
 * @param {number} props.size - Current font size
 * @param {Function} props.onSizeChange - Callback for size changes
 * @param {number} props.sizeMin - Minimum size value
 * @param {number} props.sizeMax - Maximum size value
 * @param {number} props.leading - Current line-height adjustment
 * @param {Function} props.onLeadingChange - Callback for leading changes
 * @param {number} props.spacing - Current letter-spacing
 * @param {Function} props.onSpacingChange - Callback for spacing changes
 * @param {boolean} props.compactOnDesktop - Hide certain controls on desktop
 * @param {string} props.fontLabel - Optional label for font badge (default: 'Málrómur')
 * @param {React.ReactNode} props.additionalControls - Optional additional controls to render
 * @param {string} props.className - Additional classes
 */
const FontControlsPanel = ({
  weightOptions,
  selectedWeight,
  onWeightChange,
  size,
  onSizeChange,
  sizeMin = 12,
  sizeMax = 300,
  leading,
  onLeadingChange,
  spacing,
  onSpacingChange,
  variant = 'default',
  className = ''
}) => {
  // Determine layout classes based on variant
  const isDesktop = variant === 'desktop'
  const isDesktopSmall = variant === 'desktop-small'

  const wrapperClasses = [
    'fpsMainWrapper',
    'pb-12',
    isDesktop && 'lg:pb-16',
    isDesktop && 'fpsDesktopLayout',
    isDesktopSmall && 'fpsDesktopSmall'
  ].filter(Boolean).join(' ')

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`.trim()}>
      {/* Container for buttons, tags, and sliders */}
      <div className={wrapperClasses}>
        {/* Weight Dropdown */}
        <div className="fpsButtonsWrapper">
          <Dropdown
            options={weightOptions}
            value={selectedWeight}
            onChange={onWeightChange}
            className="min-w-[140px]"
          />
        </div>

        {/* Sliders */}
        <div className="fpsSlidersWrapper pt-4 flex flex-row gap-4">
          <Slider
            label="Size"
            min={sizeMin}
            max={sizeMax}
            value={size}
            onChange={onSizeChange}
            displayWidth={12}
            className="w-full"
            variant="minimal"
          />
          <Slider
            label="Leading"
            min={0}
            max={50}
            value={leading}
            onChange={onLeadingChange}
            className="w-full"
            variant="minimal"
          />
          <Slider
            label="Spacing"
            min={-20}
            max={20}
            value={spacing}
            onChange={onSpacingChange}
            className="w-full"
            variant="minimal"
          />
        </div>
      </div>
    </div>
  )
}

export default FontControlsPanel
