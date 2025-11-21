import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/atoms/Button'
import Input from '../components/atoms/Input'
import Separator from '../components/atoms/Separator'
import Label from '../components/atoms/Label'
import Icon from '../components/icons/Icon'

const AtomsPage = () => {
  const [textValue, setTextValue] = useState('Sample text')
  const [numberValue, setNumberValue] = useState(50)
  const [rangeValue, setRangeValue] = useState(50)
  const [colorValue, setColorValue] = useState('#22d3ee')

  return (
    <div className="min-h-screen bg-surface-tertiary text-auto p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="border-b border-fg-08 pb-6">
          <h1 className="text-3xl font-bold mb-2">Component Library</h1>
          <p className="text-fg-64">Atomic design components for the Konva Layer Editor</p>
        </div>

        {/* Atoms Section */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-blue-400">Atoms</h2>
            <p className="text-fg-64 mb-6">Basic building blocks - smallest, most reusable components</p>
          </div>

          {/* Button */}
          <div className="border border-fg-08 rounded-lg p-6 bg-surface-primary/50">
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-1">Button</h3>
              <p className="text-sm text-fg-64">Versatile button component with multiple variants and sizes</p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-fg-48 uppercase mb-2">Variants</p>
                <div className="flex gap-3 items-center flex-wrap">
                  <Button variant="default" onClick={() => alert('Default clicked')}>Default</Button>
                  <Button variant="primary" onClick={() => alert('Primary clicked')}>Primary</Button>
                  <Button variant="ghost" onClick={() => alert('Ghost clicked')}>Ghost</Button>
                  <Button variant="danger" onClick={() => alert('Danger clicked')}>Danger</Button>
                  <Button variant="default" disabled>Disabled</Button>
                </div>
              </div>

              <div>
                <p className="text-xs text-fg-48 uppercase mb-2">Sizes</p>
                <div className="flex gap-3 items-center">
                  <Button size="sm" variant="primary">Small</Button>
                  <Button size="md" variant="primary">Medium</Button>
                  <Button size="lg" variant="primary">Large</Button>
                </div>
              </div>

              <div>
                <p className="text-xs text-fg-48 uppercase mb-2">Icon Buttons (square)</p>
                <div className="flex gap-3 items-center">
                  <Button variant="primary" square title="Add">+</Button>
                  <Button variant="default" square title="Delete">
                    <Icon name="trash" folder="active/actions" size={16} />
                  </Button>
                  <Button variant="ghost" square title="Settings">
                    <Icon name="caret-down" folder="active/ui" size={16} />
                  </Button>
                  <Button variant="primary" square>
                    <Icon name="star" folder="active/content" size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="border border-fg-08 rounded-lg p-6 bg-surface-primary/50">
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-1">Input</h3>
              <p className="text-sm text-fg-64">Flexible input component supporting text, number, range, and color types</p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-fg-48 uppercase mb-2">Text Input</p>
                <Input
                  type="text"
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  className="w-64"
                  placeholder="Enter text..."
                />
              </div>

              <div>
                <p className="text-xs text-fg-48 uppercase mb-2">Number Input</p>
                <Input
                  type="number"
                  value={numberValue}
                  onChange={(e) => setNumberValue(e.target.value)}
                  min={0}
                  max={100}
                  className="w-32"
                />
              </div>

              <div>
                <p className="text-xs text-fg-48 uppercase mb-2">Range Slider</p>
                <div className="flex items-center gap-4">
                  <Input
                    type="range"
                    value={rangeValue}
                    onChange={(e) => setRangeValue(e.target.value)}
                    min={0}
                    max={100}
                    className="w-64"
                  />
                  <span className="text-fg-64 w-12">{rangeValue}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-fg-48 uppercase mb-2">Color Picker</p>
                <div className="flex items-center gap-4">
                  <Input
                    type="color"
                    value={colorValue}
                    onChange={(e) => setColorValue(e.target.value)}
                    className="w-16 h-10"
                  />
                  <span className="text-fg-64 font-mono">{colorValue}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Label */}
          <div className="border border-fg-08 rounded-lg p-6 bg-surface-primary/50">
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-1">Label</h3>
              <p className="text-sm text-fg-64">Text label component for forms and inputs</p>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <Label>Default Label</Label>
                <Input type="text" placeholder="Associated input" className="w-64" />
              </div>

              <div className="flex flex-col gap-1">
                <Label className="uppercase text-xs">Uppercase Label</Label>
                <Input type="text" placeholder="Small caps style" className="w-64" />
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="border border-fg-08 rounded-lg p-6 bg-surface-primary/50">
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-1">Separator</h3>
              <p className="text-sm text-fg-64">Visual divider for grouping UI elements</p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-fg-48 uppercase mb-2">In Toolbar Context</p>
                <div className="flex items-center gap-2 bg-container-primary rounded p-2 w-fit">
                  <Button size="sm">Tool 1</Button>
                  <Button size="sm">Tool 2</Button>
                  <Separator />
                  <Button size="sm">Tool 3</Button>
                  <Button size="sm">Tool 4</Button>
                  <Separator />
                  <Button size="sm">Tool 5</Button>
                </div>
              </div>

              <div>
                <p className="text-xs text-fg-48 uppercase mb-2">Custom Height</p>
                <div className="flex items-center gap-2 bg-container-primary rounded p-2 w-fit">
                  <span>Section A</span>
                  <Separator className="h-12" />
                  <span>Section B</span>
                </div>
              </div>
            </div>
          </div>

          {/* Icon */}
          <div className="border border-fg-08 rounded-lg p-6 bg-surface-primary/50">
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-1">Icon</h3>
              <p className="text-sm text-fg-64">SVG icon loader with caching - auto-folders by first letter</p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-fg-48 uppercase mb-2">Sizes</p>
                <div className="flex gap-4 items-center">
                  <Icon name="star" folder="active/content" size={16} />
                  <Icon name="star" folder="active/content" size={24} />
                  <Icon name="star" folder="active/content" size={32} />
                  <Icon name="star" folder="active/content" size={48} />
                </div>
              </div>

              <div>
                <p className="text-xs text-fg-48 uppercase mb-2">Colors (inherit from parent)</p>
                <div className="flex gap-4 items-center">
                  <span className="text-blue-400"><Icon name="star" folder="active/content" size={24} /></span>
                  <span className="text-pink-400"><Icon name="star" folder="active/content" size={24} /></span>
                  <span className="text-green-400"><Icon name="star" folder="active/content" size={24} /></span>
                  <span className="text-yellow-400"><Icon name="star" folder="active/content" size={24} /></span>
                </div>
              </div>

              <div>
                <p className="text-xs text-fg-48 uppercase mb-2">Sample Icons</p>
                <div className="flex gap-4 items-center flex-wrap">
                  <Icon name="star" folder="active/content" size={24} title="Star" />
                  <Icon name="brush" folder="active/tools" size={24} title="Brush" />
                  <Icon name="square" folder="active/shapes" size={24} title="Square" />
                  <Icon name="circle" folder="active/shapes" size={24} title="Circle" />
                  <Icon name="pencil" folder="active/tools" size={24} title="Pencil" />
                  <Icon name="trash" size={24} title="Trash" />
                  <Icon name="move" folder="active/tools" size={24} title="Move" />
                  <Icon name="grid" folder="active/tools" size={24} title="Grid" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-fg-08 pt-6 pb-12">
          <p className="text-sm text-fg-48">
            Component library structure: <Link to="/components/atoms" className="text-blue-400">Atoms</Link> � <Link to="/components/molecules" className="text-fg-64">Molecules</Link> � <Link to="/components/organisms" className="text-fg-64">Organisms</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AtomsPage
