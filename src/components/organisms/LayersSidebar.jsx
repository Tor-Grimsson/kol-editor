import LayerItem from '../molecules/LayerItem'
import ObjectItem from '../molecules/ObjectItem'
import Button from '../atoms/Button'

const LayersSidebar = ({
  layers,
  infiniteCanvasShapes = [],
  selectedLayerId,
  selectedObjectId,
  expandedLayers,
  onLayerSelect,
  onObjectSelect,
  onToggleExpand,
  onToggleLayerVisibility,
  onToggleObjectVisibility,
  onMoveLayer,
  onDeleteLayer,
  onDeleteObject,
  onAddLayer
}) => {
  return (
    <div className="w-56 border-r border-zinc-800 bg-zinc-900 flex flex-col">
      <div className="px-3 py-2 border-b border-zinc-800 uppercase tracking-wide text-zinc-500">
        Canvas
      </div>

      <div
        className="flex-1 overflow-y-auto p-2 space-y-1"
        onClick={(e) => {
          // If clicking on the empty space (not on a layer item), deselect everything
          if (e.target === e.currentTarget) {
            onLayerSelect(null, null)
          }
        }}
      >
        {/* Infinite Canvas Shapes */}
        {infiniteCanvasShapes.length > 0 && (
          <div className="space-y-1 mb-2">
            {infiniteCanvasShapes.map((obj) => (
              <ObjectItem
                key={obj.id}
                object={obj}
                isSelected={selectedObjectId === obj.id}
                onSelect={() => onObjectSelect(null, obj.id)}
                onToggleVisibility={() => onToggleObjectVisibility(null, obj.id)}
                onDelete={() => onDeleteObject(null, obj.id)}
              />
            ))}
          </div>
        )}

        {layers.map((layer, index) => (
          <LayerItem
            key={layer.id}
            layer={layer}
            isSelected={selectedLayerId === layer.id}
            isExpanded={expandedLayers.has(layer.id)}
            onSelect={() => onLayerSelect(layer.id, layer.objects[0]?.id)}
            onToggleExpand={() => onToggleExpand(layer.id)}
            onToggleVisibility={() => onToggleLayerVisibility(layer.id)}
            onMoveUp={() => onMoveLayer(layer.id, -1)}
            onMoveDown={() => onMoveLayer(layer.id, 1)}
            onDelete={() => onDeleteLayer(layer.id)}
            canMoveUp={index > 0}
            canMoveDown={index < layers.length - 1}
          >
            {layer.objects.length > 0 && (
              <div className="ml-6 space-y-1">
                {layer.objects.map((obj) => (
                  <ObjectItem
                    key={obj.id}
                    object={obj}
                    isSelected={selectedObjectId === obj.id}
                    onSelect={() => onObjectSelect(layer.id, obj.id)}
                    onToggleVisibility={() => onToggleObjectVisibility(layer.id, obj.id)}
                    onDelete={() => onDeleteObject(layer.id, obj.id)}
                  />
                ))}
              </div>
            )}
          </LayerItem>
        ))}
      </div>

      <div className="p-2 border-t border-zinc-800">
        <Button
          square
          variant="primary"
          onClick={onAddLayer}
          title="Add canvas"
        >
          +
        </Button>
      </div>
    </div>
  )
}

export default LayersSidebar
