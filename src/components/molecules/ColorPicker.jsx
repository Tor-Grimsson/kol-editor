import { useState, useRef } from 'react'
import { CustomPicker } from 'react-color'
import { Saturation, Hue } from 'react-color/lib/components/common'
import RangeSlider from './RangeSlider'
import Icon from '../icons/Icon'
import { hexToHsb, hsbToHex, rgbaToHex } from '../../utils/colors'

// Design system color constants
const DEFAULT_BLACK = getComputedStyle(document.documentElement).getPropertyValue('--kol-color-absolute-black').trim() || '#000000'
const DEFAULT_WHITE = getComputedStyle(document.documentElement).getPropertyValue('--kol-color-absolute-white').trim() || '#ffffff'

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

// Mini color swatch with picker for gradient stops
const MiniColorPicker = ({ color, opacity, label, onChange }) => {
  const [pickerOpen, setPickerOpen] = useState(false)
  const hexColor = color?.startsWith('#') ? color : (color ? rgbaToHex(color) : DEFAULT_BLACK)

  const handlePickerChange = (newColor) => {
    onChange({ color: newColor.hex, opacity })
  }

  const handleOpacityChange = (e) => {
    onChange({ color: hexColor, opacity: Number(e.target.value) / 100 })
  }

  return (
    <div className="flex-1">
      <label className="text-fg-48 uppercase text-[10px]">{label}</label>
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded border border-fg-08 cursor-pointer hover:border-fg-08"
          style={{ background: hexColor }}
          onClick={() => setPickerOpen(!pickerOpen)}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round((opacity ?? 1) * 100)}
          onChange={handleOpacityChange}
          className="flex-1 h-1 bg-fg-24 rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
        />
      </div>
      {pickerOpen && (
        <div className="relative">
          <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} />
          <div className="absolute z-20 mt-2">
            <WrappedSketchPicker color={hexColor} onChange={handlePickerChange} />
          </div>
        </div>
      )}
    </div>
  )
}

