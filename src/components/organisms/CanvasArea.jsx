import { useMemo } from 'react'
import { Stage, Layer as KonvaLayer, Rect, Circle, RegularPolygon, Star, Line, Text as KonvaText, Transformer } from 'react-konva'
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
  selectedObjectId,
  activeTool,
  stageCursor,
  stageRef,
  transformerRef,
  nodeRefs,
  dragDraft,
  layoutSettings,
  canvasBackground,
  onStagePointerDown,
  onStagePointerMove,
  onStagePointerUp,
  onArtboardBackgroundClick,
  onCanvasSelection,
  onObjectDragStart,
  onObjectDragEnd,
  onObjectTransformEnd,
  onBeginArtboardDrag,
  renderObject,
  renderDraftGrid
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
        <div className="relative border border-zinc-800 shadow-inner flex-1 overflow-hidden" style={{ backgroundColor: canvasBackground }}>
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
              {layers.flatMap((layer) => {
                const frameBackground = (
                  <Rect
                    key={`frame-bg-${layer.id}`}
                    x={layer.x}
                    y={layer.y}
                    width={layer.width}
                    height={layer.height}
                    fill={layer.background ?? 'rgba(255, 255, 255, 0.02)'}
                    listening={activeTool === 'select'}
                    stroke="#3f3f46"
                    strokeWidth={0.5}
                    onPointerDown={(e) => onArtboardBackgroundClick(e, layer.id)}
                  />
                )
                const shapes = layer.visible ? layer.objects.filter((obj) => obj.visible).map((obj) => renderObject(layer.id, obj)) : []
                return [frameBackground, ...shapes]
              })}

              {/* Render shapes on infinite canvas (no frame) */}
              {infiniteCanvasShapes.filter(s => s.visible).map(shape => renderObject(null, shape))}

              {/* Render grid overlay */}
              {renderDraftGrid()}

              <DraftPreview draft={dragDraft} />
              <Transformer ref={transformerRef} rotateEnabled />
            </KonvaLayer>
          </Stage>

          {/* Only show artboard border and handles when a frame is selected */}
          {layers.length > 0 && selectedLayer && (
            <>

              {/* Artboard Frame Border */}
              <div
                className="absolute border border-blue-500 shadow-lg pointer-events-none"
                style={{
                  width: canvasSize.width * zoomLevel,
                  height: canvasSize.height * zoomLevel,
                  top: artboardPosition.y * zoomLevel + stagePosition.y,
                  left: artboardPosition.x * zoomLevel + stagePosition.x,
                  boxShadow: '0 0 0 1px rgba(59,130,246,0.6)',
                }}
              />

          {/* Canvas Size Label */}
          <div
            className="absolute bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full shadow"
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
        </div>
      </div>
    </div>
  )
}

export default CanvasArea
