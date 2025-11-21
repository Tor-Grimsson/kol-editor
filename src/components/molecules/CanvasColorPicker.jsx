import { useState } from 'react'
import { CustomPicker } from 'react-color'
import { Saturation, Hue } from 'react-color/lib/components/common'

const CustomSketchPicker = ({ hex, hsl, hsv, onChange }) => {
  return (
    <div
      className="bg-container-secondary rounded-lg p-2.5"
      style={{
        width: '200px',
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
        className="w-full h-16 border border-fg-08 rounded cursor-pointer"
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
