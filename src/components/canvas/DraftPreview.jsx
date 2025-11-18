import { Rect, Circle, RegularPolygon, Star } from 'react-konva'

/**
 * DraftPreview - Renders the preview outline while dragging to create frames or shapes
 *
 * This component handles the blue preview outline shown during:
 * - Frame creation (F tool)
 * - Shape creation (Rectangle, Circle, Star, etc.)
 *
 * The preview updates in real-time as the user drags, showing the final size/position
 * before the shape is committed.
 */
const DraftPreview = ({ draft }) => {
  if (!draft) return null

  // Handle frame draft
  if (draft.kind === 'frame') {
    const { start, current, shift } = draft
    let width = Math.abs(current.x - start.x)
    let height = Math.abs(current.y - start.y)

    // Shift key constrains to square
    if (shift) {
      const size = Math.max(width, height)
      width = size
      height = size
    }

    const x = Math.min(start.x, current.x)
    const y = Math.min(start.y, current.y)

    return (
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="transparent"
        stroke="#38bdf8"
        strokeWidth={2}
      />
    )
  }

  // Handle shape draft
  if (draft.kind !== 'shape') return null

  const { start, current, shift, shapeType } = draft
  let width = Math.abs(current.x - start.x)
  let height = Math.abs(current.y - start.y)

  // Shift key constrains to square
  if (shift) {
    const size = Math.max(width, height)
    width = size
    height = size
  }

  const x = Math.min(start.x, current.x)
  const y = Math.min(start.y, current.y)

  const draftStyle = {
    fill: 'rgba(14,165,233,0.2)',
    stroke: '#38bdf8',
    strokeWidth: 2
  }

  // Render actual shape preview based on shapeType
  if (shapeType === 'rect') {
    return <Rect x={x} y={y} width={width} height={height} {...draftStyle} />
  }

  if (shapeType === 'circle') {
    const radius = Math.min(width, height) / 2
    return <Circle x={x + width / 2} y={y + height / 2} radius={radius} {...draftStyle} />
  }

  if (shapeType === 'triangle') {
    const radius = Math.min(width, height) / 2
    return <RegularPolygon x={x + width / 2} y={y + height / 2} sides={3} radius={radius} {...draftStyle} />
  }

  if (shapeType === 'star') {
    const outer = Math.min(width, height) / 2
    return <Star x={x + width / 2} y={y + height / 2} numPoints={5} innerRadius={outer / 2.5} outerRadius={outer} {...draftStyle} />
  }

  if (shapeType === 'polygon') {
    const radius = Math.min(width, height) / 2
    return <RegularPolygon x={x + width / 2} y={y + height / 2} sides={6} radius={radius} {...draftStyle} />
  }

  // Fallback to rectangle
  return <Rect x={x} y={y} width={width} height={height} {...draftStyle} />
}

export default DraftPreview
