import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Circle,
  Line,
  Rect,
  RegularPolygon,
  Star,
  Text as KonvaText,
} from 'react-konva'

import TopNav from '../components/organisms/TopNav'
import Toolbar from '../components/organisms/Toolbar'
import LayersSidebar from '../components/organisms/LayersSidebar'
import Inspector from '../components/organisms/Inspector'
import CanvasArea from '../components/organisms/CanvasArea'
import { TOOL_SUBMENUS, DEFAULT_CANVAS, BASE_COLORS } from '../constants/editor'
import { hexToHsb, hsbToHex } from '../utils/colors'
import { clamp } from '../utils/geometry'

const dropdownDefaults = { toolId: null, left: 0 }

const randomFromPalette = (index) => BASE_COLORS[index % BASE_COLORS.length]

const createFrameShape = (index, overrides = {}) => ({
  id: overrides.id ?? `frame-${index}`,
  type: 'frame',
  name: `Canvas ${index}`,
  x: overrides.x ?? 0,
  y: overrides.y ?? 0,
  width: overrides.width ?? DEFAULT_CANVAS.width,
  height: overrides.height ?? DEFAULT_CANVAS.height,
  rotation: 0,
  background: 'rgba(255, 255, 255, 0.02)', // Very subtle fill so frames are clickable
  visible: true,
  children: [],
  frameId: null,
  parentId: null,
  ...overrides,
})

