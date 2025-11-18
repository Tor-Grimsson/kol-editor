import { useState } from 'react'

/**
 * ControlPanel Component
 *
 * A control panel molecule for audio/visual parameter controls with sliders,
 * toggle buttons, and action buttons. Uses grid layout for perfect slider alignment.
 *
 * @param {Object} props
 * @param {Array} props.controls - Array of control configurations
 * @param {Function} props.onControlChange - Callback when control values change
 * @param {string} props.className - Optional wrapper classes
 * @param {Object} props.style - Optional wrapper styles
 *
 * Control Types:
 * - slider: Range input with optional mode toggle [A]/[B]
 * - toggle-button: Text with clickable toggle state [OFF]/[ON]
 * - button: Simple text button
 *
 * Example:
 * <ControlPanel
 *   controls={[
 *     {
 *       id: 'intensity',
 *       type: 'slider',
 *       label: 'Intensity',
 *       hasToggle: true,
 *       toggleStates: ['A', 'B'],
 *       min: 0,
 *       max: 400,
 *       defaultValue: 200
 *     },
 *     {
 *       id: 'quantize',
 *       type: 'toggle-button',
 *       label: 'Quantize',
 *       toggleStates: ['OFF', 'ON']
 *     },
 *     {
 *       id: 'snapshot',
 *       type: 'button',
 *       label: 'Snapshot'
 *     }
 *   ]}
 *   onControlChange={(id, value, toggleState) => console.log(id, value, toggleState)}
 * />
 */
const ControlPanel = ({
  controls = [],
  onControlChange,
  className = '',
  style = {}
}) => {
  // State management for toggles
  const [toggleStates, setToggleStates] = useState(() => {
    const initialStates = {}
    controls.forEach(control => {
      if (control.hasToggle || control.type === 'toggle-button') {
        initialStates[control.id] = control.toggleStates?.[0] || 'A'
      }
    })
    return initialStates
  })

  // State management for slider values
  const [sliderValues, setSliderValues] = useState(() => {
    const initialValues = {}
    controls.forEach(control => {
      if (control.type === 'slider') {
        initialValues[control.id] = control.defaultValue || 0
      }
    })
    return initialValues
  })

  const handleToggle = (controlId) => {
    const control = controls.find(c => c.id === controlId)
    if (!control?.toggleStates) return

    const currentState = toggleStates[controlId]
    const currentIndex = control.toggleStates.indexOf(currentState)
    const nextIndex = (currentIndex + 1) % control.toggleStates.length
    const nextState = control.toggleStates[nextIndex]

    setToggleStates(prev => ({
      ...prev,
      [controlId]: nextState
    }))

    if (onControlChange) {
      onControlChange(controlId, sliderValues[controlId], nextState)
    }
  }

  const handleSliderChange = (controlId, value) => {
    setSliderValues(prev => ({
      ...prev,
      [controlId]: value
    }))

    if (onControlChange) {
      onControlChange(controlId, value, toggleStates[controlId])
    }
  }

  const handleButtonClick = (controlId) => {
    if (onControlChange) {
      onControlChange(controlId, null, null)
    }
  }

  const renderControl = (control) => {
    switch (control.type) {
      case 'slider':
        return (
          <div
            key={control.id}
            className="control-slider-minimal shadow-none w-full"
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              gap: '12px',
              alignItems: 'center'
            }}
          >
            <label className="kol-mono-xs whitespace-nowrap">
              {control.label}
              {control.hasToggle && (
                <>
                  {' '}
                  <span
                    className="cursor-pointer"
                    onClick={() => handleToggle(control.id)}
                  >
                    [{toggleStates[control.id]}]
                  </span>
                </>
              )}
            </label>
            <input
              type="range"
              min={control.min || 0}
              max={control.max || 100}
              value={sliderValues[control.id]}
              onChange={(e) => handleSliderChange(control.id, parseInt(e.target.value))}
              className="slider-black"
              style={{ width: '100%' }}
            />
            <span className="kol-mono-xs text-right">
              {sliderValues[control.id]}
            </span>
          </div>
        )

      case 'toggle-button':
        return (
          <div
            key={control.id}
            className="kol-mono-xs control-slider-minimal gap-3 shadow-none"
          >
            {control.label}
            {' '}
            <span
              className="cursor-pointer"
              onClick={() => handleToggle(control.id)}
            >
              [{toggleStates[control.id]}]
            </span>
          </div>
        )

      case 'button':
        return (
          <div
            key={control.id}
            className="kol-mono-xs control-slider-minimal gap-3 shadow-none cursor-pointer"
            onClick={() => handleButtonClick(control.id)}
          >
            {control.label}
          </div>
        )

      default:
        return null
    }
  }

  // Separate sliders from bottom buttons
  const sliders = controls.filter(c => c.type === 'slider')
  const bottomControls = controls.filter(c => c.type === 'toggle-button' || c.type === 'button')

  return (
    <div className={`flex flex-col gap-2 w-full max-w-[400px] ${className}`} style={style}>
      <div className="flex flex-col gap-2 w-full">
        {/* Slider controls */}
        {sliders.map(renderControl)}

        {/* Bottom row controls (Quantize, Snapshot, etc.) */}
        {bottomControls.length > 0 && (
          <div className="flex flex-row justify-between gap-3">
            {bottomControls.map(renderControl)}
          </div>
        )}
      </div>
    </div>
  )
}

export default ControlPanel
