import {
  DndContext,
  closestCenter,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import React, { useState, useMemo } from 'react'
import LayerItem from '../molecules/LayerItem'
import ObjectItem from '../molecules/ObjectItem'
import Button from '../atoms/Button'

const LayersSidebar = ({
  layers,
  shapes,
  selectedLayerId,
  selectedObjectId,
  selectedObjectIds = [],
  expandedLayers,
  onLayerSelect,
  onObjectSelect,
  onToggleExpand,
  onToggleLayerVisibility,
  onToggleObjectVisibility,
  onMoveLayer,
  onDeleteLayer,
  onDeleteObject,
  onAddLayer,
  onReorderFrames,
  onReorderObjects,
  onMoveObjectToFrame,
  onNestFrameInFrame,
  onMoveToInfiniteCanvas,
  onInsertItem
}) => {
  const [activeId, setActiveId] = useState(null)
  const [activeType, setActiveType] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const [overId, setOverId] = useState(null)
  const [dropIndicator, setDropIndicator] = useState(null) // 'line' or 'outline'
  const [dropPosition, setDropPosition] = useState(null) // 'before', 'after', 'inside'

  // Flatten layers and objects into single array with depth information
  const flattenedItems = React.useMemo(() => {
    const items = []

    layers.forEach((layer) => {
      // Determine if this is a frame, boolean group, or object at top level
      const isFrame = layer.type === 'frame'
      const isBooleanGroup = layer.type === 'boolean'

      if (isFrame || isBooleanGroup) {
        // Add the frame or boolean group
        items.push({
          ...layer,
          itemType: 'frame',
          depth: 0,
          hasChildren: layer.objects.length > 0,
        })

        // Add objects if expanded
        if (expandedLayers.has(layer.id) && layer.objects.length > 0) {
          layer.objects.forEach((obj) => {
            if (obj.type === 'frame' || obj.type === 'boolean') {
              // Nested frame or boolean group
              items.push({
                ...obj,
                itemType: 'frame',
                depth: 1,
                hasChildren: obj.children?.length > 0,
              })

              // Add nested children if expanded (always show, even if not visible)
              if (expandedLayers.has(obj.id) && obj.children?.length > 0) {
                obj.children.forEach((childId) => {
                  const child = shapes[childId]
                  if (child) {
                    items.push({
                      ...child,
                      itemType: 'object',
                      depth: 2,
                      hasChildren: false,
                    })
                  }
                })
              }
            } else {
              // Regular object (only show if visible or part of boolean group)
              items.push({
                ...obj,
                itemType: 'object',
                depth: 1,
                hasChildren: false,
              })
            }
          })
        }
      } else {
        // Top-level object (not a frame or boolean group)
        items.push({
          ...layer,
          itemType: 'object',
          depth: 0,
          hasChildren: false,
        })
      }
    })

    return items
  }, [layers, expandedLayers, shapes])

  const handleDragStart = (event) => {
    const { active } = event
    setActiveId(active.id)
    // Determine if dragging a frame or object
    const isFrame = layers.some(layer => layer.id === active.id)
    setActiveType(isFrame ? 'frame' : 'object')
  }

  const handleDragOver = (event) => {
    const { over, active } = event
    if (!over) {
      setOverId(null)
      return
    }

    setOverId(over.id)

    // Find indices in flattened list
    const overItem = flattenedItems.find(item => item.id === over.id)
    const activeItem = flattenedItems.find(item => item.id === active.id)

    if (!overItem || !activeItem) return

    const overIndex = flattenedItems.findIndex(item => item.id === over.id)
    const activeIndex = flattenedItems.findIndex(item => item.id === active.id)

    // Standard dnd-kit pattern: determine position based on index movement
    // If moving up (activeIndex > overIndex): insert before over
    // If moving down (activeIndex < overIndex): insert after over
    const isMovingUp = activeIndex > overIndex
    const isOverFrame = overItem.itemType === 'frame'
    const isFrameCollapsed = isOverFrame && !expandedLayers.has(overItem.id)

    // Special case: if hovering over a collapsed frame, allow nesting inside
    if (isFrameCollapsed && !isMovingUp) {
      setDropIndicator('outline')
      setDropPosition('inside')
    } else if (isMovingUp) {
      setDropIndicator('line')
      setDropPosition('before')
    } else {
      setDropIndicator('line')
      setDropPosition('after')
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      setActiveId(null)
      setActiveType(null)
      setOverId(null)
      setDropIndicator(null)
      setDropPosition(null)
      return
    }

    // Use position-based logic
    if (dropPosition === 'inside') {
      // Nest into the target frame
      if (activeType === 'frame') {
        onNestFrameInFrame(active.id, over.id)
      } else {
        onMoveObjectToFrame(active.id, over.id)
      }
    } else if (dropPosition === 'before' || dropPosition === 'after') {
      // Insert before or after the target item
      onInsertItem(active.id, over.id, dropPosition)
    }

    setActiveId(null)
    setActiveType(null)
    setOverId(null)
    setDropIndicator(null)
    setDropPosition(null)
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setActiveType(null)
    setOverId(null)
    setDropIndicator(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
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
          {/* Layer Section Header */}
          <div className="px-3 py-2 uppercase tracking-wide text-zinc-500 text-xs">
            LAYER
          </div>

          <SortableContext
            items={flattenedItems.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {flattenedItems.map((item) => {
              const showLine = overId === item.id && dropIndicator === 'line'
              const showOutline = overId === item.id && dropIndicator === 'outline'

              if (item.itemType === 'frame') {
                // Determine if this frame/boolean group is selected
                const hasSelectedChild = item.objects?.some(obj => obj.id === selectedObjectId)
                // Check if it's selected as a layer (frame) OR as an object (boolean group)
                const isFrameSelected = (selectedLayerId === item.id || selectedObjectId === item.id) && !hasSelectedChild

                return (
                  <LayerItem
                    key={item.id}
                    layer={item}
                    isSelected={isFrameSelected}
                    hasSelectedChild={hasSelectedChild}
                    hasChildren={item.hasChildren}
                    isExpanded={expandedLayers.has(item.id)}
                    onSelect={() => onLayerSelect(item.id, item.objects?.[0]?.id)}
                    onToggleExpand={() => onToggleExpand(item.id)}
                    onToggleVisibility={() => onToggleLayerVisibility(item.id)}
                    showOutline={showOutline}
                    showLine={showLine}
                    nestLevel={item.depth}
                  />
                )
              } else {
                // item.itemType === 'object'
                const parentId = item.frameId || item.parentId
                const isSelected = selectedObjectId === item.id || selectedObjectIds.includes(item.id)

                return (
                  <ObjectItem
                    key={item.id}
                    object={item}
                    isSelected={isSelected}
                    onSelect={() => onObjectSelect(parentId, item.id)}
                    onToggleVisibility={() => onToggleObjectVisibility(parentId, item.id)}
                    onDelete={() => onDeleteObject(parentId, item.id)}
                    showLine={showLine}
                    nestLevel={item.depth}
                  />
                )
              }
            })}
          </SortableContext>
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
    </DndContext>
  )
}

export default LayersSidebar
