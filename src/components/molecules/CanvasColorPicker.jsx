import { useState } from 'react'
import { CustomPicker } from 'react-color'
import { Saturation, Hue } from 'react-color/lib/components/common'

const CustomSketchPicker = ({ hex, hsl, hsv, onChange }) => {
  return (
    <div
      style={{
        width: '200px',
        padding: '10px',
        background: '#27272a',
        borderRadius: '8px',
        boxShadow: '0 0 0 1px rgba(63, 63, 68, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.15)',
      }}
    >
      <div
        style={{
          width: '100%',
          paddingBottom: '75%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Saturation
          hsl={hsl}
          hsv={hsv}
          onChange={onChange}
        />
      </div>
      <div style={{ marginTop: '10px', height: '10px', position: 'relative' }}>
        <Hue hsl={hsl} onChange={onChange} />
      </div>
    </div>
  )
}

const WrappedSketchPicker = CustomPicker(CustomSketchPicker)

const CanvasColorPicker = ({ color, onChange }) => {
  const [displayPicker, setDisplayPicker] = useState(false)

  const handleClick = () => {
    setDisplayPicker(!displayPicker)
  }

  const handleClose = () => {
    setDisplayPicker(false)
  }

  const handleChange = (newColor) => {
    onChange(newColor.hex)
  }

  return (
    <div>
      <div
        onClick={handleClick}
        className="w-full h-16 border border-zinc-700 rounded cursor-pointer"
        style={{
          backgroundColor: color,
        }}
      />
      {displayPicker && (
        <div className="absolute z-10 mt-2">
          <div
            className="fixed inset-0"
            onClick={handleClose}
          />
          <WrappedSketchPicker
            color={color}
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  )
}

export default CanvasColorPicker
