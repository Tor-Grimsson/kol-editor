import { useState } from 'react'
import { CustomPicker } from 'react-color'
import { Saturation, Hue } from 'react-color/lib/components/common'
import RangeSlider from './RangeSlider'
import { hexToHsb, hsbToHex, rgbaToHex } from '../../utils/colors'

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

const ColorPicker = ({ color, onChange }) => {
  const [pickerOpen, setPickerOpen] = useState(false)
  // Convert rgba to hex if needed
  const hexColor = rgbaToHex(color)
  const hsb = hexToHsb(hexColor)

  const handleHsbChange = (channel, value) => {
    const newHsb = { ...hsb, [channel]: Number(value) }
    onChange(hsbToHex(newHsb.h, newHsb.s, newHsb.b))
  }

  const handleHexChange = (e) => {
    const value = `#${e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)}`
    onChange(value)
  }

  const handleSwatchClick = () => {
    setPickerOpen(!pickerOpen)
  }

  const handlePickerClose = () => {
    setPickerOpen(false)
  }

  const handlePickerChange = (newColor) => {
    onChange(newColor.hex)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="uppercase tracking-wide text-zinc-400">Fill</span>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="w-14 h-14 rounded border border-zinc-700 cursor-pointer hover:border-zinc-600 transition-colors"
          style={{ background: hexColor }}
          onClick={handleSwatchClick}
        />
        <div className="flex-1">
          <label className="text-zinc-500 uppercase text-[10px]">HEX</label>
          <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 font-mono text-sm">
            <span>#</span>
            <input
              type="text"
              value={hexColor.replace('#', '')}
              onChange={handleHexChange}
              className="flex-1 bg-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {pickerOpen && (
        <div className="relative">
          <div
            className="fixed inset-0 z-10"
            onClick={handlePickerClose}
          />
          <div className="absolute z-20 mt-2">
            <WrappedSketchPicker
              color={hexColor}
              onChange={handlePickerChange}
            />
          </div>
        </div>
      )}

      <RangeSlider label="H" value={hsb.h} onChange={(e) => handleHsbChange('h', e.target.value)} min={0} max={360} />
      <RangeSlider label="S" value={hsb.s} onChange={(e) => handleHsbChange('s', e.target.value)} min={0} max={100} />
      <RangeSlider label="B" value={hsb.b} onChange={(e) => handleHsbChange('b', e.target.value)} min={0} max={100} />
    </div>
  )
}

export default ColorPicker
