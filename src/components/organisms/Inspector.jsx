import { useState, Fragment } from 'react'
import PropertyInput from '../molecules/PropertyInput'
import ColorPicker from '../molecules/ColorPicker'
import RangeSlider from '../molecules/RangeSlider'
import Input from '../atoms/Input'
import Button from '../atoms/Button'
import Icon from '../icons/Icon'
import Divider from '../atoms/Divider'

const Inspector = ({
  selectedLayer,
  selectedObject,
  canvasBackground,
  onLayerNameChange,
  onLayerBackgroundChange,
  onLayerPropertyChange,
  onObjectPropertyChange,
  onObjectColorChange,
  onObjectTextChange,
  onExpandBooleanGroup,
  onUpdateFilterParams,
  onRemoveFilter,
  onToggleFilterEnabled
}) => {
  const [activeTab, setActiveTab] = useState('inspector')

  return (
    <div className="w-80 border-l border-fg-08 bg-surface-primary flex flex-col">
      <div className="border-b border-fg-08 flex">
        <button
          className={`flex-1 px-3 py-2 uppercase tracking-wide kol-mono-xs ${
            activeTab === 'inspector'
              ? 'text-auto bg-container-primary'
              : 'text-fg-48 hover:text-fg-80'
          }`}
          onClick={() => setActiveTab('inspector')}
        >
          Inspector
        </button>
        <button
          className={`flex-1 px-3 py-2 uppercase tracking-wide kol-mono-xs ${
            activeTab === 'filters'
              ? 'text-auto bg-container-primary'
              : 'text-fg-48 hover:text-fg-80'
          }`}
          onClick={() => setActiveTab('filters')}
        >
          Filters
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {activeTab === 'inspector' && (
          <>
        {/* Canvas Name - Only when layer selected and no object selected */}
        {selectedLayer && !selectedObject && (
          <div className="flex flex-col gap-1">
            <span className="text-fg-48">Canvas name</span>
            <Input
              type="text"
              value={selectedLayer.name}
              onChange={(e) => onLayerNameChange(e.target.value)}
              className="bg-container-primary border border-fg-08 rounded px-2 py-1 text-auto"
            />
          </div>
        )}

        {/* Global Canvas Background - Show when nothing is selected */}
        {!selectedLayer && !selectedObject && (
          <ColorPicker
            color={canvasBackground}
            onChange={onLayerBackgroundChange}
          />
        )}

        {/* Position and Size - Show for canvas (when no object selected) or selected object */}
        {(selectedObject || selectedLayer) && (
          <div className="grid grid-cols-2 gap-4">
            {['x', 'y', 'width', 'height', 'rotation'].map((prop) => {
              const target = selectedObject || selectedLayer
              const value = target[prop]
              // Round position/size values to whole pixels
              const displayValue = ['x', 'y', 'width', 'height'].includes(prop)
                ? Math.round(value)
                : value

              return (
                <PropertyInput
                  key={prop}
                  label={prop}
                  type="number"
                  step={prop === 'rotation' ? 1 : 5}
                  value={displayValue}
                  onChange={(e) => {
                    if (selectedObject) {
                      onObjectPropertyChange(prop, e.target.value)
                    } else if (selectedLayer && onLayerPropertyChange) {
                      onLayerPropertyChange(prop, e.target.value)
                    }
                  }}
                />
              )
            })}
          </div>
        )}

        {/* Text Properties */}
        {selectedObject?.type === 'text' && (
          <div className="space-y-2 border-t border-fg-08 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-fg-48 w-16">Font</span>
              <Input
                type="text"
                value={selectedObject.fontFamily}
                onChange={(e) => onObjectTextChange('fontFamily', e.target.value)}
                className="flex-1 bg-container-primary border border-fg-08 rounded px-2 py-1 text-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-fg-48 w-16">Size</span>
              <Input
                type="number"
                min={8}
                value={selectedObject.fontSize}
                onChange={(e) => onObjectTextChange('fontSize', Number(e.target.value))}
                className="w-20 bg-container-primary border border-fg-08 rounded px-2 py-1 text-auto"
              />
              <Button
                className={`px-3 py-1 rounded border ${
                  selectedObject.fontStyle === 'bold'
                    ? 'bg-surface-on-primary border-surface-on-primary'
                    : 'border-fg-08 bg-container-primary'
                }`}
                onClick={() => onObjectTextChange('fontStyle', selectedObject.fontStyle === 'bold' ? 'normal' : 'bold')}
              >
                B
              </Button>
            </div>
          </div>
        )}

        {/* Color Picker - Show for canvas or selected object */}
        {(selectedObject || (selectedLayer && !selectedObject)) && (
          <div className="border-t border-fg-08 pt-3">
            <ColorPicker
              color={(() => {
                if (selectedObject) return selectedObject.color || '#000000'
                // Handle legacy background property
                if (selectedLayer.fillColor) return selectedLayer.fillColor
                if (selectedLayer.background) {
                  const match = selectedLayer.background.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
                  if (match) {
                    const [, r, g, b] = match
                    return `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`
                  }
                  return selectedLayer.background
                }
                return '#ffffff'
              })()}
              opacity={(() => {
                if (selectedObject) return selectedObject.opacity ?? 1
                if (selectedLayer.fillOpacity !== undefined) return selectedLayer.fillOpacity
                // Parse opacity from legacy background rgba
                if (selectedLayer.background) {
                  const match = selectedLayer.background.match(/rgba?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/)
                  if (match) return parseFloat(match[1])
                }
                return 0.02
              })()}
              onChange={selectedObject ? onObjectColorChange : onLayerBackgroundChange}
              // Fill type props
              fillType={selectedObject?.fillType || 'solid'}
              onFillTypeChange={(type) => onObjectPropertyChange?.('fillType', type)}
              // Gradient props
              gradientStartColor={selectedObject?.gradientStartColor}
              gradientStartOpacity={selectedObject?.gradientStartOpacity}
              gradientEndColor={selectedObject?.gradientEndColor}
              gradientEndOpacity={selectedObject?.gradientEndOpacity}
              onGradientChange={({ startColor, startOpacity, endColor, endOpacity }) => {
                if (startColor !== undefined) onObjectPropertyChange?.('gradientStartColor', startColor)
                if (startOpacity !== undefined) onObjectPropertyChange?.('gradientStartOpacity', startOpacity)
                if (endColor !== undefined) onObjectPropertyChange?.('gradientEndColor', endColor)
                if (endOpacity !== undefined) onObjectPropertyChange?.('gradientEndOpacity', endOpacity)
              }}
              // Image fill props
              fillImageUrl={selectedObject?.fillImageUrl}
              onImageUpload={({ imageUrl, imageElement }) => {
                onObjectPropertyChange?.('fillImageUrl', imageUrl)
                onObjectPropertyChange?.('fillImageElement', imageElement)
              }}
            />
          </div>
        )}


        {/* Blending mode and layer effects */}
        {(selectedObject || (selectedLayer && !selectedObject)) && (
          <>
            <div className="flex flex-col gap-1">
              <span className="text-fg-48">Blending mode</span>
              <select
                value={(selectedObject?.blendMode || selectedLayer?.blendMode) || 'source-over'}
                onChange={(e) => {
                  if (selectedObject) {
                    onObjectPropertyChange('blendMode', e.target.value)
                  } else if (selectedLayer) {
                    onLayerPropertyChange('blendMode', e.target.value)
                  }
                }}
                style={{ background: '#27272a', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
                className="rounded px-2 py-1 text-auto cursor-pointer"
              >
                <option value="source-over">Normal</option>
                <option value="multiply">Multiply</option>
                <option value="screen">Screen</option>
                <option value="overlay">Overlay</option>
                <option value="darken">Darken</option>
                <option value="lighten">Lighten</option>
                <option value="color-dodge">Color Dodge</option>
                <option value="color-burn">Color Burn</option>
                <option value="hard-light">Hard Light</option>
                <option value="soft-light">Soft Light</option>
                <option value="difference">Difference</option>
                <option value="exclusion">Exclusion</option>
                <option value="hue">Hue</option>
                <option value="saturation">Saturation</option>
                <option value="color">Color</option>
                <option value="luminosity">Luminosity</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-fg-48">Layer effects</span>

              {/* Display active effects */}
              {((selectedObject?.effects || selectedLayer?.effects) || []).map((effect, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-fg-64 kol-mono-xs uppercase tracking-wide">
                      {effect.type === 'drop-shadow' && 'Drop Shadow'}
                      {effect.type === 'blur' && 'Layer Blur'}
                      {effect.type === 'background-blur' && 'Background Blur'}
                      {effect.type === 'noise' && 'Noise'}
                    </span>
                    <button
                      onClick={() => {
                        const currentEffects = (selectedObject?.effects || selectedLayer?.effects) || []
                        const newEffects = currentEffects.filter((_, i) => i !== index)
                        if (selectedObject) {
                          onObjectPropertyChange('effects', newEffects)
                        } else if (selectedLayer) {
                          onLayerPropertyChange('effects', newEffects)
                        }
                      }}
                      className="text-fg-32 hover:text-fg-64 kol-text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>

                  {/* Drop Shadow parameters */}
                  {effect.type === 'drop-shadow' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-fg-48 kol-helper-uc-xxs uppercase">Color</label>
                        <input
                          type="color"
                          value={effect.color?.startsWith('#') ? effect.color : '#000000'}
                          onChange={(e) => {
                            const currentEffects = (selectedObject?.effects || selectedLayer?.effects) || []
                            const newEffects = [...currentEffects]
                            newEffects[index] = { ...effect, color: e.target.value }
                            if (selectedObject) {
                              onObjectPropertyChange('effects', newEffects)
                            } else if (selectedLayer) {
                              onLayerPropertyChange('effects', newEffects)
                            }
                          }}
                          className="w-full h-8 bg-transparent border border-fg-08 rounded cursor-pointer"
                        />
                      </div>
                      <RangeSlider
                        label="Opacity"
                        value={Math.round((effect.opacity ?? 1) * 100)}
                        onChange={(e) => {
                          const currentEffects = (selectedObject?.effects || selectedLayer?.effects) || []
                          const newEffects = [...currentEffects]
                          newEffects[index] = { ...effect, opacity: Number(e.target.value) / 100 }
                          if (selectedObject) {
                            onObjectPropertyChange('effects', newEffects)
                          } else if (selectedLayer) {
                            onLayerPropertyChange('effects', newEffects)
                          }
                        }}
                        min={0}
                        max={100}
                      />
                      <div className="space-y-1">
                        <label className="text-fg-48 kol-helper-uc-xxs uppercase">X Offset</label>
                        <Input
                          type="number"
                          value={effect.offsetX}
                          onChange={(e) => {
                            const currentEffects = (selectedObject?.effects || selectedLayer?.effects) || []
                            const newEffects = [...currentEffects]
                            newEffects[index] = { ...effect, offsetX: Number(e.target.value) }
                            if (selectedObject) {
                              onObjectPropertyChange('effects', newEffects)
                            } else if (selectedLayer) {
                              onLayerPropertyChange('effects', newEffects)
                            }
                          }}
                          size="sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-fg-48 kol-helper-uc-xxs uppercase">Y Offset</label>
                        <Input
                          type="number"
                          value={effect.offsetY}
                          onChange={(e) => {
                            const currentEffects = (selectedObject?.effects || selectedLayer?.effects) || []
                            const newEffects = [...currentEffects]
                            newEffects[index] = { ...effect, offsetY: Number(e.target.value) }
                            if (selectedObject) {
                              onObjectPropertyChange('effects', newEffects)
                            } else if (selectedLayer) {
                              onLayerPropertyChange('effects', newEffects)
                            }
                          }}
                          size="sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-fg-48 kol-helper-uc-xxs uppercase">Blur</label>
                        <Input
                          type="number"
                          value={effect.blur}
                          onChange={(e) => {
                            const currentEffects = (selectedObject?.effects || selectedLayer?.effects) || []
                            const newEffects = [...currentEffects]
                            newEffects[index] = { ...effect, blur: Number(e.target.value) }
                            if (selectedObject) {
                              onObjectPropertyChange('effects', newEffects)
                            } else if (selectedLayer) {
                              onLayerPropertyChange('effects', newEffects)
                            }
                          }}
                          size="sm"
                        />
                      </div>
                    </>
                  )}

                  {/* Blur parameters */}
                  {(effect.type === 'blur' || effect.type === 'background-blur') && (
                    <div className="space-y-1">
                      <label className="text-fg-48 kol-helper-uc-xxs uppercase">Radius</label>
                      <Input
                        type="number"
                        value={effect.radius}
                        onChange={(e) => {
                          const currentEffects = (selectedObject?.effects || selectedLayer?.effects) || []
                          const newEffects = [...currentEffects]
                          newEffects[index] = { ...effect, radius: Number(e.target.value) }
                          if (selectedObject) {
                            onObjectPropertyChange('effects', newEffects)
                          } else if (selectedLayer) {
                            onLayerPropertyChange('effects', newEffects)
                          }
                        }}
                        size="sm"
                      />
                    </div>
                  )}

                  {/* Noise parameters */}
                  {effect.type === 'noise' && (
                    <>
                      <RangeSlider
                        label="Amount"
                        value={Math.round(effect.amount * 100)}
                        onChange={(e) => {
                          const currentEffects = (selectedObject?.effects || selectedLayer?.effects) || []
                          const newEffects = [...currentEffects]
                          newEffects[index] = { ...effect, amount: Number(e.target.value) / 100 }
                          if (selectedObject) {
                            onObjectPropertyChange('effects', newEffects)
                          } else if (selectedLayer) {
                            onLayerPropertyChange('effects', newEffects)
                          }
                        }}
                        min={0}
                        max={100}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`noise-mono-${index}`}
                          checked={effect.monochromatic !== false}
                          onChange={(e) => {
                            const currentEffects = (selectedObject?.effects || selectedLayer?.effects) || []
                            const newEffects = [...currentEffects]
                            newEffects[index] = { ...effect, monochromatic: e.target.checked }
                            if (selectedObject) {
                              onObjectPropertyChange('effects', newEffects)
                            } else if (selectedLayer) {
                              onLayerPropertyChange('effects', newEffects)
                            }
                          }}
                          className="w-4 h-4 accent-surface-on-primary"
                        />
                        <label htmlFor={`noise-mono-${index}`} className="text-fg-64 kol-mono-xs">
                          Monochromatic
                        </label>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Add new effect dropdown */}
              <select
                value=""
                onChange={(e) => {
                  if (!e.target.value) return
                  const currentEffects = (selectedObject?.effects || selectedLayer?.effects) || []
                  const newEffect = {
                    type: e.target.value,
                    enabled: true,
                    // Default values based on effect type
                    ...(e.target.value === 'drop-shadow' && {
                      offsetX: 0,
                      offsetY: 4,
                      blur: 8,
                      color: '#000000',
                      opacity: 1
                    }),
                    ...(e.target.value === 'blur' && {
                      radius: 5
                    }),
                    ...(e.target.value === 'background-blur' && {
                      radius: 10
                    }),
                    ...(e.target.value === 'noise' && {
                      amount: 0.5,
                      monochromatic: true
                    })
                  }

                  if (selectedObject) {
                    onObjectPropertyChange('effects', [...currentEffects, newEffect])
                  } else if (selectedLayer) {
                    onLayerPropertyChange('effects', [...currentEffects, newEffect])
                  }
                  e.target.value = ''
                }}
                style={{ background: '#27272a', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
                className="rounded px-2 py-1 text-auto cursor-pointer"
              >
                <option value="">Add effect...</option>
                <option value="drop-shadow">Drop Shadow</option>
                <option value="blur">Layer Blur</option>
                <option value="background-blur">Background Blur</option>
                <option value="noise">Noise</option>
              </select>
            </div>
          </>
        )}

        {/* Boolean Group Controls */}
        {selectedObject?.type === 'boolean' && (
          <div className="border-t border-fg-08 pt-3">
            <Button
              variant="primary"
              onClick={onExpandBooleanGroup}
              className="w-full"
            >
              Expand Vector Shape
            </Button>
          </div>
        )}

          </>
        )}

        {activeTab === 'filters' && (
          <>
            {/* Filter Stack - Show all applied filters */}
            {selectedObject && selectedObject.filters && selectedObject.filters.length > 0 ? (
              <div>
                {selectedObject.filters.map((filter, index) => {
                  const filterLabel = filter.type.replace('filter-', '').replace(/-/g, ' ').toUpperCase()

                  return (
                    <Fragment key={filter.id}>
                      {index > 0 && <Divider />}
                      <div className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onToggleFilterEnabled && onToggleFilterEnabled(selectedObject.id, filter.id)}
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                              filter.enabled
                                ? 'bg-surface-on-primary border-blue-600'
                                : 'bg-transparent border-fg-08'
                            }`}
                          >
                            {filter.enabled && <span className="text-auto kol-helper-uc-xxs">✓</span>}
                          </button>
                          <div className="text-fg-80 kol-mono-xs font-medium flex items-center gap-1.5">
                            <Icon name="filter-palette" folder="active/tools" size={12} />
                            {filterLabel}
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveFilter && onRemoveFilter(selectedObject.id, filter.id)}
                          className="text-fg-32 hover:text-fg-64 kol-mono-text leading-none"
                        >
                          ×
                        </button>
                      </div>

                      {/* Show filter controls based on type */}
                      {filter.enabled && (
                        <>
                          {/* HSL/HSV */}
                          {(filter.type === 'filter-hsl' || filter.type === 'filter-hsv') && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Hue"
                                value={filter.params.hue || 0}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, hue: Number(e.target.value) })
                                }}
                                min={-1}
                                max={1}
                                step={0.01}
                              />
                              <RangeSlider
                                label="Saturation"
                                value={filter.params.saturation || 0}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, saturation: Number(e.target.value) })
                                }}
                                min={-2}
                                max={10}
                                step={0.1}
                              />
                              <RangeSlider
                                label={filter.type === 'filter-hsl' ? 'Luminance' : 'Value'}
                                value={filter.params.value || 0}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, value: Number(e.target.value) })
                                }}
                                min={-2}
                                max={2}
                                step={0.1}
                              />
                            </div>
                          )}

                          {/* Brightness */}
                          {filter.type === 'filter-brightness' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Brightness"
                                value={filter.params.brightness || 0}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, brightness: Number(e.target.value) })
                                }}
                                min={-1}
                                max={1}
                                step={0.01}
                              />
                            </div>
                          )}

                          {/* Contrast */}
                          {filter.type === 'filter-contrast' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Contrast"
                                value={filter.params.contrast || 0}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, contrast: Number(e.target.value) })
                                }}
                                min={-100}
                                max={100}
                              />
                            </div>
                          )}

                          {/* RGB */}
                          {filter.type === 'filter-rgb' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Red"
                                value={filter.params.red || 0}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, red: Number(e.target.value) })
                                }}
                                min={-255}
                                max={255}
                              />
                              <RangeSlider
                                label="Green"
                                value={filter.params.green || 0}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, green: Number(e.target.value) })
                                }}
                                min={-255}
                                max={255}
                              />
                              <RangeSlider
                                label="Blue"
                                value={filter.params.blue || 0}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, blue: Number(e.target.value) })
                                }}
                                min={-255}
                                max={255}
                              />
                            </div>
                          )}

                          {/* Blur */}
                          {filter.type === 'filter-blur' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Radius"
                                value={filter.params.blurRadius || 0}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, blurRadius: Number(e.target.value) })
                                }}
                                min={0}
                                max={40}
                              />
                            </div>
                          )}

                          {/* Pixelate */}
                          {filter.type === 'filter-pixelate' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Pixel Size"
                                value={filter.params.pixelSize || 1}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, pixelSize: Number(e.target.value) })
                                }}
                                min={1}
                                max={20}
                              />
                            </div>
                          )}

                          {/* Posterize */}
                          {filter.type === 'filter-posterize' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Levels"
                                value={filter.params.levels || 0.5}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, levels: Number(e.target.value) })
                                }}
                                min={0.01}
                                max={1}
                                step={0.01}
                              />
                            </div>
                          )}

                          {/* Emboss */}
                          {filter.type === 'filter-emboss' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Strength"
                                value={filter.params.embossStrength || 0.5}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, embossStrength: Number(e.target.value) })
                                }}
                                min={0}
                                max={1}
                                step={0.1}
                              />
                            </div>
                          )}

                          {/* Noise */}
                          {filter.type === 'filter-noise' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Amount"
                                value={filter.params.noise || 0}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, noise: Number(e.target.value) })
                                }}
                                min={0}
                                max={1}
                                step={0.01}
                              />
                            </div>
                          )}

                          {/* Threshold */}
                          {filter.type === 'filter-threshold' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Threshold"
                                value={filter.params.threshold || 0.5}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, threshold: Number(e.target.value) })
                                }}
                                min={0}
                                max={1}
                                step={0.01}
                              />
                            </div>
                          )}

                          {/* Radial Blur */}
                          {filter.type === 'filter-radial-blur' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Angle"
                                value={filter.params.angle || 0}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, angle: Number(e.target.value) })
                                }}
                                min={0}
                                max={20}
                                step={0.1}
                              />
                              <RangeSlider
                                label="Kernel"
                                value={filter.params.kernelSize || 5}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, kernelSize: Number(e.target.value) })
                                }}
                                min={3}
                                max={25}
                              />
                            </div>
                          )}

                          {/* Zoom Blur */}
                          {filter.type === 'filter-zoom-blur' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Strength"
                                value={filter.params.strength || 0.1}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, strength: Number(e.target.value) })
                                }}
                                min={0}
                                max={1}
                                step={0.01}
                              />
                            </div>
                          )}

                          {/* Motion Blur */}
                          {filter.type === 'filter-motion-blur' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Velocity X"
                                value={filter.params.velocityX || 0}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, velocityX: Number(e.target.value) })
                                }}
                                min={-50}
                                max={50}
                              />
                              <RangeSlider
                                label="Velocity Y"
                                value={filter.params.velocityY || 5}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, velocityY: Number(e.target.value) })
                                }}
                                min={-50}
                                max={50}
                              />
                            </div>
                          )}

                          {/* Displacement */}
                          {filter.type === 'filter-displacement' && (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1 pb-2">
                                <button
                                  onClick={() => {
                                    onUpdateFilterParams?.(selectedObject.id, filter.id, {
                                      scaleX: 10, scaleY: 10, frequency: 0.5, octaves: 2, persistence: 0.3
                                    })
                                  }}
                                  className="px-2 py-0.5 kol-helper-uc-xxs bg-container-primary hover:bg-fg-24 border border-fg-08 rounded"
                                >
                                  Subtle
                                </button>
                                <button
                                  onClick={() => {
                                    onUpdateFilterParams?.(selectedObject.id, filter.id, {
                                      scaleX: 30, scaleY: 30, frequency: 1, octaves: 3, persistence: 0.5
                                    })
                                  }}
                                  className="px-2 py-0.5 kol-helper-uc-xxs bg-container-primary hover:bg-fg-24 border border-fg-08 rounded"
                                >
                                  Wavy
                                </button>
                                <button
                                  onClick={() => {
                                    onUpdateFilterParams?.(selectedObject.id, filter.id, {
                                      scaleX: 50, scaleY: 50, frequency: 2, octaves: 5, persistence: 0.7
                                    })
                                  }}
                                  className="px-2 py-0.5 kol-helper-uc-xxs bg-container-primary hover:bg-fg-24 border border-fg-08 rounded"
                                >
                                  Turbulent
                                </button>
                                <button
                                  onClick={() => {
                                    onUpdateFilterParams?.(selectedObject.id, filter.id, {
                                      scaleX: 80, scaleY: 20, frequency: 0.3, octaves: 2, persistence: 0.4
                                    })
                                  }}
                                  className="px-2 py-0.5 kol-helper-uc-xxs bg-container-primary hover:bg-fg-24 border border-fg-08 rounded"
                                >
                                  Horizontal
                                </button>
                                <button
                                  onClick={() => {
                                    onUpdateFilterParams?.(selectedObject.id, filter.id, {
                                      scaleX: 20, scaleY: 80, frequency: 0.3, octaves: 2, persistence: 0.4
                                    })
                                  }}
                                  className="px-2 py-0.5 kol-helper-uc-xxs bg-container-primary hover:bg-fg-24 border border-fg-08 rounded"
                                >
                                  Vertical
                                </button>
                                <button
                                  onClick={() => {
                                    onUpdateFilterParams?.(selectedObject.id, filter.id, {
                                      scaleX: 100, scaleY: 100, frequency: 3, octaves: 6, persistence: 0.8
                                    })
                                  }}
                                  className="px-2 py-0.5 kol-helper-uc-xxs bg-container-primary hover:bg-fg-24 border border-fg-08 rounded"
                                >
                                  Extreme
                                </button>
                                <button
                                  onClick={() => {
                                    onUpdateFilterParams?.(selectedObject.id, filter.id, {
                                      scaleX: 15, scaleY: 15, frequency: 5, octaves: 4, persistence: 0.6
                                    })
                                  }}
                                  className="px-2 py-0.5 kol-helper-uc-xxs bg-container-primary hover:bg-fg-24 border border-fg-08 rounded"
                                >
                                  Fine Grain
                                </button>
                                <button
                                  onClick={() => {
                                    onUpdateFilterParams?.(selectedObject.id, filter.id, {
                                      scaleX: 60, scaleY: 60, frequency: 0.2, octaves: 1, persistence: 0.2
                                    })
                                  }}
                                  className="px-2 py-0.5 kol-helper-uc-xxs bg-container-primary hover:bg-fg-24 border border-fg-08 rounded"
                                >
                                  Large Waves
                                </button>
                              </div>
                              <RangeSlider
                                label="Scale X"
                                value={filter.params.scaleX || 20}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, scaleX: Number(e.target.value) })
                                }}
                                min={0}
                                max={200}
                              />
                              <RangeSlider
                                label="Scale Y"
                                value={filter.params.scaleY || 20}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, scaleY: Number(e.target.value) })
                                }}
                                min={0}
                                max={200}
                              />
                              <RangeSlider
                                label="Frequency"
                                value={filter.params.frequency || 1}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, frequency: Number(e.target.value) })
                                }}
                                min={0.1}
                                max={10}
                                step={0.1}
                              />
                              <RangeSlider
                                label="Octaves"
                                value={filter.params.octaves || 3}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, octaves: Number(e.target.value) })
                                }}
                                min={1}
                                max={8}
                              />
                              <RangeSlider
                                label="Persistence"
                                value={filter.params.persistence || 0.5}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, persistence: Number(e.target.value) })
                                }}
                                min={0}
                                max={1}
                                step={0.01}
                              />
                            </div>
                          )}

                          {/* Twist */}
                          {filter.type === 'filter-twist' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Radius"
                                value={filter.params.radius || 200}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, radius: Number(e.target.value) })
                                }}
                                min={0}
                                max={500}
                              />
                              <RangeSlider
                                label="Angle"
                                value={filter.params.angle || 4}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, angle: Number(e.target.value) })
                                }}
                                min={-10}
                                max={10}
                                step={0.1}
                              />
                            </div>
                          )}

                          {/* Bulge/Pinch */}
                          {filter.type === 'filter-bulge-pinch' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Radius"
                                value={filter.params.radius || 100}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, radius: Number(e.target.value) })
                                }}
                                min={0}
                                max={500}
                              />
                              <RangeSlider
                                label="Strength"
                                value={filter.params.strength || 1}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, strength: Number(e.target.value) })
                                }}
                                min={-3}
                                max={3}
                                step={0.1}
                              />
                            </div>
                          )}

                          {/* Shockwave */}
                          {filter.type === 'filter-shockwave' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Amplitude"
                                value={filter.params.amplitude || 30}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, amplitude: Number(e.target.value) })
                                }}
                                min={0}
                                max={100}
                              />
                              <RangeSlider
                                label="Wavelength"
                                value={filter.params.wavelength || 160}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, wavelength: Number(e.target.value) })
                                }}
                                min={10}
                                max={500}
                              />
                            </div>
                          )}

                          {/* Adjustment */}
                          {filter.type === 'filter-adjustment' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Gamma"
                                value={filter.params.gamma || 1}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, gamma: Number(e.target.value) })
                                }}
                                min={0}
                                max={2}
                                step={0.01}
                              />
                              <RangeSlider
                                label="Saturation"
                                value={filter.params.saturation || 1}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, saturation: Number(e.target.value) })
                                }}
                                min={0}
                                max={2}
                                step={0.01}
                              />
                              <RangeSlider
                                label="Contrast"
                                value={filter.params.contrast || 1}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, contrast: Number(e.target.value) })
                                }}
                                min={0}
                                max={2}
                                step={0.01}
                              />
                              <RangeSlider
                                label="Brightness"
                                value={filter.params.brightness || 1}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, brightness: Number(e.target.value) })
                                }}
                                min={0}
                                max={2}
                                step={0.01}
                              />
                            </div>
                          )}

                          {/* HSL Adjustment */}
                          {filter.type === 'filter-hsl-adjustment' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Hue"
                                value={filter.params.hue || 0}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, hue: Number(e.target.value) })
                                }}
                                min={-1}
                                max={1}
                                step={0.01}
                              />
                              <RangeSlider
                                label="Saturation"
                                value={filter.params.saturation || 0}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, saturation: Number(e.target.value) })
                                }}
                                min={-1}
                                max={1}
                                step={0.01}
                              />
                              <RangeSlider
                                label="Lightness"
                                value={filter.params.lightness || 0}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, lightness: Number(e.target.value) })
                                }}
                                min={-1}
                                max={1}
                                step={0.01}
                              />
                            </div>
                          )}

                          {/* Kawase Blur */}
                          {filter.type === 'filter-kawase-blur' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Blur"
                                value={filter.params.blur || 4}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, blur: Number(e.target.value) })
                                }}
                                min={0}
                                max={20}
                              />
                              <RangeSlider
                                label="Quality"
                                value={filter.params.quality || 3}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, quality: Number(e.target.value) })
                                }}
                                min={1}
                                max={10}
                              />
                            </div>
                          )}

                          {/* ASCII */}
                          {filter.type === 'filter-ascii' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Size"
                                value={filter.params.size || 8}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, size: Number(e.target.value) })
                                }}
                                min={2}
                                max={20}
                              />
                            </div>
                          )}

                          {/* Dot Screen */}
                          {filter.type === 'filter-dot' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Scale"
                                value={filter.params.scale || 1}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, scale: Number(e.target.value) })
                                }}
                                min={0.1}
                                max={5}
                                step={0.1}
                              />
                              <RangeSlider
                                label="Angle"
                                value={filter.params.angle || 5}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, angle: Number(e.target.value) })
                                }}
                                min={0}
                                max={360}
                              />
                            </div>
                          )}

                          {/* CRT */}
                          {filter.type === 'filter-crt' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Curvature"
                                value={filter.params.curvature || 1}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, curvature: Number(e.target.value) })
                                }}
                                min={0}
                                max={10}
                                step={0.1}
                              />
                              <RangeSlider
                                label="Line Width"
                                value={filter.params.lineWidth || 1}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, lineWidth: Number(e.target.value) })
                                }}
                                min={0}
                                max={5}
                                step={0.1}
                              />
                              <RangeSlider
                                label="Noise"
                                value={filter.params.noise || 0.3}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, noise: Number(e.target.value) })
                                }}
                                min={0}
                                max={1}
                                step={0.01}
                              />
                            </div>
                          )}

                          {/* Old Film */}
                          {filter.type === 'filter-old-film' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Sepia"
                                value={filter.params.sepia || 0.3}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, sepia: Number(e.target.value) })
                                }}
                                min={0}
                                max={1}
                                step={0.01}
                              />
                              <RangeSlider
                                label="Noise"
                                value={filter.params.noise || 0.3}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, noise: Number(e.target.value) })
                                }}
                                min={0}
                                max={1}
                                step={0.01}
                              />
                              <RangeSlider
                                label="Scratch"
                                value={filter.params.scratch || 0.5}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, scratch: Number(e.target.value) })
                                }}
                                min={0}
                                max={1}
                                step={0.01}
                              />
                            </div>
                          )}

                          {/* Glitch */}
                          {filter.type === 'filter-glitch' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Slices"
                                value={filter.params.slices || 5}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, slices: Number(e.target.value) })
                                }}
                                min={1}
                                max={50}
                              />
                              <RangeSlider
                                label="Offset"
                                value={filter.params.offset || 100}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, offset: Number(e.target.value) })
                                }}
                                min={0}
                                max={500}
                              />
                            </div>
                          )}

                          {/* RGB Split */}
                          {filter.type === 'filter-rgb-split' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Red X"
                                value={filter.params.red?.x || -10}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, {
                                    ...filter.params,
                                    red: { ...filter.params.red, x: Number(e.target.value) }
                                  })
                                }}
                                min={-50}
                                max={50}
                              />
                              <RangeSlider
                                label="Blue X"
                                value={filter.params.blue?.x || 10}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, {
                                    ...filter.params,
                                    blue: { ...filter.params.blue, x: Number(e.target.value) }
                                  })
                                }}
                                min={-50}
                                max={50}
                              />
                            </div>
                          )}

                          {/* Bloom */}
                          {filter.type === 'filter-bloom' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Blur"
                                value={filter.params.blur || 2}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, blur: Number(e.target.value) })
                                }}
                                min={0}
                                max={20}
                              />
                              <RangeSlider
                                label="Strength"
                                value={filter.params.strength || 1}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, strength: Number(e.target.value) })
                                }}
                                min={0}
                                max={5}
                                step={0.1}
                              />
                            </div>
                          )}

                          {/* Advanced Bloom */}
                          {filter.type === 'filter-advanced-bloom' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Threshold"
                                value={filter.params.threshold || 0.5}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, threshold: Number(e.target.value) })
                                }}
                                min={0}
                                max={1}
                                step={0.01}
                              />
                              <RangeSlider
                                label="Bloom Scale"
                                value={filter.params.bloomScale || 1}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, bloomScale: Number(e.target.value) })
                                }}
                                min={0}
                                max={3}
                                step={0.1}
                              />
                              <RangeSlider
                                label="Brightness"
                                value={filter.params.brightness || 1}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, brightness: Number(e.target.value) })
                                }}
                                min={0}
                                max={2}
                                step={0.1}
                              />
                            </div>
                          )}

                          {/* Glow */}
                          {filter.type === 'filter-glow' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Distance"
                                value={filter.params.distance || 10}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, distance: Number(e.target.value) })
                                }}
                                min={0}
                                max={50}
                              />
                              <RangeSlider
                                label="Outer Strength"
                                value={filter.params.outerStrength || 4}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, outerStrength: Number(e.target.value) })
                                }}
                                min={0}
                                max={20}
                              />
                            </div>
                          )}

                          {/* Bevel */}
                          {filter.type === 'filter-bevel' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Thickness"
                                value={filter.params.thickness || 2}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, thickness: Number(e.target.value) })
                                }}
                                min={0}
                                max={20}
                              />
                              <RangeSlider
                                label="Rotation"
                                value={filter.params.rotation || 45}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, rotation: Number(e.target.value) })
                                }}
                                min={0}
                                max={360}
                              />
                            </div>
                          )}

                          {/* Drop Shadow (Pixi) */}
                          {filter.type === 'filter-drop-shadow' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Distance"
                                value={filter.params.distance || 5}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, distance: Number(e.target.value) })
                                }}
                                min={0}
                                max={50}
                              />
                              <RangeSlider
                                label="Blur"
                                value={filter.params.blur || 2}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, blur: Number(e.target.value) })
                                }}
                                min={0}
                                max={20}
                              />
                              <RangeSlider
                                label="Alpha"
                                value={filter.params.alpha || 0.5}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, alpha: Number(e.target.value) })
                                }}
                                min={0}
                                max={1}
                                step={0.01}
                              />
                            </div>
                          )}

                          {/* Outline */}
                          {filter.type === 'filter-outline' && (
                            <div className="space-y-2 pt-2">
                              <RangeSlider
                                label="Thickness"
                                value={filter.params.thickness || 1}
                                onChange={(e) => {
                                  onUpdateFilterParams?.(selectedObject.id, filter.id, { ...filter.params, thickness: Number(e.target.value) })
                                }}
                                min={0}
                                max={20}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    </Fragment>
                  )
                })}
              </div>
            ) : (
              <div className="text-fg-48 kol-mono-sm text-center py-8">
                No filters applied.
                <br />
                Select a filter from the toolbar to add.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Inspector