const ColorPicker = ({
  color,
  opacity = 1,
  onChange,
  // Fill type props
  fillType = 'solid',
  onFillTypeChange,
  // Gradient props
  gradientStartColor,
  gradientStartOpacity,
  gradientEndColor,
  gradientEndOpacity,
  onGradientChange,
  // Image fill props
  fillImageUrl,
  onImageUpload,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const fileInputRef = useRef(null)

  // Ensure color is a hex string
  const hexColor = color?.startsWith('#') ? color : (color ? rgbaToHex(color) : DEFAULT_BLACK)
  const hsb = hexToHsb(hexColor)

  const handleHsbChange = (channel, value) => {
    const newHsb = { ...hsb, [channel]: Number(value) }
    const newHex = hsbToHex(newHsb.h, newHsb.s, newHsb.b)
    onChange({ color: newHex, opacity })
  }

  const handleAlphaChange = (value) => {
    const newOpacity = Number(value) / 100
    onChange({ color: hexColor, opacity: newOpacity })
  }

  const handleHexChange = (e) => {
    const value = `#${e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)}`
    onChange({ color: value, opacity })
  }

  const handleSwatchClick = () => {
    setPickerOpen(!pickerOpen)
  }

  const handlePickerClose = () => {
    setPickerOpen(false)
  }

  const handlePickerChange = (newColor) => {
    onChange({ color: newColor.hex, opacity })
  }

  const handleFillTypeSelect = (type) => {
    setDropdownOpen(false)
    onFillTypeChange?.(type)
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (file && onImageUpload) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target.result
        const img = new window.Image()
        img.src = imageUrl
        img.onload = () => {
          onImageUpload({ imageUrl, imageElement: img })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const fillTypeLabels = {
    solid: 'Solid',
    gradient: 'Gradient',
    image: 'Image',
  }

  // Generate gradient preview for swatch
  const getGradientPreview = () => {
    const start = gradientStartColor || hexColor
    const end = gradientEndColor || DEFAULT_WHITE
    return `linear-gradient(90deg, ${start}, ${end})`
  }

  return (
    <div className="space-y-3">
      {/* Header with fill type dropdown */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            className="flex items-center gap-1 uppercase tracking-wide text-fg-64 hover:text-fg-80"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span>Fill</span>
            <Icon name="caret-down-ui-dropdown" folder="app-icons" size={12} />
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute left-0 top-full mt-1 z-20 bg-container-primary border border-fg-08 rounded py-1 min-w-[100px]">
                {['solid', 'gradient', 'image'].map((type) => (
                  <button
                    key={type}
                    className={`w-full px-3 py-1.5 text-left text-sm hover:bg-fg-24 ${fillType === type ? 'text-auto' : 'text-fg-64'}`}
                    onClick={() => handleFillTypeSelect(type)}
                  >
                    {fillTypeLabels[type]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <span className="text-fg-48 text-xs">{fillTypeLabels[fillType]}</span>
      </div>

      {/* Solid Color UI */}
      {fillType === 'solid' && (
        <>
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded border border-fg-08 cursor-pointer hover:border-fg-08"
              style={{ background: hexColor }}
              onClick={handleSwatchClick}
            />
            <div className="flex-1">
              <label className="text-fg-48 uppercase text-[10px]">HEX</label>
              <div className="flex items-center gap-2 bg-container-primary border border-fg-08 rounded px-2 py-1 font-mono text-sm">
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
              <div className="fixed inset-0 z-10" onClick={handlePickerClose} />
              <div className="absolute z-20 mt-2">
                <WrappedSketchPicker color={hexColor} onChange={handlePickerChange} />
              </div>
            </div>
          )}

          <RangeSlider label="H" value={hsb.h} onChange={(e) => handleHsbChange('h', e.target.value)} min={0} max={360} />
          <RangeSlider label="S" value={hsb.s} onChange={(e) => handleHsbChange('s', e.target.value)} min={0} max={100} />
          <RangeSlider label="B" value={hsb.b} onChange={(e) => handleHsbChange('b', e.target.value)} min={0} max={100} />
          <RangeSlider label="A" value={Math.round(opacity * 100)} onChange={(e) => handleAlphaChange(e.target.value)} min={0} max={100} />
        </>
      )}

      {/* Gradient UI */}
      {fillType === 'gradient' && (
        <>
          {/* Gradient preview */}
          <div
            className="w-full h-10 rounded border border-fg-08"
            style={{ background: getGradientPreview() }}
          />

          {/* Color stops */}
          <div className="flex gap-3">
            <MiniColorPicker
              label="Start"
              color={gradientStartColor || hexColor}
              opacity={gradientStartOpacity ?? 1}
              onChange={({ color, opacity }) => onGradientChange?.({ startColor: color, startOpacity: opacity })}
            />
            <MiniColorPicker
              label="End"
              color={gradientEndColor || DEFAULT_WHITE}
              opacity={gradientEndOpacity ?? 1}
              onChange={({ color, opacity }) => onGradientChange?.({ endColor: color, endOpacity: opacity })}
            />
          </div>

          <p className="text-fg-48 text-xs">Drag handles on canvas to adjust direction</p>
        </>
      )}

      {/* Image Fill UI */}
      {fillType === 'image' && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <div
            className="w-full h-20 rounded border border-fg-08 cursor-pointer hover:border-fg-08 flex items-center justify-center overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            {fillImageUrl ? (
              <img src={fillImageUrl} alt="Fill" className="w-full h-full object-cover" />
            ) : (
              <span className="text-fg-48 text-sm">Click to upload image</span>
            )}
          </div>
          {fillImageUrl && (
            <button
              className="w-full py-1.5 text-sm text-fg-64 hover:text-fg-80 border border-fg-08 rounded hover:border-fg-08"
              onClick={() => fileInputRef.current?.click()}
            >
              Change Image
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default ColorPicker
