import { useState } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../components/organisms/TopNav'
import Toolbar from '../components/organisms/Toolbar'
import LayersSidebar from '../components/organisms/LayersSidebar'
import Inspector from '../components/organisms/Inspector'

const OrganismsPage = () => {
  const [activeTool, setActiveTool] = useState('select')
  const [dropdownState, setDropdownState] = useState({ toolId: null, left: 0 })
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const [selectedLayerId, setSelectedLayerId] = useState('layer-1')
  const [selectedObjectId, setSelectedObjectId] = useState('obj-1')
  const [expandedLayers, setExpandedLayers] = useState(new Set(['layer-1']))

  const mockLayers = [
    {
      id: 'layer-1',
      name: 'Canvas 1',
      background: '#18181b',
      visible: true,
      objects: [
        {
          id: 'obj-1',
          name: 'Rectangle',
          type: 'rect',
          visible: true,
          color: '#22d3ee',
          opacity: 1,
          frame: { x: 100, y: 100, width: 200, height: 150, rotation: 0 }
        }
      ]
    }
  ]

  const selectedLayer = mockLayers.find(l => l.id === selectedLayerId)
  const selectedObject = selectedLayer?.objects.find(o => o.id === selectedObjectId)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="border-b border-zinc-800 pb-6">
          <h1 className="text-3xl font-bold mb-2">Component Library</h1>
          <p className="text-zinc-400">Atomic design components for the Konva Layer Editor</p>
        </div>

        {/* Organisms Section */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-2 text-green-400">Organisms</h2>
            <p className="text-zinc-400 mb-6">Major sections - complete UI sections composed of molecules and atoms</p>
          </div>

          {/* TopNav */}
          <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/50">
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-1">TopNav</h3>
              <p className="text-sm text-zinc-400">Navigation bar with canvas size, clear, and load buttons</p>
            </div>

            <div className="border border-zinc-700 rounded overflow-hidden">
              <TopNav
                onCanvasSizeClick={() => alert('Canvas size clicked')}
                onClearDocument={() => alert('Clear document')}
                canvasSize={{ width: 1200, height: 700 }}
              />
            </div>
          </div>

          {/* Toolbar */}
          <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/50">
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-1">Toolbar</h3>
              <p className="text-sm text-zinc-400">Tool buttons with dropdowns and filter menu</p>
            </div>

            <div className="border border-zinc-700 rounded overflow-hidden">
              <Toolbar
                activeTool={activeTool}
                dropdownState={dropdownState}
                toolSelections={{}}
                filterMenuOpen={filterMenuOpen}
                onToolbarButton={(toolId) => setActiveTool(toolId)}
                onToggleDropdown={(toolId, refs, containerRef) => {
                  setDropdownState(prev =>
                    prev.toolId === toolId ? { toolId: null, left: 0 } : { toolId, left: 100 }
                  )
                }}
                onToolOption={(toolId, optionId) => {
                  alert(`Tool: ${toolId}, Option: ${optionId}`)
                  setDropdownState({ toolId: null, left: 0 })
                }}
                onFilterSelect={(filterId) => {
                  alert(`Filter: ${filterId}`)
                  setFilterMenuOpen(false)
                }}
                setFilterMenuOpen={setFilterMenuOpen}
              />
            </div>
          </div>

          {/* LayersSidebar */}
          <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/50">
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-1">LayersSidebar</h3>
              <p className="text-sm text-zinc-400">Full layer/canvas management sidebar</p>
            </div>

            <div className="border border-zinc-700 rounded overflow-hidden max-w-xs">
              <LayersSidebar
                layers={mockLayers}
                selectedLayerId={selectedLayerId}
                selectedObjectId={selectedObjectId}
                expandedLayers={expandedLayers}
                onLayerSelect={(layerId, objId) => {
                  setSelectedLayerId(layerId)
                  setSelectedObjectId(objId || null)
                }}
                onObjectSelect={(layerId, objId) => {
                  setSelectedLayerId(layerId)
                  setSelectedObjectId(objId)
                }}
                onToggleExpand={(layerId) => {
                  setExpandedLayers(prev => {
                    const next = new Set(prev)
                    if (next.has(layerId)) next.delete(layerId)
                    else next.add(layerId)
                    return next
                  })
                }}
                onToggleLayerVisibility={() => alert('Toggle layer visibility')}
                onToggleObjectVisibility={() => alert('Toggle object visibility')}
                onMoveLayer={() => alert('Move layer')}
                onDeleteLayer={() => alert('Delete layer')}
                onDeleteObject={() => alert('Delete object')}
                onAddLayer={() => alert('Add layer')}
              />
            </div>
          </div>

          {/* Inspector */}
          <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/50">
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-1">Inspector</h3>
              <p className="text-sm text-zinc-400">Property inspector with color picker and controls</p>
            </div>

            <div className="border border-zinc-700 rounded overflow-hidden max-w-sm">
              <Inspector
                selectedLayer={selectedLayer}
                selectedObject={selectedObject}
                onLayerNameChange={() => {}}
                onLayerBackgroundChange={() => {}}
                onObjectPropertyChange={() => {}}
                onObjectColorChange={() => {}}
                onObjectOpacityChange={() => {}}
                onObjectTextChange={() => {}}
                inspectorFilter={null}
                setInspectorFilter={() => {}}
              />
            </div>
          </div>

          {/* CanvasArea Note */}
          <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/50">
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-1">CanvasArea</h3>
              <p className="text-sm text-zinc-400">Main canvas with rulers, stage, artboard, and handles</p>
            </div>

            <div className="bg-zinc-800/50 rounded p-6 text-center">
              <p className="text-zinc-500">
                CanvasArea requires Konva Stage and complex state management.
              </p>
              <p className="text-sm text-zinc-600 mt-2">
                See it in action at <Link to="/" className="text-blue-400 hover:text-blue-300">/</Link> (main editor)
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-zinc-800 pt-6 pb-12">
          <p className="text-sm text-zinc-500">
            Component library structure: <Link to="/components/atoms" className="text-zinc-400">Atoms</Link> → <Link to="/components/molecules" className="text-zinc-400">Molecules</Link> → <Link to="/components/organisms" className="text-green-400">Organisms</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default OrganismsPage
