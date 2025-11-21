import { useMemo } from 'react'
import { Stage, Layer as KonvaLayer, Group, Rect, Circle, RegularPolygon, Star, Line, Text as KonvaText, Transformer } from 'react-konva'
import CanvasHandle from '../molecules/CanvasHandle'
import DraftPreview from '../canvas/DraftPreview'
import { RULER_STEP } from '../../constants/editor'

const CanvasArea = ({
  canvasSize,
  artboardPosition,
  zoomLevel,
  stagePosition,
  selectedLayer,
  layers,
  shapes,
  selectedObject,
  selectedObjectId,
  activeTool,
  stageCursor,
  stageRef,
  transformerRef,
  nodeRefs,
  dragDraft,
  layoutSettings,
  canvasBackground,
  marqueeSelection,
  penPoints,
  penPreviewPoint,
  nodeEditMode,
  editingNodeIndex,
  onStagePointerDown,
  onStagePointerMove,
  onStagePointerUp,
  onArtboardBackgroundClick,
  onCanvasSelection,
  onObjectDragStart,
  onObjectDragEnd,
  onObjectTransformEnd,
  onBeginArtboardDrag,
  onNodeDragStart,
  onNodeDrag,
  onNodeDragEnd,
  renderObject,
  renderDraftGrid,
  // Gradient handles
  onGradientHandleDrag,
}) => {
  const horizontalMarks = useMemo(() => {
    const marks = []
    for (let i = 0; i <= canvasSize.width; i += RULER_STEP) marks.push(i)
    return marks
  }, [canvasSize.width])

  const verticalMarks = useMemo(() => {
    const marks = []
    for (let i = 0; i <= canvasSize.height; i += RULER_STEP) marks.push(i)
    return marks
  }, [canvasSize.height])

  // Convert Konva world coordinates to screen coordinates for HTML overlay handles
  const worldToScreen = (worldX, worldY) => ({
    x: worldX * zoomLevel + stagePosition.x,
    y: worldY * zoomLevel + stagePosition.y
  })

  const left = artboardPosition.x
  const top = artboardPosition.y
  const right = left + canvasSize.width
  const bottom = top + canvasSize.height
  const centerX = left + canvasSize.width / 2
  const centerY = top + canvasSize.height / 2

  // Convert to screen coordinates
  const screenTopLeft = worldToScreen(left, top)
  const screenTopRight = worldToScreen(right, top)
  const screenBottomLeft = worldToScreen(left, bottom)
  const screenBottomRight = worldToScreen(right, bottom)
  const screenTopCenter = worldToScreen(centerX, top)
  const screenBottomCenter = worldToScreen(centerX, bottom)
  const screenLeftCenter = worldToScreen(left, centerY)
  const screenRightCenter = worldToScreen(right, centerY)
  const screenCenter = worldToScreen(centerX, centerY)

  const handleSpecs = [
    { id: 'corner-nw', x: screenTopLeft.x, y: screenTopLeft.y, cursor: 'nwse-resize', directionX: 'start', directionY: 'start', type: 'corner' },
    { id: 'corner-ne', x: screenTopRight.x, y: screenTopRight.y, cursor: 'nesw-resize', directionX: 'end', directionY: 'start', type: 'corner' },
    { id: 'corner-sw', x: screenBottomLeft.x, y: screenBottomLeft.y, cursor: 'nesw-resize', directionX: 'start', directionY: 'end', type: 'corner' },
    { id: 'corner-se', x: screenBottomRight.x, y: screenBottomRight.y, cursor: 'nwse-resize', directionX: 'end', directionY: 'end', type: 'corner' },
    { id: 'edge-top', x: screenTopCenter.x, y: screenTopCenter.y, cursor: 'ns-resize', directionX: 'center', directionY: 'start', type: 'edge' },
    { id: 'edge-bottom', x: screenBottomCenter.x, y: screenBottomCenter.y, cursor: 'ns-resize', directionX: 'center', directionY: 'end', type: 'edge' },
    { id: 'edge-left', x: screenLeftCenter.x, y: screenLeftCenter.y, cursor: 'ew-resize', directionX: 'start', directionY: 'center', type: 'edge' },
    { id: 'edge-right', x: screenRightCenter.x, y: screenRightCenter.y, cursor: 'ew-resize', directionX: 'end', directionY: 'center', type: 'edge' },
    { id: 'center', x: screenCenter.x, y: screenCenter.y, cursor: 'move', mode: 'move', type: 'center' },
  ]

  // Get shapes not in any frame (infinite canvas shapes)
  const infiniteCanvasShapes = useMemo(() => {
    return Object.values(shapes).filter(shape => shape.type !== 'frame' && !shape.frameId)
  }, [shapes])

  return (
    <div className="flex-1 flex flex-col relative min-h-0 overflow-hidden" style={{ backgroundColor: canvasBackground }}>
      <div className="flex-1 flex overflow-hidden min-h-0 h-full" style={{ backgroundColor: canvasBackground }}>
        <div className="relative flex-1 overflow-hidden" style={{ backgroundColor: canvasBackground }}>
          {/* Konva Stage - ALWAYS PRESENT for infinite canvas */}
          <Stage
            width={window.innerWidth}
            height={window.innerHeight}
            ref={stageRef}
            style={{ cursor: stageCursor, position: 'absolute', top: 0, left: 0 }}
            onMouseDown={onStagePointerDown}
            onMouseMove={onStagePointerMove}
            onMouseUp={onStagePointerUp}
            onTouchStart={onStagePointerDown}
            onTouchMove={onStagePointerMove}
            onTouchEnd={onStagePointerUp}
          >
            <KonvaLayer>
              {/* Render frame backgrounds and shapes inside frames */}
              {layers.map((layer) => {
                // Process layer effects
                const effects = layer.effects || []
                const dropShadow = effects.find(e => e.type === 'drop-shadow' && e.enabled)
                const blur = effects.find(e => e.type === 'blur' && e.enabled)
                const backgroundBlur = effects.find(e => e.type === 'background-blur' && e.enabled)
                const noise = effects.find(e => e.type === 'noise' && e.enabled)

                // Build filters array for frame
                const frameFilters = []
                if (blur || backgroundBlur) frameFilters.push(window.Konva.Filters.Blur)
                if (noise) {
                  frameFilters.push(window.Konva.Filters.Noise)
                  // Add grayscale filter for monochromatic noise
                  if (noise.monochromatic !== false) {
                    frameFilters.push(window.Konva.Filters.Grayscale)
                  }
                }

                // Only render background for actual frames, not top-level objects
                // Support legacy 'background' property (rgba string) and new fillColor/fillOpacity
                let fillColor = layer.fillColor ?? '#ffffff'
                let fillOpacity = layer.fillOpacity ?? 0.02

                // Migrate legacy background property to fillColor/fillOpacity
                if (layer.background && !layer.fillColor) {
                  const match = layer.background.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
                  if (match) {
                    const [, r, g, b, a] = match
                    fillColor = `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`
                    fillOpacity = a ? parseFloat(a) : 1
                  } else if (layer.background.startsWith('#')) {
                    fillColor = layer.background
                    fillOpacity = 1
                  }
                }
                const frameBackground = layer.type === 'frame' ? (
                  <Rect
                    key={`frame-bg-${layer.id}-${fillOpacity}`}
                    ref={(node) => {
                      if (node && nodeRefs) {
                        nodeRefs.current?.set(layer.id, node)
                        // Cache the node if filters are applied (required for filters to work)
                        if (frameFilters.length > 0) {
                          node.clearCache()
                          node.cache()
                          node.getLayer()?.batchDraw()
                        }
                      } else if (nodeRefs) {
                        nodeRefs.current?.delete(layer.id)
                      }
                    }}
                    x={layer.x}
                    y={layer.y}
                    width={layer.width}
                    height={layer.height}
                    fill={fillColor}
                    opacity={fillOpacity}
                    listening={activeTool === 'select'}
                    stroke="#3f3f46"
                    strokeWidth={0.5}
                    perfectDrawEnabled={false}
                    onPointerDown={(e) => onArtboardBackgroundClick(e, layer.id)}
                    {...(dropShadow && {
                      shadowColor: dropShadow.color,
                      shadowBlur: dropShadow.blur,
                      shadowOffsetX: dropShadow.offsetX,
                      shadowOffsetY: dropShadow.offsetY,
                      shadowOpacity: dropShadow.opacity ?? 1,
                      shadowEnabled: true,
                    })}
                    {...(frameFilters.length > 0 && {
                      filters: frameFilters,
                    })}
                    {...((blur || backgroundBlur) && {
                      blurRadius: blur?.radius || backgroundBlur?.radius,
                    })}
                    {...(noise && {
                      noise: noise.amount,
                    })}
                    {...(noise && noise.monochromatic !== undefined && {
                      noiseMonochromatic: noise.monochromatic,
                    })}
                  />
                ) : null
                const shapes = layer.visible ? layer.objects.filter((obj) => obj.visible).map((obj) => renderObject(layer.id, obj)) : []
                const frameElements = [frameBackground, ...shapes].filter(Boolean)

                // Wrap frame and its contents in a Group with blending mode
                if (layer.type === 'frame' && layer.blendMode && layer.blendMode !== 'source-over') {
                  return (
                    <Group
                      key={`frame-group-${layer.id}`}
                      globalCompositeOperation={layer.blendMode}
                    >
                      {frameElements}
                    </Group>
                  )
                }

                return frameElements
              })}

              {/* Render shapes on infinite canvas (no frame) */}
              {infiniteCanvasShapes.filter(s => s.visible).map(shape => renderObject(null, shape))}

              {/* Render grid overlay */}
              {renderDraftGrid()}

              <DraftPreview draft={dragDraft} />

              {/* Render marquee selection rectangle */}
              {marqueeSelection && (() => {
                const { start, end } = marqueeSelection
                const x = Math.min(start.x, end.x)
                const y = Math.min(start.y, end.y)
                const width = Math.abs(end.x - start.x)
                const height = Math.abs(end.y - start.y)
                return (
                  <Rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    stroke="#3b82f6"
                    strokeWidth={1}
                    fill="rgba(59, 130, 246, 0.1)"
                    dash={[5, 5]}
                    listening={false}
                  />
                )
              })()}

              {/* Render pen tool preview */}
              {penPoints && penPoints.length > 0 && (() => {
                // Draw lines connecting the points
                const points = []
                penPoints.forEach(pt => {
                  points.push(pt.x, pt.y)
                })

                // Add preview point if exists
                if (penPreviewPoint) {
                  points.push(penPreviewPoint.x, penPreviewPoint.y)
                }

                return (
                  <>
                    {/* Draw the path */}
                    <Line
                      points={points}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      lineCap="round"
                      lineJoin="round"
                      listening={false}
                    />
                    {/* Draw points as circles */}
                    {penPoints.map((pt, i) => (
                      <Circle
                        key={i}
                        x={pt.x}
                        y={pt.y}
                        radius={4}
                        fill="#3b82f6"
                        stroke="white"
                        strokeWidth={2}
                        listening={false}
                      />
                    ))}
                    {/* Draw first point larger to indicate where to close */}
                    {penPoints.length >= 2 && (
                      <Circle
                        x={penPoints[0].x}
                        y={penPoints[0].y}
                        radius={6}
                        fill="transparent"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        listening={false}
                      />
                    )}
                  </>
                )
              })()}

              {/* Render vector nodes in node edit mode */}
              {nodeEditMode && selectedObject && selectedObject.meta && selectedObject.meta.points && (() => {
                const points = selectedObject.meta.points
                const numPoints = points.length / 2
                const nodeElements = []

                // Draw selection outline
                nodeElements.push(
                  <Line
                    key="selection-outline"
                    points={points}
                    x={selectedObject.x}
                    y={selectedObject.y}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dash={[5, 5]}
                    closed={selectedObject.meta.closed}
                    listening={false}
                  />
                )

                // Draw individual nodes
                for (let i = 0; i < numPoints; i++) {
                  const x = selectedObject.x + points[i * 2]
                  const y = selectedObject.y + points[i * 2 + 1]

                  nodeElements.push(
                    <Circle
                      key={`node-${i}`}
                      x={x}
                      y={y}
                      radius={5}
                      fill="white"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      draggable
                      onDragStart={() => onNodeDragStart(i)}
                      onDragMove={(e) => {
                        const relX = e.target.x() - selectedObject.x
                        const relY = e.target.y() - selectedObject.y
                        onNodeDrag(i, relX, relY)
                      }}
                      onDragEnd={onNodeDragEnd}
                    />
                  )
                }

                return <>{nodeElements}</>
              })()}

              <Transformer ref={transformerRef} rotateEnabled keepRatio={false} />
            </KonvaLayer>
          </Stage>

          {/* Only show artboard border and handles when a frame is selected */}
          {layers.length > 0 && selectedLayer && (
            <>

              {/* Artboard Frame Border */}
              <div
                className="absolute border border-surface-on-primary pointer-events-none"
                style={{
                  width: canvasSize.width * zoomLevel,
                  height: canvasSize.height * zoomLevel,
                  top: artboardPosition.y * zoomLevel + stagePosition.y,
                  left: artboardPosition.x * zoomLevel + stagePosition.x,
                }}
              />

          {/* Canvas Size Label */}
          <div
            className="absolute bg-surface-on-primary text-auto kol-helper-uc-xxs px-3 py-1 rounded-full"
            style={{
              top: (artboardPosition.y + canvasSize.height) * zoomLevel + stagePosition.y + 10,
              left: (artboardPosition.x + canvasSize.width / 2) * zoomLevel + stagePosition.x - 30,
            }}
          >
            {Math.round(canvasSize.width)} × {Math.round(canvasSize.height)}
          </div>

              {/* Artboard Handles */}
              {handleSpecs.map((spec) => (
                <CanvasHandle
                  key={spec.id}
                  type={spec.type}
                  position={{ x: spec.x, y: spec.y }}
                  cursor={spec.cursor}
                  onPointerDown={onBeginArtboardDrag(spec.mode ?? 'resize', {
                    directionX: spec.directionX,
                    directionY: spec.directionY,
                  })}
                  title={spec.type === 'center' ? 'Move artboard' : 'Artboard handle'}
                />
              ))}
            </>
          )}

          {/* Gradient Direction Handles - Show when shape with gradient fill is selected */}
          {selectedObject && selectedObject.fillType === 'gradient' && (() => {
            // Calculate screen positions for gradient handles
            const startX = selectedObject.x + (selectedObject.gradientStart?.x ?? 0) * selectedObject.width
            const startY = selectedObject.y + (selectedObject.gradientStart?.y ?? 0.5) * selectedObject.height
            const endX = selectedObject.x + (selectedObject.gradientEnd?.x ?? 1) * selectedObject.width
            const endY = selectedObject.y + (selectedObject.gradientEnd?.y ?? 0.5) * selectedObject.height

            const startScreen = worldToScreen(startX, startY)
            const endScreen = worldToScreen(endX, endY)

            const handleSize = 14
            const startColor = selectedObject.gradientStartColor || selectedObject.color || '#000000'
            const endColor = selectedObject.gradientEndColor || '#ffffff'

            return (
              <>
                {/* Gradient line */}
                <svg
                  className="absolute pointer-events-none"
                  style={{
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'visible',
                  }}
                >
                  <line
                    x1={startScreen.x}
                    y1={startScreen.y}
                    x2={endScreen.x}
                    y2={endScreen.y}
                    stroke="white"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                  <line
                    x1={startScreen.x}
                    y1={startScreen.y}
                    x2={endScreen.x}
                    y2={endScreen.y}
                    stroke="#3b82f6"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    strokeDashoffset={4}
                  />
                </svg>

                {/* Start handle */}
                <div
                  className="absolute cursor-move border-2 border-white rounded-full"
                  style={{
                    width: handleSize,
                    height: handleSize,
                    left: startScreen.x - handleSize / 2,
                    top: startScreen.y - handleSize / 2,
                    backgroundColor: startColor,
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    onGradientHandleDrag?.('start', e)
                  }}
                  title="Gradient start"
                />

                {/* End handle */}
                <div
                  className="absolute cursor-move border-2 border-white rounded-full"
                  style={{
                    width: handleSize,
                    height: handleSize,
                    left: endScreen.x - handleSize / 2,
                    top: endScreen.y - handleSize / 2,
                    backgroundColor: endColor,
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    onGradientHandleDrag?.('end', e)
                  }}
                  title="Gradient end"
                />
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

export default CanvasArea
