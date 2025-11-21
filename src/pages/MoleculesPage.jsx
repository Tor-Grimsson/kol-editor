import { useState } from 'react'
import { Link } from 'react-router-dom'
import ToolbarButton from '../components/molecules/ToolbarButton'
import LayerItem from '../components/molecules/LayerItem'
import ObjectItem from '../components/molecules/ObjectItem'
import ColorPicker from '../components/molecules/ColorPicker'
import PropertyInput from '../components/molecules/PropertyInput'
import RangeSlider from '../components/molecules/RangeSlider'
import CanvasHandle from '../components/molecules/CanvasHandle'
import PointerIcon from '../assets/icons/custom/pointer.svg'

const MoleculesPage = () => {
  const [color, setColor] = useState('#22d3ee')
  const [propertyValue, setPropertyValue] = useState(100)
  const [rangeValue, setRangeValue] = useState(50)
  const [layerExpanded, setLayerExpanded] = useState(false)
  const [objectSelected, setObjectSelected] = useState(false)

  const mockLayer = {
    id: 'layer-1',
    name: 'Sample Layer',
    visible: true,
    objects: [
      { id: 'obj-1', name: 'Rectangle', visible: true },
      { id: 'obj-2', name: 'Circle', visible: true }
    ]
  }

  const mockObject = { id: 'obj-1', name: 'Rectangle', visible: true }

  return (
    <div className="min-h-screen bg-surface-tertiary text-auto p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="border-b border-fg-08 pb-6">
          <h1 className="text-3xl font-bold mb-2">Component Library</h1>
          <p className="text-fg-64">Atomic design components for the Konva Layer Editor</p>
        </div>

        {/* Molecules Section */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-purple-400">Molecules</h2>
            <p className="text-fg-64 mb-6">Simple component groups - combinations of atoms with specific purpose</p>
          </div>

          {/* ToolbarButton */}
          <div className="border border-fg-08 rounded-lg p-6 bg-surface-primary/50">
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-1">ToolbarButton</h3>
              <p className="text-sm text-fg-64">Icon button with optional dropdown trigger</p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-fg-48 uppercase mb-2">Default State</p>
                <div className="flex gap-3 items-center">
                  <ToolbarButton
                    icon={PointerIcon}
                    label="Select Tool"
                    onClick={() => alert('Clicked')}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs text-fg-48 uppercase mb-2">Active State</p>
                <div className="flex gap-3 items-center">
                  <ToolbarButton
                    icon={PointerIcon}
                    label="Active Tool"
                    active={true}
                    onClick={() => alert('Clicked')}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs text-fg-48 uppercase mb-2">With Dropdown</p>
                <div className="flex gap-3 items-center">
                  <ToolbarButton
                    icon={PointerIcon}
                    label="Tool with Dropdown"
                    hasDropdown={true}
                    onClick={() => alert('Tool clicked')}
                    onDropdownToggle={() => alert('Dropdown toggled')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ColorPicker */}
          <div className="border border-fg-08 rounded-lg p-6 bg-surface-primary/50">
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-1">ColorPicker</h3>
              <p className="text-sm text-fg-64">Full color picker with HEX + HSB sliders + spectrum</p>
            </div>

            <div className="max-w-md">
              <ColorPicker color={color} onChange={setColor} />
            </div>
          </div>

          {/* PropertyInput */}
          <div className="border border-fg-08 rounded-lg p-6 bg-surface-primary/50">
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-1">PropertyInput</h3>
              <p className="text-sm text-fg-64">Label + input combo for properties</p>
            </div>

            <div className="space-y-4 max-w-xs">
              <PropertyInput
                label="Width"
                type="number"
                value={propertyValue}
                onChange={(e) => setPropertyValue(e.target.value)}
                min={0}
                max={500}
              />
              <PropertyInput
                label="Name"
                type="text"
                value="Sample Object"
                onChange={() => {}}
              />
            </div>
          </div>

          {/* RangeSlider */}
          <div className="border border-fg-08 rounded-lg p-6 bg-surface-primary/50">
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-1">RangeSlider</h3>
              <p className="text-sm text-fg-64">Range slider with numeric input</p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-fg-48 uppercase mb-2">With Label</p>
                <RangeSlider
                  label="H"
                  value={rangeValue}
                  onChange={(e) => setRangeValue(e.target.value)}
                  min={0}
                  max={360}
                />
              </div>

              <div>
                <p className="text-xs text-fg-48 uppercase mb-2">Without Value Display</p>
                <RangeSlider
                  value={rangeValue}
                  onChange={(e) => setRangeValue(e.target.value)}
                  min={0}
                  max={100}
                  showValue={false}
                />
              </div>
            </div>
          </div>

          {/* LayerItem */}
          <div className="border border-fg-08 rounded-lg p-6 bg-surface-primary/50">
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-1">LayerItem</h3>
              <p className="text-sm text-fg-64">Expandable layer with visibility/move/delete controls</p>
            </div>

            <div className="max-w-md">
              <LayerItem
                layer={mockLayer}
                isSelected={true}
                isExpanded={layerExpanded}
                onSelect={() => alert('Layer selected')}
                onToggleExpand={() => setLayerExpanded(!layerExpanded)}
                onToggleVisibility={() => alert('Toggle visibility')}
                onMoveUp={() => alert('Move up')}
                onMoveDown={() => alert('Move down')}
                onDelete={() => alert('Delete layer')}
                canMoveUp={true}
                canMoveDown={true}
              >
                <div className="ml-6 space-y-1">
                  <ObjectItem
                    object={mockLayer.objects[0]}
                    isSelected={objectSelected}
                    onSelect={() => setObjectSelected(!objectSelected)}
                    onToggleVisibility={() => alert('Toggle object visibility')}
                    onDelete={() => alert('Delete object')}
                  />
                  <ObjectItem
                    object={mockLayer.objects[1]}
                    isSelected={false}
                    onSelect={() => {}}
                    onToggleVisibility={() => {}}
                    onDelete={() => {}}
                  />
                </div>
              </LayerItem>
            </div>
          </div>

          {/* ObjectItem */}
          <div className="border border-fg-08 rounded-lg p-6 bg-surface-primary/50">
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-1">ObjectItem</h3>
              <p className="text-sm text-fg-64">Object list item with controls</p>
            </div>

            <div className="max-w-md space-y-2">
              <ObjectItem
                object={mockObject}
                isSelected={true}
                onSelect={() => alert('Selected')}
                onToggleVisibility={() => alert('Toggle visibility')}
                onDelete={() => alert('Delete')}
              />
              <ObjectItem
                object={{ id: 'obj-2', name: 'Circle', visible: false }}
                isSelected={false}
                onSelect={() => {}}
                onToggleVisibility={() => {}}
                onDelete={() => {}}
              />
            </div>
          </div>

          {/* CanvasHandle */}
          <div className="border border-fg-08 rounded-lg p-6 bg-surface-primary/50">
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-1">CanvasHandle</h3>
              <p className="text-sm text-fg-64">Artboard resize/move handles</p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-fg-48 uppercase mb-2">Handle Types</p>
                <div className="relative bg-container-primary rounded p-8 h-40 flex items-center justify-center gap-8">
                  <div className="flex items-center gap-2">
                    <CanvasHandle
                      type="corner"
                      position={{ x: 0, y: 0 }}
                      cursor="nwse-resize"
                      title="Corner Handle"
                    />
                    <span className="text-xs text-fg-48">Corner</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CanvasHandle
                      type="edge"
                      position={{ x: 0, y: 0 }}
                      cursor="ns-resize"
                      title="Edge Handle"
                    />
                    <span className="text-xs text-fg-48">Edge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CanvasHandle
                      type="center"
                      position={{ x: 0, y: 0 }}
                      cursor="move"
                      title="Center Handle"
                    />
                    <span className="text-xs text-fg-48">Center</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-fg-08 pt-6 pb-12">
          <p className="text-sm text-fg-48">
            Component library structure: <Link to="/components/atoms" className="text-fg-64">Atoms</Link> → <Link to="/components/molecules" className="text-purple-400">Molecules</Link> → <Link to="/components/organisms" className="text-fg-64">Organisms</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default MoleculesPage
