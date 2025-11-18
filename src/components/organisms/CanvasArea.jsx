import { useMemo } from 'react'
import { Stage, Layer as KonvaLayer, Rect, Circle, RegularPolygon, Star, Line, Text as KonvaText, Transformer } from 'react-konva'
import CanvasHandle from '../molecules/CanvasHandle'
import { RULER_STEP } from '../../constants/editor'

const CanvasArea = ({
  canvasSize,
  artboardPosition,
  zoomLevel,
  stagePosition,
  selectedLayer,
  layers,
  selectedObjectId,
  stageCursor,
  stageRef,
  transformerRef,
  nodeRefs,
  dragDraft,
  layoutSettings,
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
  renderDraft,
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

  const left = 16 + artboardPosition.x
  const top = 16 + artboardPosition.y
  const right = left + canvasSize.width
  const bottom = top + canvasSize.height
  const centerX = left + canvasSize.width / 2
  const centerY = top + canvasSize.height / 2

  const handleSpecs = [
    { id: 'corner-nw', x: left, y: top, cursor: 'nwse-resize', directionX: 'start', directionY: 'start', type: 'corner' },
    { id: 'corner-ne', x: right, y: top, cursor: 'nesw-resize', directionX: 'end', directionY: 'start', type: 'corner' },
    { id: 'corner-sw', x: left, y: bottom, cursor: 'nesw-resize', directionX: 'start', directionY: 'end', type: 'corner' },
    { id: 'corner-se', x: right, y: bottom, cursor: 'nwse-resize', directionX: 'end', directionY: 'end', type: 'corner' },
    { id: 'edge-top', x: centerX, y: top, cursor: 'ns-resize', directionX: 'center', directionY: 'start', type: 'edge' },
    { id: 'edge-bottom', x: centerX, y: bottom, cursor: 'ns-resize', directionX: 'center', directionY: 'end', type: 'edge' },
    { id: 'edge-left', x: left, y: centerY, cursor: 'ew-resize', directionX: 'start', directionY: 'center', type: 'edge' },
    { id: 'edge-right', x: right, y: centerY, cursor: 'ew-resize', directionX: 'end', directionY: 'center', type: 'edge' },
    { id: 'center', x: centerX, y: centerY, cursor: 'move', mode: 'move', type: 'center' },
  ]

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 relative min-h-0">
      <div className="flex-1 bg-zinc-950 flex overflow-hidden min-h-0 h-full">
        <div className="relative bg-zinc-900/60 border border-zinc-800 shadow-inner flex-1 overflow-hidden">
          {/* Horizontal Ruler */}
          <div className="absolute left-[16px] right-0 top-0 h-4 bg-zinc-800 border-b border-zinc-700 text-[9px] text-zinc-400 select-none overflow-hidden">
            <div
              className="flex relative"
              style={{
                width: canvasSize.width,
                transform: `translateX(${artboardPosition.x}px)`,
              }}
            >
              {horizontalMarks.map((mark, index) => {
                const width = index === horizontalMarks.length - 1 ? 0 : Math.min(RULER_STEP, canvasSize.width - mark)
                return (
                  <div key={`hr-${mark}`} className="relative" style={{ width }}>
                    <span className="absolute left-0 bottom-0 translate-y-[2px]">
                      {Math.round(mark + artboardPosition.x)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Vertical Ruler */}
          <div className="absolute top-[16px] bottom-0 left-0 w-4 bg-zinc-800 border-r border-zinc-700 text-[9px] text-zinc-400 select-none overflow-hidden">
            <div
              className="flex flex-col relative"
              style={{
                height: canvasSize.height,
                transform: `translateY(${artboardPosition.y}px)`,
              }}
            >
              {verticalMarks.map((mark, index) => {
                const height = index === verticalMarks.length - 1 ? 0 : Math.min(RULER_STEP, canvasSize.height - mark)
                return (
                  <div key={`vr-${mark}`} className="relative" style={{ height }}>
                    <span className="absolute top-0 left-1">{Math.round(mark + artboardPosition.y)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Position Label */}
          <div className="absolute left-[16px] top-0 text-[10px] text-zinc-400 flex items-center gap-2 select-none">
            <span>X: {Math.round(artboardPosition.x)}px</span>
            <span>Y: {Math.round(artboardPosition.y)}px</span>
          </div>

          {/* Artboard Frame */}
          <div
            className="absolute border border-blue-500 shadow-lg"
            style={{
              width: canvasSize.width,
              height: canvasSize.height,
              top: 16 + artboardPosition.y,
              left: 16 + artboardPosition.x,
              boxShadow: '0 0 0 1px rgba(59,130,246,0.6)',
            }}
          >
            {/* Konva Stage */}
            <Stage
              width={canvasSize.width}
              height={canvasSize.height}
              ref={stageRef}
              className="bg-zinc-900"
              style={{ cursor: stageCursor }}
              onMouseDown={onStagePointerDown}
              onMouseMove={onStagePointerMove}
              onMouseUp={onStagePointerUp}
              onTouchStart={onStagePointerDown}
              onTouchMove={onStagePointerMove}
              onTouchEnd={onStagePointerUp}
            >
              <KonvaLayer>
                <Rect
                  x={0}
                  y={0}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  fill={selectedLayer?.background ?? '#18181b'}
                  onPointerDown={onArtboardBackgroundClick}
                />
                {layoutSettings.showGrid && renderDraftGrid()}
                {layers.flatMap((layer) =>
                  layer.visible ? layer.objects.filter((obj) => obj.visible).map((obj) => renderObject(layer.id, obj)) : []
                )}
                {renderDraft()}
                <Transformer ref={transformerRef} rotateEnabled />
              </KonvaLayer>
            </Stage>
          </div>

          {/* Canvas Size Label */}
          <div
            className="absolute bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full shadow"
            style={{
              top: 16 + artboardPosition.y + canvasSize.height + 10,
              left: 16 + artboardPosition.x + canvasSize.width / 2 - 30,
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
        </div>
      </div>
    </div>
  )
}

export default CanvasArea
