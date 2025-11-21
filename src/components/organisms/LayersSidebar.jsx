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
import React, { useState, useMemo, useRef, useEffect } from 'react'
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
  const mousePositionRef = useRef({ x: 0, y: 0 })

  // Track mouse position globally
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY }
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

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
  const [dropTargetId, setDropTargetId] = useState(null) // For showing outline when on right side

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
    // Determine if dragging a frame or object by checking shapes
    const shape = shapes[active.id]
    const isFrame = shape && shape.type === 'frame'
    setActiveType(isFrame ? 'frame' : 'object')
    console.log('DRAG START:', { id: active.id, shape, isFrame, type: shape?.type })
  }

  const handleDragMove = (event) => {
    if (event.over) {
      const { over, active } = event

      // Find items
      const overItem = flattenedItems.find(item => item.id === over.id)
      const activeItem = flattenedItems.find(item => item.id === active.id)

      if (!overItem || !activeItem) return

      const isOverFrame = overItem.itemType === 'frame'

      // Only frames can receive items inside them
      if (!isOverFrame) {
        // For objects, only before/after
        const overIndex = flattenedItems.findIndex(item => item.id === over.id)
        const activeIndex = flattenedItems.findIndex(item => item.id === active.id)
        const isMovingUp = activeIndex > overIndex

        setOverId(over.id)
        setDropIndicator('line')
        setDropPosition(isMovingUp ? 'before' : 'after')
        return
      }

      // For frames: check horizontal position FIRST
      const overElement = document.querySelector(`[data-layer-id="${over.id}"]`)
      if (!overElement) {
        // Fallback to index-based logic
        const overIndex = flattenedItems.findIndex(item => item.id === over.id)
        const activeIndex = flattenedItems.findIndex(item => item.id === active.id)
        const isMovingUp = activeIndex > overIndex
        setOverId(over.id)
        setDropIndicator('line')
        setDropPosition(isMovingUp ? 'before' : 'after')
        return
      }

      const rect = overElement.getBoundingClientRect()
      const mouseY = mousePositionRef.current.y
      const mouseX = mousePositionRef.current.x
      const relativeY = mouseY - rect.top
      const relativeX = mouseX - rect.left
      const height = rect.height
      const width = rect.width

      // RIGHT SIDE (60% of width) = Always drop INSIDE, no reordering
      // Don't set overId to prevent visual reordering animation
      if (relativeX > width * 0.4) {
        setOverId(null)
        setDropTargetId(over.id)
        setDropIndicator('outline')
        setDropPosition('inside')
      }
      // LEFT SIDE (40% of width) = Allow reordering before/after
      else {
        setOverId(over.id)
        setDropTargetId(null)
        if (relativeY < height * 0.5) {
          setDropIndicator('line')
          setDropPosition('before')
        } else {
          setDropIndicator('line')
          setDropPosition('after')
        }
      }
    } else {
      setOverId(null)
      setDropTargetId(null)
      setDropIndicator(null)
      setDropPosition(null)
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      setActiveId(null)
      setActiveType(null)
      setOverId(null)
      setDropTargetId(null)
      setDropIndicator(null)
      setDropPosition(null)
      return
    }

    console.log('DROP:', { activeId: active.id, overId: over.id, dropPosition, activeType })

    // Use position-based logic
    if (dropPosition === 'inside') {
      // Nest into the target frame
      console.log('Dropping INSIDE frame')
      if (activeType === 'frame') {
        onNestFrameInFrame(active.id, over.id)
      } else {
        console.log('Calling onMoveObjectToFrame')
        onMoveObjectToFrame(active.id, over.id)
      }
    } else if (dropPosition === 'before' || dropPosition === 'after') {
      // Insert before or after the target item
      console.log('Dropping', dropPosition)
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
    setDropTargetId(null)
    setDropIndicator(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[
        (args) => {
          const { transform } = args
          // Constrain horizontal movement to 0 - no left/right dragging
          return {
            ...transform,
            x: 0,
          }
        }
      ]}
    >
      <div className="w-56 border-r border-fg-08 bg-surface-primary flex flex-col overflow-hidden">
        <div className="px-3 py-2 border-b border-fg-08 uppercase tracking-wide text-fg-48">
          Canvas
        </div>

        <div
          className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1"
          onClick={(e) => {
            // If clicking on the empty space (not on a layer item), deselect everything
            if (e.target === e.currentTarget) {
              onLayerSelect(null, null)
            }
          }}
        >
          {/* Layer Section Header */}
          <div className="px-3 py-2 uppercase tracking-wide text-fg-48 text-xs">
            LAYER
          </div>

          <SortableContext
            items={flattenedItems.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {flattenedItems.map((item) => {
              const showLine = overId === item.id && dropIndicator === 'line'
              const showOutline = (overId === item.id || dropTargetId === item.id) && dropIndicator === 'outline'

              if (item.itemType === 'frame') {
                // Determine if this frame/boolean group is selected
                const hasSelectedChild = item.objects?.some(obj => obj.id === selectedObjectId)
                // Check if it's selected as a layer (frame) OR as an object (boolean group) OR in multi-selection
                const isFrameSelected = (selectedLayerId === item.id || selectedObjectId === item.id || selectedObjectIds.includes(item.id)) && !hasSelectedChild

                return (
                  <LayerItem
                    key={item.id}
                    layer={item}
                    isSelected={isFrameSelected}
                    hasSelectedChild={hasSelectedChild}
                    hasChildren={item.hasChildren}
                    isExpanded={expandedLayers.has(item.id)}
                    onSelect={() => onLayerSelect(item.id, null)}
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

        <div className="p-2 border-t border-fg-08">
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
