import { useState } from 'react'
import Input from '../atoms/Input'
import RangeSlider from './RangeSlider'
import { hexToHsb, hsbToHex } from '../../utils/colors'

const ColorPicker = ({ color, onChange }) => {
  const [pickerOpen, setPickerOpen] = useState(false)
  const hsb = hexToHsb(color)

  const handleHsbChange = (channel, value) => {
    const newHsb = { ...hsb, [channel]: Number(value) }
    onChange(hsbToHex(newHsb.h, newHsb.s, newHsb.b))
  }

  const handleHexChange = (e) => {
    const value = `#${e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)}`
    onChange(value)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="uppercase tracking-wide text-zinc-400">Fill</span>
        <button
          className="text-zinc-500 hover:text-white"
          onClick={() => setPickerOpen(!pickerOpen)}
        >
          Spectrum
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="w-14 h-14 rounded border border-zinc-700"
          style={{ background: color }}
        />
        <div className="flex-1">
          <label className="text-zinc-500 uppercase text-[10px]">HEX</label>
          <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 font-mono text-sm">
            <span>#</span>
            <input
              type="text"
              value={color.replace('#', '')}
              onChange={handleHexChange}
              className="flex-1 bg-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <RangeSlider label="H" value={hsb.h} onChange={(e) => handleHsbChange('h', e.target.value)} min={0} max={360} />
      <RangeSlider label="S" value={hsb.s} onChange={(e) => handleHsbChange('s', e.target.value)} min={0} max={100} />
      <RangeSlider label="B" value={hsb.b} onChange={(e) => handleHsbChange('b', e.target.value)} min={0} max={100} />

      {pickerOpen && (
        <div className="relative" data-colorpanel="true">
          <div className="absolute z-20 mt-2 bg-zinc-900 border border-zinc-700 rounded p-3" data-colorpanel="true">
            <Input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-32 h-32 border border-zinc-700 rounded"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ColorPicker
