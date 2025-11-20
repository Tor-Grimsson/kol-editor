import PropertyInput from '../molecules/PropertyInput'
import ColorPicker from '../molecules/ColorPicker'
import RangeSlider from '../molecules/RangeSlider'
import Input from '../atoms/Input'
import Button from '../atoms/Button'
import Icon from '../icons/Icon'

const Inspector = ({
  selectedLayer,
  selectedObject,
  canvasBackground,
  onLayerNameChange,
  onLayerBackgroundChange,
  onLayerPropertyChange,
  onObjectPropertyChange,
  onObjectColorChange,
  onObjectOpacityChange,
  onObjectTextChange,
  inspectorFilter,
  setInspectorFilter,
  onExpandBooleanGroup
}) => {
  const selectedOpacityPercent = Math.round((selectedObject?.opacity ?? 1) * 100)

  return (
    <div className="w-80 border-l border-zinc-800 bg-zinc-900 flex flex-col">
      <div className="px-3 py-2 border-b border-zinc-800 uppercase tracking-wide text-zinc-500">
        Inspector
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Canvas Name - Only when layer selected and no object selected */}
        {selectedLayer && !selectedObject && (
          <div className="flex flex-col gap-1">
            <span className="text-zinc-500">Canvas name</span>
            <Input
              type="text"
              value={selectedLayer.name}
              onChange={(e) => onLayerNameChange(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100"
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
          <div className="grid grid-cols-2 gap-2">
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
          <div className="space-y-2 border-t border-zinc-800 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 w-16">Font</span>
              <Input
                type="text"
                value={selectedObject.fontFamily}
                onChange={(e) => onObjectTextChange('fontFamily', e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 w-16">Size</span>
              <Input
                type="number"
                min={8}
                value={selectedObject.fontSize}
                onChange={(e) => onObjectTextChange('fontSize', Number(e.target.value))}
                className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100"
              />
              <Button
                className={`px-3 py-1 rounded border ${
                  selectedObject.fontStyle === 'bold'
                    ? 'bg-blue-600 border-blue-500'
                    : 'border-zinc-700 bg-zinc-800'
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
          <div className="border-t border-zinc-800 pt-3">
            <ColorPicker
              color={selectedObject ? (selectedObject.color || '#000000') : selectedLayer.background}
              onChange={selectedObject ? onObjectColorChange : onLayerBackgroundChange}
            />
          </div>
        )}

        {/* Opacity - Only for selected objects */}
        {selectedObject && (
          <div>
            <RangeSlider
              label="O"
              value={selectedOpacityPercent}
              onChange={(e) => onObjectOpacityChange(Number(e.target.value))}
              min={0}
              max={100}
            />
          </div>
        )}

        {/* Boolean Group Controls */}
        {selectedObject?.type === 'boolean' && (
          <div className="border-t border-zinc-800 pt-3">
            <Button
              variant="primary"
              onClick={onExpandBooleanGroup}
              className="w-full"
            >
              Expand Vector Shape
            </Button>
          </div>
        )}

        {/* Filter Controls */}
        {inspectorFilter && (
          <div className="border-t border-zinc-800 pt-3 space-y-2">
            <div className="text-zinc-500 uppercase tracking-wide flex items-center gap-2">
              <Icon name="auto-layout" folder="tools-name/shape-align" size={12} />
              Filter Controls ({inspectorFilter.type})
            </div>
            <div className="flex items-center gap-2">
              <span className="w-16 text-zinc-500">Amount</span>
              <Input
                type="range"
                min={0}
                max={100}
                value={inspectorFilter.amount}
                onChange={(e) => setInspectorFilter((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                className="flex-1 accent-blue-500"
              />
              <span className="w-10 text-right">{inspectorFilter.amount}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Inspector