const KolEditor = () => {
  // Flat shapes map - ALL shapes (including frames) in one place
  const [shapes, setShapes] = useState({})
  const [selectedShapeId, setSelectedShapeId] = useState(null)
  const [selectedShapeIds, setSelectedShapeIds] = useState([]) // Multi-select support
  const [expandedShapes, setExpandedShapes] = useState(() => new Set())
  const [canvasBackground, setCanvasBackground] = useState('#18181b') // Infinite canvas background
  const [zoomLevel, setZoomLevel] = useState(1)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })
  const [activeTool, setActiveTool] = useState('select')
  const [dropdownState, setDropdownState] = useState(dropdownDefaults)
  const [canvasDialog, setCanvasDialog] = useState({ open: false, width: DEFAULT_CANVAS.width, height: DEFAULT_CANVAS.height })
  const [pendingInsert, setPendingInsert] = useState(null)
  const [dragDraft, setDragDraft] = useState(null)
  const [isAltPressed, setIsAltPressed] = useState(false)
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const [inspectorFilter, setInspectorFilter] = useState(null)
  const [layoutSettings, setLayoutSettings] = useState({ columns: 1, rows: 1, gutter: 0, showGrid: false })
  const [toolSelections, setToolSelections] = useState({})

  const stageRef = useRef(null)
  const transformerRef = useRef(null)
  const nodeRefs = useRef(new Map())
  const nextFrameIndexRef = useRef(1)
  const nextShapeIdRef = useRef(1)
  const colorIndexRef = useRef(0)
  const cloneDragRef = useRef(null)
  const undoStackRef = useRef([])
  const redoStackRef = useRef([])

  // Derive current selections from shapes map
  const selectedShape = useMemo(() => shapes[selectedShapeId] ?? null, [shapes, selectedShapeId])

  // Get selected frame (either the shape itself if it's a frame, or its parent frame)
  const selectedFrame = useMemo(() => {
    if (!selectedShape) return null
    if (selectedShape.type === 'frame') return selectedShape
    return shapes[selectedShape.frameId] ?? null
  }, [shapes, selectedShape])

  // Get selected object (non-frame shape)
  const selectedObject = useMemo(() => {
    return selectedShape?.type !== 'frame' ? selectedShape : null
  }, [selectedShape])

  // Derive canvas properties from selected frame (NO separate state!)
  const canvasSize = useMemo(() => {
    if (!selectedFrame) return DEFAULT_CANVAS
    return { width: selectedFrame.width, height: selectedFrame.height }
  }, [selectedFrame])

  const artboardPosition = useMemo(() => {
    if (!selectedFrame) return { x: 0, y: 0 }
    return { x: selectedFrame.x, y: selectedFrame.y }
  }, [selectedFrame])

  // Get all frames (for sidebar) with populated children
  const frames = useMemo(() => {
    return Object.values(shapes)
      .filter(shape => shape.type === 'frame')
      .map(frame => ({
        ...frame,
        objects: frame.children.map(id => shapes[id]).filter(Boolean)
      }))
  }, [shapes])

  // Get shapes on infinite canvas (not in any frame)
  const infiniteCanvasShapes = useMemo(() => {
    return Object.values(shapes).filter(shape => shape.type !== 'frame' && !shape.frameId)
  }, [shapes])

  // Get visible shapes for rendering (children of selected frame)
  const visibleShapes = useMemo(() => {
    if (!selectedFrame) return []
    return selectedFrame.children.map(id => shapes[id]).filter(Boolean)
  }, [shapes, selectedFrame])

  const pushUndoState = (snapshot) => {
    undoStackRef.current.push(JSON.stringify(shapes))
    redoStackRef.current = []
    setShapes(snapshot)
  }

  const handleUndo = () => {
    const last = undoStackRef.current.pop()
    if (!last) return
    redoStackRef.current.push(JSON.stringify(shapes))
    setShapes(JSON.parse(last))
  }

  const handleRedo = () => {
    const next = redoStackRef.current.pop()
    if (!next) return
    undoStackRef.current.push(JSON.stringify(shapes))
    setShapes(JSON.parse(next))
  }

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    stage.scale({ x: zoomLevel, y: zoomLevel })
    stage.position(stagePosition)
    stage.batchDraw()
  }, [zoomLevel, stagePosition])

  // NO SYNC NEEDED! Canvas properties are derived from selectedFrame

  useEffect(() => {
    const transformer = transformerRef.current
    if (!transformer) return

    // Handle multi-select
    if (selectedShapeIds.length > 0) {
      const nodes = selectedShapeIds
        .map(id => nodeRefs.current.get(id))
        .filter(node => node && node.getStage())
      if (nodes.length > 0) {
        transformer.nodes(nodes)
        transformer.getLayer()?.batchDraw()
      } else {
        transformer.nodes([])
        transformer.getLayer()?.batchDraw()
      }
      return
    }

    // Handle single select
    const node = selectedObject ? nodeRefs.current.get(selectedShapeId) : null
    if (node && node.getStage()) {
      transformer.nodes([node])
      transformer.getLayer()?.batchDraw()
    } else {
      transformer.nodes([])
      transformer.getLayer()?.batchDraw()
    }
  }, [selectedShapeId, selectedShapeIds, selectedObject])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownState.toolId && !event.target.closest('.toolbar-container')) setDropdownState(dropdownDefaults)
      if (filterMenuOpen && !event.target.closest('.toolbar-container')) setFilterMenuOpen(false)
    }
    document.addEventListener('pointerdown', handleOutsideClick)
    return () => document.removeEventListener('pointerdown', handleOutsideClick)
  }, [dropdownState.toolId, filterMenuOpen])

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore if typing in input fields
      if (['INPUT', 'TEXTAREA'].includes(event.target.tagName) || event.target.isContentEditable) return

      if (event.key === 'Alt') setIsAltPressed(true)

      // Cmd+A / Ctrl+A - Select all
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        if (selectedFrame) {
          // Select all objects in the current frame
          const frameChildren = selectedFrame.children.filter(id => shapes[id]?.visible !== false)
          if (frameChildren.length > 0) {
            setSelectedShapeIds(frameChildren)
            setSelectedShapeId(null)
          }
        } else {
          // Select all shapes on infinite canvas
          const infiniteShapes = Object.values(shapes)
            .filter(s => s.type !== 'frame' && !s.frameId && s.visible !== false)
            .map(s => s.id)
          if (infiniteShapes.length > 0) {
            setSelectedShapeIds(infiniteShapes)
            setSelectedShapeId(null)
          }
        }
        return
      }

      if ((event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === 'z') {
        handleUndo()
        event.preventDefault()
        return
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'z') {
        handleRedo()
        event.preventDefault()
        return
      }

      // Handle delete keys
      if (event.key === 'Backspace' || event.key === 'Delete') {
        // Delete multi-selected objects
        if (selectedShapeIds.length > 0) {
          const newShapes = { ...shapes }
          const framesToUpdate = new Set()

          selectedShapeIds.forEach(shapeId => {
            const shape = shapes[shapeId]
            if (shape && shape.type !== 'frame') {
              delete newShapes[shapeId]
              if (shape.frameId) {
                framesToUpdate.add(shape.frameId)
              }
            }
          })

          // Update parent frames to remove deleted children
          framesToUpdate.forEach(frameId => {
            const frame = shapes[frameId]
            if (frame) {
              newShapes[frameId] = {
                ...frame,
                children: frame.children.filter(id => !selectedShapeIds.includes(id))
              }
            }
          })

          pushUndoState(newShapes)
          setSelectedShapeIds([])
          event.preventDefault()
          return
        }

        // Delete single selected object
        if (selectedObject) {
          handleDeleteShape(selectedObject.frameId, selectedObject.id)
          event.preventDefault()
        } else if (selectedFrame) {
          handleDeleteFrame(selectedFrame.id)
          event.preventDefault()
        }
        return
      }

      if (event.key === 'Escape') {
        setPendingInsert(null)
        setDragDraft(null)
        setSelectedShapeId(null)
        setSelectedShapeIds([])
      }
      if (event.key === 'v' || event.key === 'V') {
        setActiveTool('select')
        setDropdownState(dropdownDefaults)
        setPendingInsert(null)
      }
      if (event.key === 'r' || event.key === 'R') {
        handleShapeInsert('rect')
        setActiveTool('shape')
      }
      if (event.key === 'f' || event.key === 'F') {
        setActiveTool('frame')
        setDropdownState(dropdownDefaults)
        setPendingInsert(null)
      }
    }
    const handleKeyUp = (event) => {
      if (event.key === 'Alt') setIsAltPressed(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [selectedShapeId, selectedShapeIds, selectedObject, selectedFrame, shapes])

  const ensureFrameExpanded = (frameId) => {
    setExpandedShapes((prev) => {
      if (prev.has(frameId)) return prev
      const next = new Set(prev)
      next.add(frameId)
      return next
    })
  }

  const getDefaultShapePosition = () => ({
    x: canvasSize.width / 2 - 100,
    y: canvasSize.height / 2 - 80,
    width: 200,
    height: 160,
    rotation: 0
  })

  const createShape = (type, overrides = {}) => {
    const id = `shape-${nextShapeIdRef.current++}`
    const color = overrides.color ?? randomFromPalette(colorIndexRef.current++)
    const position = overrides.position ?? getDefaultShapePosition()

    return {
      id,
      type,
      name: overrides.name ?? type.charAt(0).toUpperCase() + type.slice(1),
      x: position.x,
      y: position.y,
      width: position.width,
      height: position.height,
      rotation: position.rotation ?? 0,
      visible: true,
      opacity: 1,
      color,
      children: [],
      frameId: overrides.frameId ?? null,
      parentId: overrides.parentId ?? null,
      // Text-specific
      text: overrides.text ?? 'JetBrains Mono',
      fontFamily: overrides.fontFamily ?? 'JetBrains Mono, monospace',
      fontSize: overrides.fontSize ?? 32,
      fontStyle: overrides.fontStyle ?? 'normal',
      ...overrides,
    }
  }

  const ensureFrameForShape = () => {
    // If we have a selected frame, use it
    if (selectedFrame) return selectedFrame.id

    // Otherwise create a new frame
    const index = nextFrameIndexRef.current++
    const frameId = `frame-${index}`
    const newFrame = createFrameShape(index, { id: frameId })

    pushUndoState({
      ...shapes,
      [frameId]: newFrame
    })
    setSelectedShapeId(frameId)
    ensureFrameExpanded(frameId)
    return frameId
  }

  const addShapeToFrame = (frameId, shape) => {
    // If no frameId, add shape directly to infinite canvas
    if (!frameId) {
      pushUndoState({
        ...shapes,
        [shape.id]: {
          ...shape,
          frameId: null,
          parentId: null
        }
      })
      setSelectedShapeId(shape.id)
      return
    }

    const frame = shapes[frameId]
    if (!frame) return

    pushUndoState({
      ...shapes,
      [frameId]: {
        ...frame,
        children: [...frame.children, shape.id]
      },
      [shape.id]: {
        ...shape,
        frameId,
        parentId: frameId
      }
    })
    setSelectedShapeId(shape.id)
    ensureFrameExpanded(frameId)
  }

  const updateShape = (shapeId, updates) => {
    const shape = shapes[shapeId]
    if (!shape) return

    pushUndoState({
      ...shapes,
      [shapeId]: {
        ...shape,
        ...updates
      }
    })
  }

  const updateShapePosition = (shapeId, positionUpdates) => {
    const shape = shapes[shapeId]
    if (!shape) return

    pushUndoState({
      ...shapes,
      [shapeId]: {
        ...shape,
        ...positionUpdates
      }
    })
  }

  const handleAddFrame = () => {
    const index = nextFrameIndexRef.current++
    const frameId = `frame-${index}`

    // Center the canvas in viewport or offset from selected frame
    let x, y
    if (selectedFrame) {
      // Offset from current frame
      x = Math.max(0, artboardPosition.x + 40)
      y = Math.max(0, artboardPosition.y + 40)
    } else {
      // Center in viewport
      const stage = stageRef.current
      if (stage) {
        const stageWidth = stage.width()
        const stageHeight = stage.height()
        x = (stageWidth / 2 - DEFAULT_CANVAS.width / 2 - stagePosition.x) / zoomLevel
        y = (stageHeight / 2 - DEFAULT_CANVAS.height / 2 - stagePosition.y) / zoomLevel
      } else {
        x = 100
        y = 100
      }
    }

    const newFrame = createFrameShape(index, {
      id: frameId,
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: DEFAULT_CANVAS.width,
      height: DEFAULT_CANVAS.height,
    })

    pushUndoState({
      ...shapes,
      [frameId]: newFrame
    })
    setSelectedShapeId(frameId)
    ensureFrameExpanded(frameId)
  }

  const handleDeleteFrame = (frameId) => {
    const frame = shapes[frameId]
    if (!frame || frame.type !== 'frame') return

    // Remove frame and all its children
    const newShapes = { ...shapes }
    delete newShapes[frameId]
    frame.children.forEach(childId => {
      delete newShapes[childId]
    })

    pushUndoState(newShapes)

    // Select another frame if this was selected
    if (selectedShapeId === frameId) {
      const remainingFrames = Object.values(newShapes).filter(s => s.type === 'frame')
      setSelectedShapeId(remainingFrames[0]?.id ?? null)
    }

    setExpandedShapes((prev) => {
      const copy = new Set(prev)
      copy.delete(frameId)
      return copy
    })
  }

  const toggleShapeVisibility = (shapeId) => {
    const shape = shapes[shapeId]
    if (!shape) return

    pushUndoState({
      ...shapes,
      [shapeId]: {
        ...shape,
        visible: !shape.visible
      }
    })
  }

  const handleDeleteShape = (frameId, shapeId) => {
    const shape = shapes[shapeId]
    if (!shape || shape.type === 'frame') return

    const newShapes = { ...shapes }
    delete newShapes[shapeId]

    // If shape is in a frame, remove from parent's children array
    if (shape.frameId) {
      const parentFrame = shapes[shape.frameId]
      if (parentFrame) {
        newShapes[shape.frameId] = {
          ...parentFrame,
          children: parentFrame.children.filter(id => id !== shapeId)
        }
      }
    }

    pushUndoState(newShapes)

    if (selectedShapeId === shapeId) {
      setSelectedShapeId(shape.frameId || null)
    }
  }

  const moveFrame = (frameId, direction) => {
    // Frame ordering - get all frames as array
    const framesList = Object.values(shapes).filter(s => s.type === 'frame')
    const index = framesList.findIndex(f => f.id === frameId)
    if (index < 0) return

    const target = index + direction
    if (target < 0 || target >= framesList.length) return

    // For now, this is a no-op since we don't have frame ordering in flat map
    // Could add a `order` property to frames if needed
  }

  const handleToolbarButton = (toolId) => {
    // Check if this is a subtool selection (e.g., 'shape-rect', 'zoom-in', etc.)
    for (const [parentTool, subtools] of Object.entries(TOOL_SUBMENUS)) {
      if (subtools.some(sub => sub.id === toolId)) {
        setDropdownState(dropdownDefaults) // Close dropdown immediately
        handleToolOption(parentTool, toolId)
        return
      }
    }

    setActiveTool(toolId)
    if (TOOL_SUBMENUS[toolId]) {
      setDropdownState(dropdownDefaults)
      return
    }
    setDropdownState(dropdownDefaults)
    if (toolId === 'flipX') applyFlip('x')
    if (toolId === 'flipY') applyFlip('y')
    if (toolId === 'rotateLeft') applyRotation(-90)
    if (toolId === 'rotateRight') applyRotation(90)
  }

  const toggleDropdown = (toolId, toolbarButtonRefs, toolbarRef) => {
    setDropdownState((prev) => {
      if (prev.toolId === toolId) return dropdownDefaults
      const button = toolbarButtonRefs.current.get(toolId)
      const container = toolbarRef.current
      if (!button || !container) return { toolId, left: 0 }
      const buttonRect = button.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const center = buttonRect.left - containerRect.left + buttonRect.width / 2
      const clampedLeft = clamp(center, 16, containerRect.width - 16)
      return { toolId, left: clampedLeft }
    })
  }

  const handleZoomAtPointer = (direction) => {
    const stage = stageRef.current
    if (!stage) return
    const pointer = stage.getPointerPosition() ?? { x: canvasSize.width / 2, y: canvasSize.height / 2 }
    const scaleFactor = direction === 'in' ? 1.1 : 0.9
    const newScale = clamp(+(zoomLevel * scaleFactor).toFixed(2), 0.25, 4)
    const worldPos = {
      x: (pointer.x - stagePosition.x) / zoomLevel,
      y: (pointer.y - stagePosition.y) / zoomLevel,
    }
    const newPos = {
      x: pointer.x - worldPos.x * newScale,
      y: pointer.y - worldPos.y * newScale,
    }
    setZoomLevel(newScale)
    setStagePosition(newPos)
  }

  const handleStagePointerDown = (e) => {
    const stage = e.target.getStage()
    const pointer = stage.getPointerPosition()

    if (pendingInsert?.type === 'shape') {
      // Allow shapes on infinite canvas (frameId = null) or get selected frame
      const frameId = selectedFrame?.id ?? null
      setDragDraft({ frameId, kind: 'shape', shapeType: pendingInsert.shapeType, start: pointer, current: pointer, shift: e.evt?.shiftKey })
      return
    }

    if (activeTool === 'frame') {
      console.log('Frame tool active, starting drag at', pointer)
      // Start dragging to create a new frame
      setDragDraft({ kind: 'frame', start: pointer, current: pointer, shift: e.evt?.shiftKey })
      return
    }

    if (activeTool === 'zoom') {
      handleZoomAtPointer(e.evt?.altKey ? 'out' : 'in')
      return
    }

    if (activeTool === 'select' && e.target === stage) {
      // Clicked on empty stage - deselect everything
      setSelectedShapeId(null)
      setSelectedShapeIds([])
    }
  }

  const handleArtboardBackgroundClick = (e, frameId) => {
    // Only handle this for select tool - other tools need to pass through to stage
    if (activeTool !== 'select') {
      // Don't stop propagation - let stage handle it (for drawing tools, frame tool, etc.)
      return
    }

    // If holding Cmd/Ctrl, "click through" the frame background
    if (e.evt?.metaKey || e.evt?.ctrlKey) {
      // Don't stop propagation - let it bubble to shapes below
      return
    }

    e.cancelBubble = true
    // Clicked on frame background - select the frame itself
    setSelectedShapeId(frameId)
    setSelectedShapeIds([])
  }

  const handleStagePointerMove = (e) => {
    if (dragDraft?.kind === 'shape' || dragDraft?.kind === 'frame') {
      const pointer = e.target.getStage().getPointerPosition()
      setDragDraft((prev) => (prev ? { ...prev, current: pointer, shift: e.evt?.shiftKey } : prev))
    }
  }

  const finalizeShapeDraft = () => {
    if (!dragDraft) return
    const { start, current, shift, shapeType, frameId } = dragDraft
    const width = Math.abs(current.x - start.x)
    const height = Math.abs(current.y - start.y)
    if (width < 2 && height < 2) {
      setDragDraft(null)
      return
    }
    let finalWidth = width
    let finalHeight = height
    if (shift) {
      const size = Math.max(width, height)
      finalWidth = size
      finalHeight = size
    }
    const position = {
      x: Math.min(start.x, current.x),
      y: Math.min(start.y, current.y),
      width: finalWidth,
      height: finalHeight,
      rotation: 0,
    }
    const shape = createShape(shapeType, { position, frameId })
    addShapeToFrame(frameId, shape)
    setDragDraft(null)
  }

  const handleStagePointerUp = () => {
    if (dragDraft?.kind === 'shape') finalizeShapeDraft()
    if (dragDraft?.kind === 'frame') finalizeFrameDraft()
  }

  const finalizeFrameDraft = () => {
    if (!dragDraft) return
    const { start, current, shift } = dragDraft
    const width = Math.abs(current.x - start.x)
    const height = Math.abs(current.y - start.y)
    if (width < 10 && height < 10) {
      setDragDraft(null)
      return
    }
    let finalWidth = width
    let finalHeight = height
    if (shift) {
      const size = Math.max(width, height)
      finalWidth = size
      finalHeight = size
    }

    const index = nextFrameIndexRef.current++
    const frameId = `frame-${index}`
    const newFrame = createFrameShape(index, {
      id: frameId,
      x: Math.min(start.x, current.x),
      y: Math.min(start.y, current.y),
      width: finalWidth,
      height: finalHeight,
    })

    pushUndoState({
      ...shapes,
      [frameId]: newFrame
    })
    setSelectedShapeId(frameId)
    ensureFrameExpanded(frameId)
    setDragDraft(null)
    setActiveTool('select') // Return to select tool after creating frame
  }

  const normalizePosition = (type, width, height, node) => {
    if (['rect', 'text'].includes(type)) return { x: node.x(), y: node.y() }
    return { x: node.x() - width / 2, y: node.y() - height / 2 }
  }

  const handleObjectDragStart = (frameId, shape, event) => {
    if (event.evt?.altKey) {
      event.target.stopDrag()
      const clone = {
        ...shape,
        id: `shape-${nextShapeIdRef.current++}`,
        name: `${shape.name} copy`,
        frameId,
        parentId: frameId
      }
      const frame = shapes[frameId]
      pushUndoState({
        ...shapes,
        [frameId]: {
          ...frame,
          children: [...frame.children, clone.id]
        },
        [clone.id]: clone
      })
      setSelectedShapeId(clone.id)
      ensureFrameExpanded(frameId)
      cloneDragRef.current = clone.id
      requestAnimationFrame(() => {
        const clonedNode = nodeRefs.current.get(clone.id)
        if (clonedNode) clonedNode.startDrag()
      })
    }
  }

  const handleObjectDragEnd = (frameId, shapeId, type, node) => {
    if (cloneDragRef.current && cloneDragRef.current === shapeId) cloneDragRef.current = null
    const shape = shapes[shapeId]
    if (!shape) return

    // If multiple shapes are selected and this is one of them, move all of them
    if (selectedShapeIds.length > 1 && selectedShapeIds.includes(shapeId)) {
      const dx = node.x() - shape.x
      const dy = node.y() - shape.y

      const newShapes = { ...shapes }
      selectedShapeIds.forEach(id => {
        const s = shapes[id]
        if (s && s.type !== 'frame') {
          newShapes[id] = {
            ...s,
            x: s.x + dx,
            y: s.y + dy
          }
        }
      })

      pushUndoState(newShapes)
      return
    }

    // Single shape drag
    const position = normalizePosition(type, shape.width, shape.height, node)
    updateShapePosition(shapeId, position)
  }

  const handleObjectTransformEnd = (frameId, shapeId, type, node) => {
    const width = Math.max(10, node.width() * node.scaleX())
    const height = Math.max(10, node.height() * node.scaleY())
    node.scaleX(1)
    node.scaleY(1)
    const position = normalizePosition(type, width, height, node)
    updateShapePosition(shapeId, {
      ...position,
      width,
      height,
      rotation: node.rotation(),
    })
  }

  const handlePositionInput = (prop, value) => {
    if (!selectedObject) return
    const numeric = prop === 'rotation' ? Number(value) : Math.max(0, Number(value))
    updateShapePosition(selectedObject.id, { [prop]: numeric })
  }

  const handleColorChange = (hex) => {
    if (!selectedObject) return
    updateShape(selectedObject.id, { color: hex })
  }

  const handleOpacityChange = (percent) => {
    if (!selectedObject) return
    const opacity = clamp(Number(percent), 0, 100) / 100
    updateShape(selectedObject.id, { opacity })
  }

  const applyCropRatio = (ratio) => {
    if (!selectedObject) return
    const cx = selectedObject.x + selectedObject.width / 2
    const cy = selectedObject.y + selectedObject.height / 2
    let width = selectedObject.width
    let height = selectedObject.height
    if (ratio !== 'free') {
      width = Math.max(40, selectedObject.height * ratio)
      height = Math.max(40, width / ratio)
    }
    updateShapePosition(selectedObject.id, {
      width,
      height,
      x: cx - width / 2,
      y: cy - height / 2,
    })
  }

  const applyRotation = (delta) => {
    if (!selectedObject) return
    updateShapePosition(selectedObject.id, {
      rotation: selectedObject.rotation + delta,
    })
  }

  const applyFlip = (axis) => {
    if (!selectedObject) return
    if (axis === 'x') {
      updateShapePosition(selectedObject.id, {
        rotation: (360 - selectedObject.rotation) % 360,
      })
    } else {
      updateShapePosition(selectedObject.id, {
        rotation: (180 - selectedObject.rotation) % 360,
      })
    }
  }

  const applyFilter = (optionId) => {
    if (!selectedObject) return
    const hsb = hexToHsb(selectedObject.color)
    if (optionId === 'filter-grayscale') hsb.s = 0
    if (optionId === 'filter-brightness') hsb.b = clamp(hsb.b + 10, 0, 100)
    if (optionId === 'filter-contrast') hsb.s = clamp(hsb.s + 10, 0, 100)
    if (optionId === 'filter-hue') hsb.h = (hsb.h + 25) % 360
    if (optionId === 'filter-dim') hsb.b = clamp(hsb.b - 10, 0, 100)
    const hex = hsbToHex(hsb.h, hsb.s, hsb.b)
    updateShape(selectedObject.id, { color: hex })
    setInspectorFilter({ type: optionId, amount: 50 })
  }

  const handleShapeInsert = (shapeType) => {
    setPendingInsert({ type: 'shape', shapeType })
    setActiveTool('shape')
    setDropdownState(dropdownDefaults)
  }

  const handleDrawOption = (optionId) => {
    if (optionId === 'draw-eraser') {
      if (selectedObject) handleDeleteShape(selectedObject.id)
      return
    }
    const frameId = ensureFrameForShape()
    const position = getDefaultShapePosition()
    const shape =
      optionId === 'draw-line'
        ? createShape('line', {
            name: 'Line',
            position: { ...position, height: 2 },
            meta: { points: [0, 0, 160, 0] },
            frameId
          })
        : createShape('scribble', {
            name: 'Scribble',
            position: { ...position, height: 2 },
            meta: { points: [0, 0, 30, -20, 80, 10, 120, -10, 170, 0] },
            frameId
          })
    addShapeToFrame(frameId, shape)
  }

  const handleTextOption = (optionId) => {
    if (optionId === 'text-add') {
      const frameId = ensureFrameForShape()
      const position = getDefaultShapePosition()
      const shape = createShape('text', {
        position: { ...position, height: 60, width: 240 },
        frameId
      })
      addShapeToFrame(frameId, shape)
      return
    }
    if (!selectedObject || selectedObject.type !== 'text') return
    if (optionId === 'text-fonts') {
      const fonts = ['JetBrains Mono, monospace', 'Space Mono, monospace', 'IBM Plex Mono, monospace']
      const currentIndex = fonts.indexOf(selectedObject.fontFamily)
      const nextFont = fonts[(currentIndex + 1) % fonts.length]
      updateShape(selectedObject.id, { fontFamily: nextFont })
    }
    if (optionId === 'text-styles') {
      updateShape(selectedObject.id, { fontStyle: selectedObject.fontStyle === 'bold' ? 'normal' : 'bold' })
    }
  }

  const handleToolOption = (toolId, optionId) => {
    setToolSelections((prev) => ({ ...prev, [toolId]: optionId }))
    if (toolId === 'zoom') {
      if (optionId === 'zoom-in') handleZoomAtPointer('in')
      if (optionId === 'zoom-out') handleZoomAtPointer('out')
    }
    if (toolId === 'shape') handleShapeInsert(optionId.replace('shape-', ''))
    if (toolId === 'draw') handleDrawOption(optionId)
    if (toolId === 'text') handleTextOption(optionId)
    if (toolId === 'crop') {
      if (optionId === 'crop-free') applyCropRatio('free')
      if (optionId === 'crop-1-1') applyCropRatio(1)
      if (optionId === 'crop-4-3') applyCropRatio(4 / 3)
      if (optionId === 'crop-16-9') applyCropRatio(16 / 9)
    }
  }

  const handleFilterSelect = (optionId) => {
    applyFilter(optionId)
    setFilterMenuOpen(false)
  }

  const handleClearDocument = () => {
    pushUndoState({})
    setSelectedShapeId(null)
    setExpandedShapes(new Set())
    setPendingInsert(null)
    setDragDraft(null)
  }

  const handleCanvasDialogSave = () => {
    if (!selectedFrame) return
    updateShapePosition(selectedFrame.id, {
      width: canvasDialog.width,
      height: canvasDialog.height,
    })
    setCanvasDialog((prev) => ({ ...prev, open: false }))
  }

  const renderObject = (frameId, shape) => {
    const commonProps = {
      ref: (node) => {
        if (node) nodeRefs.current.set(shape.id, node)
        else nodeRefs.current.delete(shape.id)
      },
      rotation: shape.rotation,
      draggable: true,
      opacity: shape.opacity,
      onClick: (e) => handleCanvasSelection(frameId, shape.id, e),
      onTap: (e) => handleCanvasSelection(frameId, shape.id, e),
      onDragStart: (e) => handleObjectDragStart(frameId, shape, e),
      onDragEnd: (e) => handleObjectDragEnd(frameId, shape.id, shape.type, e.target),
      onTransformEnd: (e) => handleObjectTransformEnd(frameId, shape.id, shape.type, e.target),
      onTransform: (e) => e.target.getLayer().batchDraw(),
    }

    if (shape.type === 'rect') {
      return <Rect key={shape.id} {...commonProps} x={shape.x} y={shape.y} width={shape.width} height={shape.height} fill={shape.color} />
    }
    if (shape.type === 'circle') {
      const radius = Math.min(shape.width, shape.height) / 2
      return <Circle key={shape.id} {...commonProps} x={shape.x + shape.width / 2} y={shape.y + shape.height / 2} radius={radius} fill={shape.color} />
    }
    if (shape.type === 'triangle' || shape.type === 'polygon') {
      const sides = shape.type === 'triangle' ? 3 : 6
      const radius = Math.min(shape.width, shape.height) / 2
      return <RegularPolygon key={shape.id} {...commonProps} x={shape.x + shape.width / 2} y={shape.y + shape.height / 2} sides={sides} radius={radius} fill={shape.color} />
    }
    if (shape.type === 'star') {
      const outer = Math.min(shape.width, shape.height) / 2
      return <Star key={shape.id} {...commonProps} x={shape.x + shape.width / 2} y={shape.y + shape.height / 2} numPoints={5} innerRadius={outer / 2.5} outerRadius={outer} fill={shape.color} />
    }
    if (shape.type === 'line' || shape.type === 'scribble') {
      return <Line key={shape.id} {...commonProps} x={shape.x} y={shape.y} points={shape.meta?.points ?? []} stroke={shape.color} strokeWidth={shape.type === 'line' ? 4 : 3} lineCap="round" lineJoin="round" />
    }
    if (shape.type === 'text') {
      return (
        <KonvaText
          key={shape.id}
          {...commonProps}
          text={shape.text}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          fill={shape.color}
          fontSize={shape.fontSize}
          fontFamily={shape.fontFamily}
          fontStyle={shape.fontStyle}
          onDblClick={(e) => {
            const stage = stageRef.current
            const textNode = e.target
            textNode.hide()
            transformerRef.current.nodes([])
            const textarea = document.createElement('textarea')
            const stageBox = stage.container().getBoundingClientRect()
            textarea.value = textNode.text()
            textarea.style.position = 'absolute'
            textarea.style.top = `${stageBox.top + textNode.y()}px`
            textarea.style.left = `${stageBox.left + textNode.x()}px`
            textarea.style.width = `${textNode.width()}px`
            textarea.style.color = '#fff'
            textarea.style.background = 'rgba(24,24,27,0.95)'
            textarea.style.border = '1px solid #3f3f46'
            textarea.style.fontSize = `${textNode.fontSize()}px`
            textarea.style.fontFamily = textNode.fontFamily()
            textarea.style.fontWeight = textNode.fontStyle()
            textarea.style.outline = 'none'
            textarea.style.zIndex = '1000'
            document.body.appendChild(textarea)
            textarea.focus()
            const finish = () => {
              updateShape(shape.id, { text: textarea.value })
              document.body.removeChild(textarea)
              textNode.show()
            }
            textarea.addEventListener('keydown', (event) => {
              if (event.key === 'Enter' && !event.shiftKey) finish()
              if (event.key === 'Escape') {
                textarea.value = textNode.text()
                finish()
              }
            })
            textarea.addEventListener('blur', finish)
          }}
        />
      )
    }
    return null
  }

  const handleCanvasSelection = (frameId, shapeId, event) => {
    // Shift+click for multi-select
    if (event?.evt?.shiftKey) {
      if (selectedShapeIds.length > 0) {
        // Already in multi-select mode
        if (selectedShapeIds.includes(shapeId)) {
          // Remove from selection
          setSelectedShapeIds(prev => prev.filter(id => id !== shapeId))
        } else {
          // Add to selection
          setSelectedShapeIds(prev => [...prev, shapeId])
        }
      } else if (selectedShapeId) {
        // Start multi-select with current and new shape
        setSelectedShapeIds([selectedShapeId, shapeId])
        setSelectedShapeId(null)
      } else {
        // First selection
        setSelectedShapeId(shapeId)
      }
    } else {
      // Normal click - single select
      setSelectedShapeId(shapeId)
      setSelectedShapeIds([])
    }
  }


  const renderDraftGrid = () => {
    if (!layoutSettings.showGrid || !selectedFrame) return null
    const columns = layoutSettings.columns
    const rows = layoutSettings.rows
    const gutter = layoutSettings.gutter
    const colWidth = (selectedFrame.width - gutter * (columns - 1)) / columns
    const rowHeight = (selectedFrame.height - gutter * (rows - 1)) / rows
    const elements = []

    // Offset grid to frame position
    const frameX = selectedFrame.x
    const frameY = selectedFrame.y

    for (let c = 0; c < columns; c += 1) {
      elements.push(
        <Rect
          key={`col-${c}`}
          x={frameX + c * (colWidth + gutter)}
          y={frameY}
          width={colWidth}
          height={selectedFrame.height}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />,
      )
    }
    for (let r = 0; r < rows; r += 1) {
      elements.push(
        <Rect
          key={`row-${r}`}
          x={frameX}
          y={frameY + r * (rowHeight + gutter)}
          width={selectedFrame.width}
          height={rowHeight}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />,
      )
    }
    return elements
  }

  const dragStateRef = useRef(null)

  const beginArtboardDrag = (mode, options = {}) => (event) => {
    event.preventDefault()
    if (!selectedFrame) return

    dragStateRef.current = {
      mode,
      directionX: options.directionX ?? 'center',
      directionY: options.directionY ?? 'center',
      startX: event.clientX,
      startY: event.clientY,
      originalPosition: { x: selectedFrame.x, y: selectedFrame.y },
      originalSize: { width: selectedFrame.width, height: selectedFrame.height },
      frameId: selectedFrame.id
    }
    window.addEventListener('pointermove', handleArtboardPointerMove)
    window.addEventListener('pointerup', endArtboardDrag)
  }

  const handleArtboardPointerMove = (event) => {
    const drag = dragStateRef.current
    if (!drag) return
    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY

    if (drag.mode === 'move') {
      const newX = Math.max(0, drag.originalPosition.x + dx)
      const newY = Math.max(0, drag.originalPosition.y + dy)
      updateShapePosition(drag.frameId, {
        x: newX,
        y: newY
      })
    }

    if (drag.mode === 'resize') {
      let newX = drag.originalPosition.x
      let newY = drag.originalPosition.y
      let newWidth = drag.originalSize.width
      let newHeight = drag.originalSize.height

      if (drag.directionX === 'start') {
        const candidate = Math.max(0, drag.originalPosition.x + dx)
        const delta = drag.originalPosition.x - candidate
        newWidth = Math.max(200, drag.originalSize.width + delta)
        newX = candidate
      } else if (drag.directionX === 'end') {
        newWidth = Math.max(200, drag.originalSize.width + dx)
      }

      if (drag.directionY === 'start') {
        const candidate = Math.max(0, drag.originalPosition.y + dy)
        const delta = drag.originalPosition.y - candidate
        newHeight = Math.max(200, drag.originalSize.height + delta)
        newY = candidate
      } else if (drag.directionY === 'end') {
        newHeight = Math.max(200, drag.originalSize.height + dy)
      }

      updateShapePosition(drag.frameId, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      })
    }
  }

  const endArtboardDrag = () => {
    dragStateRef.current = null
    window.removeEventListener('pointermove', handleArtboardPointerMove)
    window.removeEventListener('pointerup', endArtboardDrag)
  }

  useEffect(() => () => endArtboardDrag(), [])

  const stageCursor = useMemo(() => {
    if (activeTool === 'zoom') return isAltPressed ? 'zoom-out' : 'zoom-in'
    if (activeTool === 'select') return 'default'
    return 'crosshair'
  }, [activeTool, isAltPressed])

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-[12px] text-zinc-100 flex flex-col">
      <TopNav
        onCanvasSizeClick={() => setCanvasDialog({ open: true, width: canvasSize.width, height: canvasSize.height })}
        onClearDocument={handleClearDocument}
        canvasSize={canvasSize}
      />

      <div className="flex-1 flex overflow-hidden">
        <LayersSidebar
          layers={frames}
          infiniteCanvasShapes={infiniteCanvasShapes}
          selectedLayerId={selectedFrame?.id ?? null}
          selectedObjectId={selectedObject?.id ?? null}
          expandedLayers={expandedShapes}
          onLayerSelect={(frameId, shapeId) => {
            if (frameId === null && shapeId === null) {
              // Deselect everything
              setSelectedShapeId(null)
              setSelectedShapeIds([])
            } else {
              setSelectedShapeId(shapeId || frameId)
              if (frameId) ensureFrameExpanded(frameId)
            }
          }}
          onObjectSelect={(frameId, shapeId) => {
            setSelectedShapeId(shapeId)
          }}
          onToggleExpand={(frameId) => {
            setExpandedShapes((prev) => {
              const next = new Set(prev)
              if (next.has(frameId)) next.delete(frameId)
              else next.add(frameId)
              return next
            })
          }}
          onToggleLayerVisibility={toggleShapeVisibility}
          onToggleObjectVisibility={(frameId, shapeId) => toggleShapeVisibility(shapeId)}
          onMoveLayer={moveFrame}
          onDeleteLayer={handleDeleteFrame}
          onDeleteObject={handleDeleteShape}
          onAddLayer={handleAddFrame}
        />

        <div className="flex-1 flex flex-col bg-zinc-950 relative min-h-0 overflow-hidden">
          <div className="toolbar-container">
            <Toolbar
              activeTool={activeTool}
              dropdownState={dropdownState}
              toolSelections={toolSelections}
              filterMenuOpen={filterMenuOpen}
              onToolbarButton={handleToolbarButton}
              onToggleDropdown={toggleDropdown}
              onToolOption={handleToolOption}
              onFilterSelect={handleFilterSelect}
              setFilterMenuOpen={setFilterMenuOpen}
            />
          </div>

          <CanvasArea
            canvasSize={canvasSize}
            artboardPosition={artboardPosition}
            zoomLevel={zoomLevel}
            stagePosition={stagePosition}
            selectedLayer={selectedFrame}
            layers={frames}
            shapes={shapes}
            selectedObjectId={selectedObject?.id ?? null}
            activeTool={activeTool}
            stageCursor={stageCursor}
            stageRef={stageRef}
            transformerRef={transformerRef}
            nodeRefs={nodeRefs}
            dragDraft={dragDraft}
            layoutSettings={layoutSettings}
            canvasBackground={canvasBackground}
            onStagePointerDown={handleStagePointerDown}
            onStagePointerMove={handleStagePointerMove}
            onStagePointerUp={handleStagePointerUp}
            onArtboardBackgroundClick={handleArtboardBackgroundClick}
            onCanvasSelection={handleCanvasSelection}
            onObjectDragStart={handleObjectDragStart}
            onObjectDragEnd={handleObjectDragEnd}
            onObjectTransformEnd={handleObjectTransformEnd}
            onBeginArtboardDrag={beginArtboardDrag}
            renderObject={renderObject}
            renderDraftGrid={renderDraftGrid}
          />
        </div>

        <Inspector
          selectedLayer={selectedFrame}
          selectedObject={selectedObject}
          canvasBackground={canvasBackground}
          onLayerNameChange={(name) => {
            if (selectedFrame) updateShape(selectedFrame.id, { name })
          }}
          onLayerBackgroundChange={(background) => {
            if (selectedFrame) {
              updateShape(selectedFrame.id, { background })
            } else {
              setCanvasBackground(background)
            }
          }}
          onObjectPropertyChange={handlePositionInput}
          onObjectColorChange={handleColorChange}
          onObjectOpacityChange={handleOpacityChange}
          onObjectTextChange={(prop, value) => {
            if (selectedObject) updateShape(selectedObject.id, { [prop]: value })
          }}
          inspectorFilter={inspectorFilter}
          setInspectorFilter={setInspectorFilter}
        />
      </div>

      {canvasDialog.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center text-[12px]">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 w-[320px] space-y-3">
            <div className="text-zinc-400 uppercase tracking-wide">Canvas Size</div>
            <div className="flex gap-2">
              <label className="flex-1 flex flex-col gap-1 text-zinc-500">
                Width
                <input
                  type="number"
                  value={canvasDialog.width}
                  min={200}
                  onChange={(e) => setCanvasDialog((prev) => ({ ...prev, width: Number(e.target.value) }))}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100"
                />
              </label>
              <label className="flex-1 flex flex-col gap-1 text-zinc-500">
                Height
                <input
                  type="number"
                  value={canvasDialog.height}
                  min={200}
                  onChange={(e) => setCanvasDialog((prev) => ({ ...prev, height: Number(e.target.value) }))}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100"
                />
              </label>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button className="px-3 py-1 rounded bg-zinc-800 text-zinc-200" onClick={() => setCanvasDialog((prev) => ({ ...prev, open: false }))}>
                Cancel
              </button>
              <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={handleCanvasDialogSave}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default KolEditor
