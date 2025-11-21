import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Circle,
  Line,
  Rect,
  RegularPolygon,
  Star,
  Text as KonvaText,
  Shape,
} from 'react-konva'
import Konva from 'konva'
import polygonClipping from 'polygon-clipping'
import { applyPixiFilterToNode } from '../utils/pixiFilters'

import TopNav from '../components/organisms/TopNav'
import Toolbar from '../components/organisms/Toolbar'
import LayersSidebar from '../components/organisms/LayersSidebar'
import Inspector from '../components/organisms/Inspector'
import CanvasArea from '../components/organisms/CanvasArea'
import { TOOL_SUBMENUS, DEFAULT_CANVAS, BASE_COLORS } from '../constants/editor'
import { hexToHsb, hsbToHex } from '../utils/colors'
import { clamp } from '../utils/geometry'
import { saveFile, loadFile } from '../utils/fileStorage'

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
  fillColor: '#ffffff', // RGB color
  fillOpacity: 0.02, // Separate opacity (0-1)
  visible: true,
  children: [],
  frameId: null,
  parentId: null,
  order: overrides.order ?? index,
  blendMode: 'source-over', // Default blend mode
  effects: [], // Layer effects: drop-shadow, inner-shadow, blur, background-blur, noise
  ...overrides,
})

const KolEditor = () => {
  const { fileId } = useParams()
  const navigate = useNavigate()

  // Flat shapes map - ALL shapes (including frames) in one place
  const [shapes, setShapes] = useState({})
  const [fileName, setFileName] = useState('Untitled')
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
  const [layoutSettings, setLayoutSettings] = useState({ columns: 1, rows: 1, gutter: 0, showGrid: false })
  const [toolSelections, setToolSelections] = useState({})
  const [marqueeSelection, setMarqueeSelection] = useState(null) // { start: {x, y}, end: {x, y}, clickedFrameId?: string }
  const [penPoints, setPenPoints] = useState([]) // Array of {x, y} points for pen tool
  const [penPreviewPoint, setPenPreviewPoint] = useState(null) // Current mouse position for preview line
  const [nodeEditMode, setNodeEditMode] = useState(false) // Whether node editing mode is active
  const [editingNodeIndex, setEditingNodeIndex] = useState(null) // Index of node being dragged
  const [pixiFilteredImages, setPixiFilteredImages] = useState({}) // Cache for Pixi-filtered images {shapeId: imageElement}
  const [, setGradientDragging] = useState(null) // 'start' | 'end' | null - used for cursor state

  const stageRef = useRef(null)
  const transformerRef = useRef(null)
  const nodeRefs = useRef(new Map())
  const nextFrameIndexRef = useRef(1)
  const nextShapeIdRef = useRef(1)
  const colorIndexRef = useRef(0)
  const cloneDragRef = useRef(null)
  const undoStackRef = useRef([])
  const redoStackRef = useRef([])

  // Load file on mount
  useEffect(() => {
    const fileData = loadFile(fileId)
    if (fileData) {
      setShapes(fileData.shapes || {})
      setFileName(fileData.name || 'Untitled')
      setCanvasBackground(fileData.canvasBackground || '#18181b')
    }
  }, [fileId])

  // Auto-save every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleSave()
    }, 5000)
    return () => clearInterval(interval)
  }, [shapes, canvasBackground, fileName])

  const handleSave = () => {
    saveFile(fileId, {
      name: fileName,
      shapes,
      canvasBackground,
    })
  }

  const handleGoHome = () => {
    handleSave() // Save before leaving
    navigate('/')
  }

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

  // Helper to check if a filter is a Pixi filter
  const isPixiFilter = (filterType) => {
    const pixiFilters = [
      'filter-adjustment', 'filter-hsl-adjustment', 'filter-color-gradient', 'filter-color-map',
      'filter-color-overlay', 'filter-color-replace', 'filter-multi-color-replace',
      'filter-radial-blur', 'filter-zoom-blur', 'filter-motion-blur', 'filter-kawase-blur',
      'filter-tilt-shift', 'filter-backdrop-blur', 'filter-displacement', 'filter-twist',
      'filter-bulge-pinch', 'filter-shockwave', 'filter-ascii', 'filter-cross-hatch',
      'filter-dot', 'filter-crt', 'filter-old-film', 'filter-glitch', 'filter-rgb-split',
      'filter-simplex-noise', 'filter-bloom', 'filter-advanced-bloom', 'filter-glow',
      'filter-godray', 'filter-simple-lightmap', 'filter-bevel', 'filter-drop-shadow',
      'filter-outline', 'filter-reflection', 'filter-convolution'
    ]
    return pixiFilters.includes(filterType)
  }

  // Apply Pixi filters to shapes with Pixi filters (including image fills)
  useEffect(() => {
    const applyPixiFilters = async () => {
      for (const [shapeId, shape] of Object.entries(shapes)) {
        const shapeFilters = shape.filters || []
        const pixiFiltersToApply = shapeFilters.filter(f => f.enabled && isPixiFilter(f.type))

        if (pixiFiltersToApply.length > 0) {
          // For image fill shapes, apply filter to the fillImageElement
          if (shape.fillType === 'image' && shape.fillImageElement) {
            const { applyPixiFilterToImage } = await import('../utils/pixiFilters')
            for (const filter of pixiFiltersToApply) {
              const filteredCanvas = await applyPixiFilterToImage(shape.fillImageElement, filter.type, filter.params)
              if (filteredCanvas) {
                const img = new window.Image()
                img.src = filteredCanvas.toDataURL()
                img.onload = () => {
                  setPixiFilteredImages(prev => ({
                    ...prev,
                    [shapeId]: img
                  }))
                }
              }
            }
          } else {
            // For other shapes (photo type), use node-based filtering
            const node = nodeRefs.current.get(shapeId)
            if (node) {
              for (const filter of pixiFiltersToApply) {
                const filteredCanvas = await applyPixiFilterToNode(node, filter.type, filter.params)
                if (filteredCanvas) {
                  const img = new window.Image()
                  img.src = filteredCanvas.toDataURL()
                  img.onload = () => {
                    setPixiFilteredImages(prev => ({
                      ...prev,
                      [shapeId]: img
                    }))
                  }
                }
              }
            }
          }
        } else {
          // Clear filtered image if no Pixi filters
          setPixiFilteredImages(prev => {
            const updated = { ...prev }
            delete updated[shapeId]
            return updated
          })
        }
      }
    }

    applyPixiFilters()
  }, [shapes])

  // Get all frames (for sidebar) with populated children
  // Get all top-level items (frames and objects) sorted by order
  const frames = useMemo(() => {
    const result = Object.values(shapes)
      .filter(shape => !shape.frameId && !shape.parentId) // Top-level: no parent frame or boolean group
      .map(item => {
        if (item.type === 'frame' || item.type === 'boolean') {
          // Frame or Boolean group: include its children
          return {
            ...item,
            objects: item.children
              .map(id => shapes[id])
              .filter(Boolean)
              .sort((a, b) => a.order - b.order)
          }
        } else {
          // Regular object at top level
          return {
            ...item,
            objects: [] // Objects don't have children
          }
        }
      })
      .sort((a, b) => a.order - b.order)

    return result
  }, [shapes])

  // Legacy: kept for backward compatibility (now empty since all are in frames)
  const infiniteCanvasShapes = useMemo(() => {
    return []
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

    // Hide transformer in node edit mode
    if (nodeEditMode) {
      transformer.nodes([])
      transformer.getLayer()?.batchDraw()
      return
    }

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
  }, [selectedShapeId, selectedShapeIds, selectedObject, nodeEditMode])

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
        console.log('Cmd+A pressed, selectedFrame:', selectedFrame?.id, 'selectedObject:', selectedObject?.id)
        if (selectedFrame) {
          // Select all objects in the current frame
          const frameChildren = selectedFrame.children.filter(id => shapes[id]?.visible !== false)
          console.log('Selecting frame children:', frameChildren)
          if (frameChildren.length > 0) {
            setSelectedShapeIds(frameChildren)
            setSelectedShapeId(null)
          }
        } else {
          // Select all top-level frames and objects (not children inside frames)
          const allShapes = Object.values(shapes)
          console.log('All shapes:', allShapes.map(s => ({ id: s.id, type: s.type, frameId: s.frameId, parentId: s.parentId, visible: s.visible })))
          const allObjects = allShapes
            .filter(s => {
              // Include only top-level items: frames and objects not in frames/boolean groups
              if (s.type === 'frame') return true
              // Exclude shapes inside frames
              if (s.frameId) return false
              // Exclude boolean group children
              if (s.parentId && s.parentId !== s.frameId) return false
              return s.visible !== false || s.type === 'boolean'
            })
            .map(s => s.id)
          console.log('Selecting all objects:', allObjects)
          if (allObjects.length > 0) {
            setSelectedShapeIds(allObjects)
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
        // Cancel pen tool
        if (activeTool === 'pen') {
          setPenPoints([])
          setPenPreviewPoint(null)
        }
        // Exit node edit mode
        if (nodeEditMode) {
          setNodeEditMode(false)
        } else {
          setSelectedShapeId(null)
          setSelectedShapeIds([])
        }
      }

      if (event.key === 'Enter' && activeTool === 'pen' && penPoints.length >= 2) {
        finalizePenPath()
        event.preventDefault()
      }
      if (event.key === 'v' || event.key === 'V') {
        setActiveTool('select')
        setNodeEditMode(false)
        setDropdownState(dropdownDefaults)
        setPendingInsert(null)
        setPenPoints([])
        setPenPreviewPoint(null)
      }
      if (event.key === 'a' || event.key === 'A') {
        setActiveTool('select')
        setNodeEditMode(true)
        setDropdownState(dropdownDefaults)
        setPendingInsert(null)
        setPenPoints([])
        setPenPreviewPoint(null)
      }
      if (event.key === 'p' || event.key === 'P') {
        setActiveTool('pen')
        setDropdownState(dropdownDefaults)
        setPendingInsert(null)
        setPenPoints([])
        setPenPreviewPoint(null)
      }
      if (event.key === 'r' || event.key === 'R') {
        handleShapeInsert('rect')
        setActiveTool('shape')
        setPenPoints([])
        setPenPreviewPoint(null)
      }
      if (event.key === 'f' || event.key === 'F') {
        setActiveTool('frame')
        setDropdownState(dropdownDefaults)
        setPendingInsert(null)
        setPenPoints([])
        setPenPreviewPoint(null)
      }

      // Opacity shortcuts: 1-9 = 10%-90%, 0 = 100%, 00 (double zero) = 0%
      if (/^[0-9]$/.test(event.key) && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const num = parseInt(event.key)
        const now = Date.now()
        const lastZeroTime = window._lastZeroKeyTime || 0

        // Check for double-zero (00) within 300ms
        if (num === 0 && (now - lastZeroTime) < 300) {
          // Set opacity to 0%
          if (selectedShapeIds.length > 0) {
            const newShapes = { ...shapes }
            selectedShapeIds.forEach(shapeId => {
              if (shapes[shapeId] && shapes[shapeId].type !== 'frame') {
                newShapes[shapeId] = { ...shapes[shapeId], opacity: 0 }
              }
            })
            setShapes(newShapes)
            pushUndoState(newShapes)
          } else if (selectedObject) {
            updateShape(selectedObject.id, { opacity: 0 })
          }
          delete window._lastZeroKeyTime
          event.preventDefault()
          return
        }

        // Track zero keypress time for double-zero detection
        if (num === 0) {
          window._lastZeroKeyTime = now
        }

        // 1-9 = 10%-90%, 0 = 100%
        const opacity = num === 0 ? 1 : num / 10

        if (selectedShapeIds.length > 0) {
          const newShapes = { ...shapes }
          selectedShapeIds.forEach(shapeId => {
            if (shapes[shapeId] && shapes[shapeId].type !== 'frame') {
              newShapes[shapeId] = { ...shapes[shapeId], opacity }
            }
          })
          setShapes(newShapes)
          pushUndoState(newShapes)
        } else if (selectedObject) {
          updateShape(selectedObject.id, { opacity })
        }
        event.preventDefault()
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
      blendMode: 'source-over',
      effects: [], // Layer effects: drop-shadow, inner-shadow, blur, background-blur, noise
      children: [],
      frameId: overrides.frameId ?? null,
      parentId: overrides.parentId ?? null,
      order: overrides.order ?? nextShapeIdRef.current,
      // Fill properties
      fillType: overrides.fillType ?? 'solid', // 'solid', 'gradient', 'image'
      // Gradient fill
      gradientStartColor: overrides.gradientStartColor ?? color,
      gradientStartOpacity: overrides.gradientStartOpacity ?? 1,
      gradientEndColor: overrides.gradientEndColor ?? '#ffffff',
      gradientEndOpacity: overrides.gradientEndOpacity ?? 1,
      gradientStart: overrides.gradientStart ?? { x: 0, y: 0.5 }, // Normalized 0-1
      gradientEnd: overrides.gradientEnd ?? { x: 1, y: 0.5 },
      // Image fill
      fillImageUrl: overrides.fillImageUrl ?? null,
      fillImageElement: overrides.fillImageElement ?? null,
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

    // Swap order values
    const frame1 = framesList[index]
    const frame2 = framesList[target]

    pushUndoState({
      ...shapes,
      [frame1.id]: { ...frame1, order: frame2.order },
      [frame2.id]: { ...frame2, order: frame1.order }
    })
  }

  const handleReorderFrames = (activeId, overId) => {
    if (activeId === overId) return

    const framesList = Object.values(shapes)
      .filter(s => s.type === 'frame')
      .sort((a, b) => a.order - b.order)

    const oldIndex = framesList.findIndex(f => f.id === activeId)
    const newIndex = framesList.findIndex(f => f.id === overId)

    if (oldIndex === -1 || newIndex === -1) return

    // Reorder the array
    const reordered = [...framesList]
    const [removed] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, removed)

    // Update order properties
    const updates = {}
    reordered.forEach((frame, index) => {
      updates[frame.id] = { ...frame, order: index }
    })

    pushUndoState({ ...shapes, ...updates })
  }

  const handleReorderObjects = (activeId, overId, frameId) => {
    if (activeId === overId) return

    const frame = shapes[frameId]
    if (!frame) return

    const objectsList = frame.children
      .map(id => shapes[id])
      .filter(Boolean)
      .sort((a, b) => a.order - b.order)

    const oldIndex = objectsList.findIndex(obj => obj.id === activeId)
    const newIndex = objectsList.findIndex(obj => obj.id === overId)

    if (oldIndex === -1 || newIndex === -1) return

    // Reorder the array
    const reordered = [...objectsList]
    const [removed] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, removed)

    // Update order properties
    const updates = {}
    reordered.forEach((obj, index) => {
      updates[obj.id] = { ...obj, order: index }
    })

    pushUndoState({ ...shapes, ...updates })
  }

  const handleMoveObjectToFrame = (objectId, targetFrameId) => {
    const object = shapes[objectId]
    if (!object || object.type === 'frame') return

    const targetFrame = shapes[targetFrameId]
    if (!targetFrame || targetFrame.type !== 'frame') return

    // Don't do anything if already in this frame
    if (object.frameId === targetFrameId) return

    // Remove from old frame if it had one
    const oldFrameId = object.frameId
    const updates = {}

    if (oldFrameId) {
      const oldFrame = shapes[oldFrameId]
      updates[oldFrameId] = {
        ...oldFrame,
        children: oldFrame.children.filter(id => id !== objectId)
      }
    }

    // Add to new frame
    const newOrder = targetFrame.children.length
    updates[targetFrameId] = {
      ...targetFrame,
      children: [...targetFrame.children, objectId]
    }
    updates[objectId] = {
      ...object,
      frameId: targetFrameId,
      parentId: targetFrameId,
      order: newOrder
    }

    pushUndoState({ ...shapes, ...updates })
  }

  const handleNestFrameInFrame = (frameId, targetFrameId) => {
    const frame = shapes[frameId]
    const targetFrame = shapes[targetFrameId]

    if (!frame || !targetFrame || frame.type !== 'frame' || targetFrame.type !== 'frame') return
    if (frameId === targetFrameId) return

    // Add frame as child of target
    const newOrder = targetFrame.children.length
    const updates = {
      [targetFrameId]: {
        ...targetFrame,
        children: [...targetFrame.children, frameId]
      },
      [frameId]: {
        ...frame,
        frameId: targetFrameId,
        parentId: targetFrameId,
        order: newOrder
      }
    }

    pushUndoState({ ...shapes, ...updates })
  }

  const handleMoveToInfiniteCanvas = (itemId) => {
    const item = shapes[itemId]
    if (!item) return

    const updates = {}

    // Remove from parent frame if it has one
    if (item.frameId) {
      const parentFrame = shapes[item.frameId]
      if (parentFrame) {
        updates[item.frameId] = {
          ...parentFrame,
          children: parentFrame.children.filter(id => id !== itemId)
        }
      }
    }

    // Update item to be frameless
    updates[itemId] = {
      ...item,
      frameId: null,
      parentId: null,
      order: Object.keys(shapes).length // Put at end
    }

    pushUndoState({ ...shapes, ...updates })
  }

  const handleInsertItem = (activeId, overId, position) => {
    const activeItem = shapes[activeId]
    const overItem = shapes[overId]

    if (!activeItem || !overItem) return

    // The target parent is where the overItem lives
    const targetParentId = overItem.frameId
    const activeParentId = activeItem.frameId

    // Get the list of items at the target level
    let targetLevelItems
    if (targetParentId) {
      // Target is inside a frame
      const targetFrame = shapes[targetParentId]
      targetLevelItems = targetFrame.children
        .map(id => shapes[id])
        .filter(Boolean)
        .sort((a, b) => a.order - b.order)
    } else {
      // Target is at top level
      targetLevelItems = Object.values(shapes)
        .filter(s => !s.frameId)
        .sort((a, b) => a.order - b.order)
    }

    // Find positions in target list
    const overIndex = targetLevelItems.findIndex(item => item.id === overId)
    if (overIndex === -1) return

    // Calculate insert position
    const insertIndex = position === 'before' ? overIndex : overIndex + 1

    // Remove active item from target list if it's already there
    const activeIndexInTarget = targetLevelItems.findIndex(item => item.id === activeId)
    let reordered = [...targetLevelItems]

    if (activeIndexInTarget !== -1) {
      // Already in target list, just reorder
      const [removed] = reordered.splice(activeIndexInTarget, 1)
      const finalIndex = activeIndexInTarget < insertIndex ? insertIndex - 1 : insertIndex
      reordered.splice(finalIndex, 0, removed)
    } else {
      // Not in target list, insert it
      reordered.splice(insertIndex, 0, activeItem)
    }

    // Build updates object
    const updates = {}

    // Update the active item's parent and order
    updates[activeId] = {
      ...activeItem,
      frameId: targetParentId || null,
      parentId: targetParentId || null,
      order: reordered.findIndex(item => item.id === activeId)
    }

    // Update order for all items in target level
    reordered.forEach((item, index) => {
      if (item.id === activeId) {
        // Already updated above with new frameId, just update order
        updates[item.id] = { ...updates[item.id], order: index }
      } else {
        // Other items: only update order if they're already in this level
        updates[item.id] = { ...item, order: index }
      }
    })

    // Update target frame's children array if applicable
    if (targetParentId) {
      const targetFrame = shapes[targetParentId]
      updates[targetParentId] = {
        ...targetFrame,
        children: reordered.map(item => item.id)
      }
    }

    // Remove from old parent if it had one
    if (activeParentId && activeParentId !== targetParentId) {
      const oldFrame = shapes[activeParentId]
      updates[activeParentId] = {
        ...oldFrame,
        children: oldFrame.children.filter(id => id !== activeId)
      }

      // Update order for remaining items in old frame
      oldFrame.children
        .filter(id => id !== activeId)
        .map(id => shapes[id])
        .filter(Boolean)
        .sort((a, b) => a.order - b.order)
        .forEach((item, index) => {
          updates[item.id] = { ...updates[item.id], ...item, order: index }
        })
    }

    pushUndoState({ ...shapes, ...updates })
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

    // Clear pen points when switching tools
    if (toolId !== 'pen') {
      setPenPoints([])
      setPenPreviewPoint(null)
    }

    // Exit node edit mode when switching away from select tool
    if (toolId !== 'select') {
      setNodeEditMode(false)
    } else {
      // Clicking select tool when already in select tool exits node edit mode
      if (activeTool === 'select' && nodeEditMode) {
        setNodeEditMode(false)
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

  const handlePenClick = (pointer, evt) => {
    // Double-click to close the path
    if (evt && evt.detail === 2 && penPoints.length >= 2) {
      finalizePenPath()
      return
    }

    // Check if clicking near the first point to close the path
    if (penPoints.length >= 3) {
      const firstPoint = penPoints[0]
      const distance = Math.sqrt(
        Math.pow(pointer.x - firstPoint.x, 2) + Math.pow(pointer.y - firstPoint.y, 2)
      )
      // If within 10px of first point, close the path
      if (distance < 10) {
        finalizePenPath()
        return
      }
    }

    // Add new point
    setPenPoints(prev => [...prev, { x: pointer.x, y: pointer.y }])
  }

  const finalizePenPath = () => {
    if (penPoints.length < 2) {
      setPenPoints([])
      setPenPreviewPoint(null)
      return
    }

    // Create a path shape from the points
    const frameId = selectedFrame?.id ?? null

    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    penPoints.forEach(pt => {
      minX = Math.min(minX, pt.x)
      minY = Math.min(minY, pt.y)
      maxX = Math.max(maxX, pt.x)
      maxY = Math.max(maxY, pt.y)
    })

    const width = maxX - minX
    const height = maxY - minY

    // Convert points to relative coordinates
    const relativePoints = []
    penPoints.forEach(pt => {
      relativePoints.push(pt.x - minX, pt.y - minY)
    })

    const position = {
      x: minX,
      y: minY,
      width: Math.max(10, width),
      height: Math.max(10, height),
      rotation: 0
    }

    const shape = createShape('path', {
      position,
      frameId,
      meta: { points: relativePoints, closed: true }
    })

    addShapeToFrame(frameId, shape)
    setPenPoints([])
    setPenPreviewPoint(null)
    setActiveTool('select')
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

    if (activeTool === 'photo') {
      // Start dragging to create a photo frame
      const frameId = selectedFrame?.id ?? null
      setDragDraft({ frameId, kind: 'photo', start: pointer, current: pointer, shift: e.evt?.shiftKey })
      return
    }

    if (activeTool === 'pen') {
      // Handle pen tool clicks
      handlePenClick(pointer, e.evt)
      return
    }

    if (activeTool === 'zoom') {
      handleZoomAtPointer(e.evt?.altKey ? 'out' : 'in')
      return
    }

    if (activeTool === 'select' && e.target === stage) {
      // Start marquee selection
      setMarqueeSelection({ start: pointer, end: pointer })
      // Don't deselect yet - wait for mouse up to see if it was a drag or click
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

    // Select the frame and deselect any objects
    setSelectedShapeId(frameId)
    setSelectedShapeIds([])
  }

  const handleStagePointerMove = (e) => {
    if (dragDraft?.kind === 'shape' || dragDraft?.kind === 'frame' || dragDraft?.kind === 'photo') {
      const pointer = e.target.getStage().getPointerPosition()
      setDragDraft((prev) => (prev ? { ...prev, current: pointer, shift: e.evt?.shiftKey } : prev))
    }

    if (marqueeSelection) {
      const pointer = e.target.getStage().getPointerPosition()
      setMarqueeSelection((prev) => (prev ? { ...prev, end: pointer } : prev))
    }

    if (activeTool === 'pen' && penPoints.length > 0) {
      const pointer = e.target.getStage().getPointerPosition()
      setPenPreviewPoint(pointer)
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
    if (dragDraft?.kind === 'photo') finalizePhotoDraft()
    if (marqueeSelection) finalizeMarqueeSelection()
  }

  const finalizeMarqueeSelection = () => {
    if (!marqueeSelection) return

    const { start, end, clickedFrameId } = marqueeSelection
    const width = Math.abs(end.x - start.x)
    const height = Math.abs(end.y - start.y)

    // If marquee is too small (just a click)
    if (width < 5 && height < 5) {
      // If clicked on a frame background, select the frame
      if (clickedFrameId) {
        setSelectedShapeId(clickedFrameId)
        setSelectedShapeIds([])
      } else {
        // Otherwise deselect everything
        setSelectedShapeId(null)
        setSelectedShapeIds([])
      }
      setMarqueeSelection(null)
      return
    }

    // Calculate marquee bounds
    const marqueeLeft = Math.min(start.x, end.x)
    const marqueeTop = Math.min(start.y, end.y)
    const marqueeRight = Math.max(start.x, end.x)
    const marqueeBottom = Math.max(start.y, end.y)

    // Find all objects that intersect with the marquee
    const intersectingShapes = []

    if (selectedFrame) {
      // Only check objects in the current frame
      visibleShapes.forEach(shape => {
        if (!shape || !shape.visible) return

        // Calculate shape bounds
        const shapeLeft = shape.x
        const shapeTop = shape.y
        const shapeRight = shape.x + shape.width
        const shapeBottom = shape.y + shape.height

        // Check if marquee intersects with shape
        if (
          marqueeLeft < shapeRight &&
          marqueeRight > shapeLeft &&
          marqueeTop < shapeBottom &&
          marqueeBottom > shapeTop
        ) {
          intersectingShapes.push(shape.id)
        }
      })
    } else {
      // Check all top-level objects
      Object.values(shapes).forEach(shape => {
        if (shape.type === 'frame' || shape.frameId || !shape.visible) return

        const shapeLeft = shape.x
        const shapeTop = shape.y
        const shapeRight = shape.x + shape.width
        const shapeBottom = shape.y + shape.height

        if (
          marqueeLeft < shapeRight &&
          marqueeRight > shapeLeft &&
          marqueeTop < shapeBottom &&
          marqueeBottom > shapeTop
        ) {
          intersectingShapes.push(shape.id)
        }
      })
    }

    // Update selection
    if (intersectingShapes.length > 0) {
      setSelectedShapeIds(intersectingShapes)
      setSelectedShapeId(null)
    } else {
      setSelectedShapeId(null)
      setSelectedShapeIds([])
    }

    setMarqueeSelection(null)
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

  const finalizePhotoDraft = () => {
    if (!dragDraft) return
    const { start, current, shift, frameId } = dragDraft
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

    const position = {
      x: Math.min(start.x, current.x),
      y: Math.min(start.y, current.y),
      width: finalWidth,
      height: finalHeight,
      rotation: 0,
    }

    // Create a photo shape with no image yet
    const photoShape = {
      id: `photo-${Date.now()}`,
      type: 'photo',
      ...position,
      fill: '#fafafa', // Very light gray background
      visible: true,
      frameId,
      imageUrl: null, // No image yet
    }

    addShapeToFrame(frameId, photoShape)
    setDragDraft(null)
    setActiveTool('select')
    setSelectedShapeId(photoShape.id)
  }

  const normalizePosition = (type, width, height, node) => {
    if (['rect', 'text', 'photo'].includes(type)) return { x: node.x(), y: node.y() }
    return { x: node.x() - width / 2, y: node.y() - height / 2 }
  }

  const handleObjectDragStart = (frameId, shape, event) => {
    if (event.evt?.altKey) {
      event.target.stopDrag()

      // Deep clone the shape to avoid sharing references
      const clone = {
        ...shape,
        id: `shape-${nextShapeIdRef.current++}`,
        name: `${shape.name} copy`,
        frameId,
        parentId: frameId,
        // Deep clone arrays and objects
        children: shape.children ? [...shape.children] : [],
        meta: shape.meta ? JSON.parse(JSON.stringify(shape.meta)) : undefined,
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

  const handleNodeDrag = (nodeIndex, x, y) => {
    if (!selectedObject) return
    const shape = selectedObject

    // Only handle vector shapes with points
    if (!shape.meta || !shape.meta.points) return

    // Update the specific point
    const newPoints = [...shape.meta.points]
    newPoints[nodeIndex * 2] = x
    newPoints[nodeIndex * 2 + 1] = y

    // Update shape with new points
    updateShape(shape.id, {
      meta: { ...shape.meta, points: newPoints }
    })
  }

  // Gradient handle drag handler
  const handleGradientHandleDrag = (handle, mouseDownEvent) => {
    if (!selectedObject || selectedObject.fillType !== 'gradient') return

    const shape = selectedObject
    setGradientDragging(handle)

    const handleMouseMove = (e) => {
      // Get mouse position relative to canvas container
      const canvasContainer = document.querySelector('.flex-1.flex.overflow-hidden')
      if (!canvasContainer) return

      const rect = canvasContainer.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Convert screen coords to world coords
      const worldX = (mouseX - stagePosition.x) / zoomLevel
      const worldY = (mouseY - stagePosition.y) / zoomLevel

      // Convert world coords to normalized 0-1 coords relative to shape
      const normalizedX = (worldX - shape.x) / shape.width
      const normalizedY = (worldY - shape.y) / shape.height

      // Clamp to reasonable range (allow some overflow for effect)
      const clampedX = Math.max(-0.5, Math.min(1.5, normalizedX))
      const clampedY = Math.max(-0.5, Math.min(1.5, normalizedY))

      if (handle === 'start') {
        updateShape(shape.id, { gradientStart: { x: clampedX, y: clampedY } })
      } else {
        updateShape(shape.id, { gradientEnd: { x: clampedX, y: clampedY } })
      }
    }

    const handleMouseUp = () => {
      setGradientDragging(null)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handlePositionInput = (prop, value) => {
    if (!selectedObject) return
    // Non-numeric props that should be passed as-is
    const nonNumericProps = ['blendMode', 'effects', 'fillType', 'gradientStartColor', 'gradientEndColor', 'gradientStart', 'gradientEnd', 'fillImageUrl', 'fillImageElement']
    if (nonNumericProps.includes(prop)) {
      updateShape(selectedObject.id, { [prop]: value })
    } else if (prop === 'gradientStartOpacity' || prop === 'gradientEndOpacity') {
      // Opacity props are already 0-1, just ensure they're numbers
      updateShape(selectedObject.id, { [prop]: Number(value) })
    } else {
      const numeric = prop === 'rotation' ? Number(value) : Math.max(0, Number(value))
      updateShapePosition(selectedObject.id, { [prop]: numeric })
    }
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

  const applyAlignment = (alignType) => {
    // Get all selected shapes
    const targetShapes = selectedShapeIds.length > 1
      ? selectedShapeIds.map(id => shapes[id]).filter(Boolean)
      : selectedObject ? [selectedObject] : []

    if (targetShapes.length === 0) return

    // If single object and frame selected, align to frame
    if (targetShapes.length === 1 && selectedFrame) {
      const frameX = selectedFrame.x
      const frameY = selectedFrame.y
      const frameWidth = selectedFrame.width
      const frameHeight = selectedFrame.height
      const objWidth = targetShapes[0].width
      const objHeight = targetShapes[0].height

      const updates = {}

      switch (alignType) {
        case 'align-left':
          updates.x = frameX
          break
        case 'align-center':
          updates.x = frameX + (frameWidth - objWidth) / 2
          break
        case 'align-right':
          updates.x = frameX + frameWidth - objWidth
          break
        case 'align-top':
          updates.y = frameY
          break
        case 'align-middle':
          updates.y = frameY + (frameHeight - objHeight) / 2
          break
        case 'align-bottom':
          updates.y = frameY + frameHeight - objHeight
          break
      }

      updateShapePosition(targetShapes[0].id, updates)
      return
    }

    // Multi-selection: calculate bounding box of all selected shapes
    if (targetShapes.length > 1) {
      let minX = Infinity, minY = Infinity
      let maxX = -Infinity, maxY = -Infinity

      targetShapes.forEach(shape => {
        minX = Math.min(minX, shape.x)
        minY = Math.min(minY, shape.y)
        maxX = Math.max(maxX, shape.x + shape.width)
        maxY = Math.max(maxY, shape.y + shape.height)
      })

      const boundingBox = {
        left: minX,
        right: maxX,
        top: minY,
        bottom: maxY,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2
      }

      // Align each shape to the bounding box
      const shapeUpdates = {}
      targetShapes.forEach(shape => {
        const updates = {}

        switch (alignType) {
          case 'align-left':
            updates.x = boundingBox.left
            break
          case 'align-center':
            updates.x = boundingBox.centerX - shape.width / 2
            break
          case 'align-right':
            updates.x = boundingBox.right - shape.width
            break
          case 'align-top':
            updates.y = boundingBox.top
            break
          case 'align-middle':
            updates.y = boundingBox.centerY - shape.height / 2
            break
          case 'align-bottom':
            updates.y = boundingBox.bottom - shape.height
            break
        }

        shapeUpdates[shape.id] = { ...shape, ...updates }
      })

      pushUndoState({ ...shapes, ...shapeUpdates })
    }
  }

  const addFilter = (filterId) => {
    if (!selectedObject) return

    const currentFilters = selectedObject.filters || []
    const newFilter = {
      id: `${filterId}-${Date.now()}`,
      type: filterId,
      enabled: true,
      params: getDefaultFilterParams(filterId)
    }

    const updatedFilters = [...currentFilters, newFilter]
    updateShape(selectedObject.id, { filters: updatedFilters })
  }

  const getDefaultFilterParams = (filterId) => {
    switch (filterId) {
      case 'filter-hsl':
      case 'filter-hsv':
        return { hue: 0, saturation: 0, value: 0 }
      case 'filter-brightness':
        return { brightness: 0 }
      case 'filter-contrast':
        return { contrast: 0 }
      case 'filter-rgb':
        return { red: 0, green: 0, blue: 0 }
      case 'filter-blur':
        return { blurRadius: 5 }
      case 'filter-pixelate':
        return { pixelSize: 8 }
      case 'filter-posterize':
        return { levels: 0.5 }
      case 'filter-emboss':
        return { embossStrength: 0.5, embossDirection: 'top-left' }
      case 'filter-noise':
        return { noise: 0.2 }
      case 'filter-threshold':
        return { threshold: 0.5 }
      // Pixi filters - Blur
      case 'filter-radial-blur':
        return { angle: 0, centerX: 0.5, centerY: 0.5, kernelSize: 5, radius: -1 }
      case 'filter-zoom-blur':
        return { strength: 0.1, centerX: 0.5, centerY: 0.5, innerRadius: 0, radius: -1 }
      case 'filter-motion-blur':
        return { velocityX: 0, velocityY: 5, kernelSize: 5, offset: 0 }
      // Pixi filters - Displacement
      case 'filter-displacement':
        return { scaleX: 20, scaleY: 20, frequency: 1, octaves: 3, persistence: 0.5 }
      // Pixi filters - Distortion
      case 'filter-twist':
        return { radius: 200, angle: 4, centerX: 0.5, centerY: 0.5 }
      case 'filter-bulge-pinch':
        return { radius: 100, strength: 1, centerX: 0.5, centerY: 0.5 }
      case 'filter-shockwave':
        return { amplitude: 30, wavelength: 160, brightness: 1, radius: -1, centerX: 0.5, centerY: 0.5 }
      // Pixi - Color Adjustments
      case 'filter-adjustment':
        return { gamma: 1, saturation: 1, contrast: 1, brightness: 1, red: 1, green: 1, blue: 1, alpha: 1 }
      case 'filter-hsl-adjustment':
        return { hue: 0, saturation: 0, lightness: 0, colorize: false, alpha: 1 }
      case 'filter-color-overlay':
        return { color: 0x000000, alpha: 0.5 }
      case 'filter-color-replace':
        return { originalColor: 0xff0000, newColor: 0x00ff00, epsilon: 0.4 }
      // Pixi - Blur
      case 'filter-kawase-blur':
        return { blur: 4, quality: 3 }
      case 'filter-tilt-shift':
        return { blur: 100, gradientBlur: 600, start: { x: 0, y: 0 }, end: { x: 600, y: 600 } }
      case 'filter-backdrop-blur':
        return { strength: 8, quality: 4 }
      // Pixi - Artistic
      case 'filter-ascii':
        return { size: 8 }
      case 'filter-cross-hatch':
        return {}
      case 'filter-dot':
        return { scale: 1, angle: 5 }
      case 'filter-crt':
        return { curvature: 1, lineWidth: 1, lineContrast: 0.25, verticalLine: false, noise: 0.3, noiseSize: 1, seed: 0, vignetting: 0.3, vignettingAlpha: 1, vignettingBlur: 0.3, time: 0 }
      case 'filter-old-film':
        return { sepia: 0.3, noise: 0.3, noiseSize: 1, scratch: 0.5, scratchDensity: 0.3, scratchWidth: 1, vignetting: 0.3, vignettingAlpha: 1, vignettingBlur: 0.3 }
      case 'filter-glitch':
        return { slices: 5, offset: 100, direction: 0, fillMode: 0, seed: 0, average: false, minSize: 8, sampleSize: 512 }
      case 'filter-rgb-split':
        return { red: { x: -10, y: 0 }, green: { x: 0, y: 0 }, blue: { x: 10, y: 0 } }
      case 'filter-simplex-noise':
        return { scale: 50, animationFrequency: 0 }
      // Pixi - Lighting
      case 'filter-bloom':
        return { blur: 2, quality: 4, strength: 1 }
      case 'filter-advanced-bloom':
        return { threshold: 0.5, bloomScale: 1, brightness: 1, blur: 8, quality: 4 }
      case 'filter-glow':
        return { distance: 10, outerStrength: 4, innerStrength: 0, color: 0xffffff, quality: 0.1 }
      case 'filter-godray':
        return { angle: 30, gain: 0.5, lacunarity: 2.5, parallel: true, time: 0, center: { x: 0, y: 0 } }
      case 'filter-simple-lightmap':
        return { color: 0xffffff, alpha: 1 }
      // Pixi - Stylize
      case 'filter-bevel':
        return { rotation: 45, thickness: 2, lightColor: 0xffffff, lightAlpha: 0.7, shadowColor: 0x000000, shadowAlpha: 0.7 }
      case 'filter-drop-shadow':
        return { rotation: 45, distance: 5, color: 0x000000, alpha: 0.5, shadowOnly: false, blur: 2, quality: 3 }
      case 'filter-outline':
        return { thickness: 1, color: 0x000000, quality: 0.1 }
      case 'filter-reflection':
        return { mirror: true, boundary: 0.5, amplitude: { x: 0, y: 20 }, waveLength: { x: 30, y: 100 }, alpha: { x: 1, y: 1 }, time: 0 }
      // Pixi - Utility
      case 'filter-convolution':
        return { matrix: [0, 0, 0, 0, 1, 0, 0, 0, 0], width: 200, height: 200 }
      case 'filter-color-gradient':
      case 'filter-color-map':
      case 'filter-multi-color-replace':
        return {}
      // Filters with no parameters
      case 'filter-invert':
      case 'filter-sepia':
      case 'filter-grayscale':
      case 'filter-enhance':
      case 'filter-solarize':
        return {}
      default:
        return {}
    }
  }

  const updateFilterParams = (shapeId, filterId, params) => {
    const shape = shapes[shapeId]
    if (!shape || !shape.filters) return

    const updatedFilters = shape.filters.map(f =>
      f.id === filterId ? { ...f, params: { ...f.params, ...params } } : f
    )

    updateShape(shapeId, { filters: updatedFilters })
  }

  const removeFilter = (shapeId, filterId) => {
    const shape = shapes[shapeId]
    if (!shape || !shape.filters) return

    const updatedFilters = shape.filters.filter(f => f.id !== filterId)
    updateShape(shapeId, { filters: updatedFilters })
  }

  const toggleFilterEnabled = (shapeId, filterId) => {
    const shape = shapes[shapeId]
    if (!shape || !shape.filters) return

    const updatedFilters = shape.filters.map(f =>
      f.id === filterId ? { ...f, enabled: !f.enabled } : f
    )

    updateShape(shapeId, { filters: updatedFilters })
  }

  const applyBooleanOperation = (operation) => {
    // Need at least 2 selected shapes
    const selectedShapes = selectedShapeIds.length > 0
      ? selectedShapeIds.map(id => shapes[id]).filter(Boolean)
      : selectedObject ? [selectedObject] : []

    if (selectedShapes.length < 2) {
      console.warn('Boolean operations require at least 2 selected shapes')
      return
    }

    // Create a non-destructive boolean group
    const frameId = selectedShapes[0].frameId

    // Calculate bounding box of all shapes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    selectedShapes.forEach(shape => {
      minX = Math.min(minX, shape.x)
      minY = Math.min(minY, shape.y)
      maxX = Math.max(maxX, shape.x + shape.width)
      maxY = Math.max(maxY, shape.y + shape.height)
    })

    const width = maxX - minX
    const height = maxY - minY

    // Create boolean group shape
    const booleanGroup = createShape('boolean', {
      position: {
        x: minX,
        y: minY,
        width: Math.max(10, width),
        height: Math.max(10, height),
        rotation: 0
      },
      frameId,
      meta: {
        operation: operation.replace('boolean-', ''), // 'unite', 'subtract', 'intersect', 'exclude'
        childrenData: selectedShapes.map(s => ({
          id: s.id,
          type: s.type,
          x: s.x,
          y: s.y,
          width: s.width,
          height: s.height,
          color: s.color,
          meta: s.meta
        }))
      }
    })

    // Set children array for layer-like behavior
    booleanGroup.children = selectedShapes.map(s => s.id)

    // Update original shapes to be children of boolean group
    const newShapes = { ...shapes }
    selectedShapes.forEach(shape => {
      newShapes[shape.id] = {
        ...shape,
        parentId: booleanGroup.id,
        frameId: null, // Remove from frame, now belongs to boolean group
        visible: false // Hide children, only render the boolean result
      }
    })

    // Add boolean group to frame (or top level)
    if (frameId) {
      const frame = newShapes[frameId]
      if (frame) {
        // Remove children from frame
        newShapes[frameId] = {
          ...frame,
          children: [
            ...frame.children.filter(id => !selectedShapes.find(s => s.id === id)),
            booleanGroup.id
          ]
        }
      }
    }
    newShapes[booleanGroup.id] = { ...booleanGroup, frameId, parentId: frameId }

    pushUndoState(newShapes)
    setSelectedShapeId(booleanGroup.id)
    setSelectedShapeIds([])

    // Expand the boolean group by default to show children
    setExpandedShapes((prev) => {
      const next = new Set(prev)
      next.add(booleanGroup.id)
      return next
    })
  }

  const expandBooleanGroup = () => {
    if (!selectedObject || selectedObject.type !== 'boolean') return

    const booleanGroup = selectedObject
    const operation = booleanGroup.meta?.operation || 'unite'
    const childrenData = booleanGroup.meta?.childrenData || []

    if (childrenData.length < 2) return

    // Convert shape data to polygon format (reuse logic from rendering)
    const shapeToPolygon = (childData) => {
      const polygon = []
      if (childData.type === 'rect') {
        polygon.push([childData.x, childData.y])
        polygon.push([childData.x + childData.width, childData.y])
        polygon.push([childData.x + childData.width, childData.y + childData.height])
        polygon.push([childData.x, childData.y + childData.height])
      } else if (childData.type === 'circle') {
        const centerX = childData.x + childData.width / 2
        const centerY = childData.y + childData.height / 2
        const radius = Math.min(childData.width, childData.height) / 2
        for (let i = 0; i < 32; i++) {
          const angle = (i / 32) * Math.PI * 2
          polygon.push([
            centerX + Math.cos(angle) * radius,
            centerY + Math.sin(angle) * radius
          ])
        }
      } else if (childData.type === 'triangle') {
        const centerX = childData.x + childData.width / 2
        const centerY = childData.y + childData.height / 2
        const radius = Math.min(childData.width, childData.height) / 2
        for (let i = 0; i < 3; i++) {
          const angle = (i / 3) * Math.PI * 2 - Math.PI / 2
          polygon.push([
            centerX + Math.cos(angle) * radius,
            centerY + Math.sin(angle) * radius
          ])
        }
      } else if (childData.type === 'polygon') {
        const centerX = childData.x + childData.width / 2
        const centerY = childData.y + childData.height / 2
        const radius = Math.min(childData.width, childData.height) / 2
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2
          polygon.push([
            centerX + Math.cos(angle) * radius,
            centerY + Math.sin(angle) * radius
          ])
        }
      } else if (childData.type === 'star') {
        const centerX = childData.x + childData.width / 2
        const centerY = childData.y + childData.height / 2
        const outerRadius = Math.min(childData.width, childData.height) / 2
        const innerRadius = outerRadius / 2.5
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2 - Math.PI / 2
          const radius = i % 2 === 0 ? outerRadius : innerRadius
          polygon.push([
            centerX + Math.cos(angle) * radius,
            centerY + Math.sin(angle) * radius
          ])
        }
      } else if (childData.type === 'path' && childData.meta?.points) {
        const points = childData.meta.points
        for (let i = 0; i < points.length; i += 2) {
          polygon.push([childData.x + points[i], childData.y + points[i + 1]])
        }
      }
      return [polygon]
    }

    try {
      const polygons = childrenData.map(shapeToPolygon)
      let result = polygons[0]

      for (let i = 1; i < polygons.length; i++) {
        switch (operation) {
          case 'unite':
            result = polygonClipping.union(result, polygons[i])
            break
          case 'subtract':
            result = polygonClipping.difference(result, polygons[i])
            break
          case 'intersect':
            result = polygonClipping.intersection(result, polygons[i])
            break
          case 'exclude':
            result = polygonClipping.xor(result, polygons[i])
            break
        }
      }

      if (!result || result.length === 0 || result[0].length === 0) return

      // Convert result to points for new path shape
      const resultRing = result[0][0]
      const points = []
      resultRing.forEach(([x, y]) => {
        points.push(x, y)
      })

      // Create new path shape from boolean result
      const newPath = createShape('path', {
        position: {
          x: 0,
          y: 0,
          width: booleanGroup.width,
          height: booleanGroup.height,
          rotation: booleanGroup.rotation
        },
        frameId: booleanGroup.frameId,
        color: childrenData[0].color,
        meta: {
          points: points,
          closed: true
        }
      })

      // Replace boolean group with path shape
      const newShapes = { ...shapes }

      // Delete boolean group and its children
      delete newShapes[booleanGroup.id]
      booleanGroup.children?.forEach(childId => {
        delete newShapes[childId]
      })

      // Add new path shape
      newShapes[newPath.id] = newPath

      // Update frame's children array if in a frame
      if (booleanGroup.frameId) {
        const frame = newShapes[booleanGroup.frameId]
        if (frame) {
          newShapes[booleanGroup.frameId] = {
            ...frame,
            children: [
              ...frame.children.filter(id => id !== booleanGroup.id),
              newPath.id
            ]
          }
        }
      }

      pushUndoState(newShapes)
      setSelectedShapeId(newPath.id)
    } catch (error) {
      console.error('Failed to expand boolean group:', error)
    }
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
    if (toolId === 'select') {
      if (optionId === 'select-node') {
        setNodeEditMode(true)
        setActiveTool('select')
      }
    }
    if (toolId === 'zoom') {
      if (optionId === 'zoom-in') handleZoomAtPointer('in')
      if (optionId === 'zoom-out') handleZoomAtPointer('out')
    }
    if (toolId === 'shape') handleShapeInsert(optionId.replace('shape-', ''))
    if (toolId === 'draw') handleDrawOption(optionId)
    if (toolId === 'text') handleTextOption(optionId)
    if (toolId === 'align') applyAlignment(optionId)
    if (toolId === 'boolean') applyBooleanOperation(optionId)
    if (toolId === 'crop') {
      if (optionId === 'crop-free') applyCropRatio('free')
      if (optionId === 'crop-1-1') applyCropRatio(1)
      if (optionId === 'crop-4-3') applyCropRatio(4 / 3)
      if (optionId === 'crop-16-9') applyCropRatio(16 / 9)
    }
  }

  const handleFilterSelect = (optionId) => {
    addFilter(optionId)
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

  // Helper function to get fill props based on fillType
  const getFillProps = (shape) => {
    const fillType = shape.fillType || 'solid'

    if (fillType === 'solid') {
      return { fill: shape.color }
    }

    if (fillType === 'gradient') {
      // Convert normalized 0-1 coords to actual shape coords
      const startX = (shape.gradientStart?.x ?? 0) * shape.width
      const startY = (shape.gradientStart?.y ?? 0.5) * shape.height
      const endX = (shape.gradientEnd?.x ?? 1) * shape.width
      const endY = (shape.gradientEnd?.y ?? 0.5) * shape.height

      const startColor = shape.gradientStartColor || shape.color
      const endColor = shape.gradientEndColor || '#ffffff'
      const startOpacity = shape.gradientStartOpacity ?? 1
      const endOpacity = shape.gradientEndOpacity ?? 1

      // Convert hex + opacity to rgba
      const hexToRgba = (hex, opacity) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${opacity})`
      }

      return {
        fillLinearGradientStartPoint: { x: startX, y: startY },
        fillLinearGradientEndPoint: { x: endX, y: endY },
        fillLinearGradientColorStops: [0, hexToRgba(startColor, startOpacity), 1, hexToRgba(endColor, endOpacity)],
      }
    }

    if (fillType === 'image' && shape.fillImageElement) {
      // Image fill - use Pixi-filtered image if available, otherwise original
      const img = pixiFilteredImages[shape.id] || shape.fillImageElement
      const imgRatio = img.width / img.height
      const shapeRatio = shape.width / shape.height

      let scale = 1
      let offsetX = 0
      let offsetY = 0

      if (imgRatio > shapeRatio) {
        scale = shape.height / img.height
        const scaledWidth = img.width * scale
        offsetX = (scaledWidth - shape.width) / 2 / scale
      } else {
        scale = shape.width / img.width
        const scaledHeight = img.height * scale
        offsetY = (scaledHeight - shape.height) / 2 / scale
      }

      return {
        fillPatternImage: img,
        fillPatternRepeat: 'no-repeat',
        fillPatternScaleX: scale,
        fillPatternScaleY: scale,
        fillPatternOffsetX: offsetX,
        fillPatternOffsetY: offsetY,
      }
    }

    // Fallback to solid color
    return { fill: shape.color }
  }

  const renderObject = (frameId, shape) => {
    // Process layer effects
    const effects = shape.effects || []
    const dropShadow = effects.find(e => e.type === 'drop-shadow' && e.enabled)
    const blur = effects.find(e => e.type === 'blur' && e.enabled)
    const backgroundBlur = effects.find(e => e.type === 'background-blur' && e.enabled)
    const noise = effects.find(e => e.type === 'noise' && e.enabled)

    // Build filters array - combine layer effects and color adjustment filters
    const filters = []

    // Layer effects filters
    if (blur || backgroundBlur) filters.push(Konva.Filters.Blur)
    if (noise) {
      filters.push(Konva.Filters.Noise)
      // Add grayscale filter for monochromatic noise
      if (noise.monochromatic !== false) {
        filters.push(Konva.Filters.Grayscale)
      }
    }

    // Color adjustment filters from shape.filters
    const shapeFilters = shape.filters || []
    shapeFilters.forEach(filter => {
      if (!filter.enabled) return

      switch (filter.type) {
        case 'filter-blur':
          filters.push(Konva.Filters.Blur)
          break
        case 'filter-brightness':
          filters.push(Konva.Filters.Brightness)
          break
        case 'filter-contrast':
          filters.push(Konva.Filters.Contrast)
          break
        case 'filter-hsl':
          filters.push(Konva.Filters.HSL)
          break
        case 'filter-hsv':
          filters.push(Konva.Filters.HSV)
          break
        case 'filter-rgb':
          filters.push(Konva.Filters.RGB)
          break
        case 'filter-invert':
          filters.push(Konva.Filters.Invert)
          break
        case 'filter-sepia':
          filters.push(Konva.Filters.Sepia)
          break
        case 'filter-grayscale':
          filters.push(Konva.Filters.Grayscale)
          break
        case 'filter-enhance':
          filters.push(Konva.Filters.Enhance)
          break
        case 'filter-pixelate':
          filters.push(Konva.Filters.Pixelate)
          break
        case 'filter-posterize':
          filters.push(Konva.Filters.Posterize)
          break
        case 'filter-solarize':
          filters.push(Konva.Filters.Solarize)
          break
        case 'filter-emboss':
          filters.push(Konva.Filters.Emboss)
          break
        case 'filter-noise':
          filters.push(Konva.Filters.Noise)
          break
        case 'filter-threshold':
          filters.push(Konva.Filters.Threshold)
          break
      }
    })

    const commonProps = {
      ref: (node) => {
        if (node) {
          nodeRefs.current.set(shape.id, node)

          // Apply filter parameters from shape.filters
          shapeFilters.forEach(filter => {
            if (!filter.enabled) return

            Object.entries(filter.params).forEach(([key, value]) => {
              if (node[key]) {
                node[key](value)
              }
            })
          })

          // Cache the node if filters are applied (required for filters to work)
          if (filters.length > 0) {
            // Clear cache first, then re-cache to apply filter changes
            node.clearCache()
            node.cache()
            node.getLayer()?.batchDraw()
          }
        } else {
          nodeRefs.current.delete(shape.id)
        }
      },
      rotation: shape.rotation,
      draggable: !nodeEditMode, // Disable dragging in node edit mode
      listening: true, // Always listen for events
      opacity: shape.opacity,
      globalCompositeOperation: shape.blendMode || 'source-over',
      // Apply drop shadow
      ...(dropShadow && {
        shadowColor: dropShadow.color,
        shadowBlur: dropShadow.blur,
        shadowOffsetX: dropShadow.offsetX,
        shadowOffsetY: dropShadow.offsetY,
        shadowOpacity: dropShadow.opacity ?? 1,
        shadowEnabled: true,
      }),
      // Apply filters
      ...(filters.length > 0 && {
        filters: filters,
      }),
      // Apply blur radius - check both layer effects and filter blur
      ...(() => {
        const layerBlurRadius = blur?.radius || backgroundBlur?.radius
        const filterBlur = shapeFilters.find(f => f.enabled && f.type === 'filter-blur')
        const filterBlurRadius = filterBlur?.params?.blurRadius

        // Use the maximum blur radius if both exist, or whichever exists
        const blurRadius = layerBlurRadius && filterBlurRadius
          ? Math.max(layerBlurRadius, filterBlurRadius)
          : (layerBlurRadius || filterBlurRadius)

        return blurRadius ? { blurRadius } : {}
      })(),
      // Apply noise amount
      ...(noise && {
        noise: noise.amount,
      }),
      // Apply noise monochromatic setting
      ...(noise && noise.monochromatic !== undefined && {
        noiseMonochromatic: noise.monochromatic,
      }),
      onClick: (e) => {
        console.log('Shape clicked:', shape.id, shape.type)
        e.cancelBubble = true
        handleCanvasSelection(frameId, shape.id, e)
      },
      onTap: (e) => {
        console.log('Shape tapped:', shape.id, shape.type)
        e.cancelBubble = true
        handleCanvasSelection(frameId, shape.id, e)
      },
      onDragStart: (e) => handleObjectDragStart(frameId, shape, e),
      onDragEnd: (e) => handleObjectDragEnd(frameId, shape.id, shape.type, e.target),
      onTransformEnd: (e) => handleObjectTransformEnd(frameId, shape.id, shape.type, e.target),
      onTransform: (e) => e.target.getLayer().batchDraw(),
    }

    // Get fill props based on fillType (solid, gradient, image)
    const fillProps = getFillProps(shape)

    if (shape.type === 'rect') {
      return <Rect key={shape.id} {...commonProps} x={shape.x} y={shape.y} width={shape.width} height={shape.height} {...fillProps} />
    }
    if (shape.type === 'circle') {
      const radius = Math.min(shape.width, shape.height) / 2
      return <Circle key={shape.id} {...commonProps} x={shape.x + shape.width / 2} y={shape.y + shape.height / 2} radius={radius} {...fillProps} />
    }
    if (shape.type === 'triangle' || shape.type === 'polygon') {
      const sides = shape.type === 'triangle' ? 3 : 6
      const radius = Math.min(shape.width, shape.height) / 2
      return <RegularPolygon key={shape.id} {...commonProps} x={shape.x + shape.width / 2} y={shape.y + shape.height / 2} sides={sides} radius={radius} {...fillProps} />
    }
    if (shape.type === 'star') {
      const outer = Math.min(shape.width, shape.height) / 2
      return <Star key={shape.id} {...commonProps} x={shape.x + shape.width / 2} y={shape.y + shape.height / 2} numPoints={5} innerRadius={outer / 2.5} outerRadius={outer} {...fillProps} />
    }
    if (shape.type === 'line' || shape.type === 'scribble') {
      return <Line key={shape.id} {...commonProps} x={shape.x} y={shape.y} points={shape.meta?.points ?? []} stroke={shape.color} strokeWidth={shape.type === 'line' ? 4 : 3} lineCap="round" lineJoin="round" />
    }
    if (shape.type === 'path') {
      const isClosed = shape.meta?.closed ?? false
      const points = shape.meta?.points ?? []

      // For closed paths, use Line with closed=true and fill only
      if (isClosed) {
        return (
          <Line
            key={shape.id}
            {...commonProps}
            x={shape.x}
            y={shape.y}
            points={points}
            closed={true}
            {...fillProps}
            fillEnabled={true}
            stroke="transparent"
            strokeWidth={0}
            strokeEnabled={false}
            shadowEnabled={false}
            perfectDrawEnabled={false}
          />
        )
      }

      // For open paths, only render stroke (no fill)
      return (
        <Line
          key={shape.id}
          {...commonProps}
          x={shape.x}
          y={shape.y}
          points={points}
          stroke={shape.color}
          strokeWidth={3}
          lineCap="round"
          lineJoin="round"
        />
      )
    }
    if (shape.type === 'boolean') {
      // In node edit mode, render the actual child shapes for selection
      if (nodeEditMode && shape.children) {
        return shape.children.map(childId => {
          const childShape = shapes[childId]
          if (!childShape) return null
          return renderObject(frameId, childShape)
        })
      }

      // Render boolean operation result
      const operation = shape.meta?.operation || 'unite'
      const childrenData = shape.meta?.childrenData || []

      if (childrenData.length < 2) return null

      // Convert any shape to polygon format
      const shapeToPolygon = (childData) => {
        const polygon = []

        if (childData.type === 'rect') {
          // Rectangle: 4 corners
          polygon.push([childData.x, childData.y])
          polygon.push([childData.x + childData.width, childData.y])
          polygon.push([childData.x + childData.width, childData.y + childData.height])
          polygon.push([childData.x, childData.y + childData.height])
        } else if (childData.type === 'circle') {
          // Circle: approximate with 32 points
          const centerX = childData.x + childData.width / 2
          const centerY = childData.y + childData.height / 2
          const radius = Math.min(childData.width, childData.height) / 2
          for (let i = 0; i < 32; i++) {
            const angle = (i / 32) * Math.PI * 2
            polygon.push([
              centerX + Math.cos(angle) * radius,
              centerY + Math.sin(angle) * radius
            ])
          }
        } else if (childData.type === 'triangle') {
          // Triangle: 3 points of equilateral triangle
          const centerX = childData.x + childData.width / 2
          const centerY = childData.y + childData.height / 2
          const radius = Math.min(childData.width, childData.height) / 2
          for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2 - Math.PI / 2
            polygon.push([
              centerX + Math.cos(angle) * radius,
              centerY + Math.sin(angle) * radius
            ])
          }
        } else if (childData.type === 'polygon') {
          // Hexagon: 6 points
          const centerX = childData.x + childData.width / 2
          const centerY = childData.y + childData.height / 2
          const radius = Math.min(childData.width, childData.height) / 2
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2
            polygon.push([
              centerX + Math.cos(angle) * radius,
              centerY + Math.sin(angle) * radius
            ])
          }
        } else if (childData.type === 'star') {
          // Star: 10 points (5 outer + 5 inner)
          const centerX = childData.x + childData.width / 2
          const centerY = childData.y + childData.height / 2
          const outerRadius = Math.min(childData.width, childData.height) / 2
          const innerRadius = outerRadius / 2.5
          for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2 - Math.PI / 2
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            polygon.push([
              centerX + Math.cos(angle) * radius,
              centerY + Math.sin(angle) * radius
            ])
          }
        } else if (childData.type === 'path' && childData.meta?.points) {
          // Path: use existing points
          const points = childData.meta.points
          for (let i = 0; i < points.length; i += 2) {
            polygon.push([childData.x + points[i], childData.y + points[i + 1]])
          }
        }

        return [polygon]
      }

      try {
        const polygons = childrenData.map(shapeToPolygon)
        let result

        // Apply boolean operation progressively
        result = polygons[0]
        for (let i = 1; i < polygons.length; i++) {
          switch (operation) {
            case 'unite':
              result = polygonClipping.union(result, polygons[i])
              break
            case 'subtract':
              result = polygonClipping.difference(result, polygons[i])
              break
            case 'intersect':
              result = polygonClipping.intersection(result, polygons[i])
              break
            case 'exclude':
              result = polygonClipping.xor(result, polygons[i])
              break
          }
        }

        if (!result || result.length === 0 || result[0].length === 0) return null

        // Convert result to points for rendering
        const resultRing = result[0][0]
        const points = []
        resultRing.forEach(([x, y]) => {
          points.push(x, y)
        })

        return (
          <Line
            key={shape.id}
            {...commonProps}
            x={0}
            y={0}
            points={points}
            closed={true}
            fill={childrenData[0].color}
            fillEnabled={true}
            strokeEnabled={false}
            shadowEnabled={false}
            perfectDrawEnabled={false}
          />
        )
      } catch (error) {
        console.error('Boolean rendering failed:', error)
        return null
      }
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
    if (shape.type === 'photo') {
      const handlePhotoUpload = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = (e) => {
          const file = e.target.files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
              const imageUrl = event.target.result
              // Load the image to get its element
              const img = new window.Image()
              img.src = imageUrl
              img.onload = () => {
                updateShape(shape.id, { imageUrl, imageElement: img })
              }
            }
            reader.readAsDataURL(file)
          }
        }
        input.click()
      }

      // Build rect with image fill or placeholder
      const rectProps = {
        ...commonProps,
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
        onDblClick: handlePhotoUpload,
      }

      if (shape.imageElement && shape.imageElement.width && shape.imageElement.height) {
        // Use Pixi-filtered image if available, otherwise use original
        const imageToUse = pixiFilteredImages[shape.id] || shape.imageElement

        // Has image - use as fill pattern with cover behavior
        rectProps.fillPatternImage = imageToUse
        rectProps.fillPatternRepeat = 'no-repeat'

        // Calculate scale to cover (like CSS object-fit: cover)
        const imgWidth = imageToUse.width
        const imgHeight = imageToUse.height
        const imgRatio = imgWidth / imgHeight
        const frameRatio = shape.width / shape.height

        let scale = 1
        let offsetX = 0
        let offsetY = 0

        if (imgRatio > frameRatio) {
          // Image is wider - fit to height, crop sides
          scale = shape.height / imgHeight
          const scaledWidth = imgWidth * scale
          offsetX = (scaledWidth - shape.width) / 2 / scale
        } else {
          // Image is taller - fit to width, crop top/bottom
          scale = shape.width / imgWidth
          const scaledHeight = imgHeight * scale
          offsetY = (scaledHeight - shape.height) / 2 / scale
        }

        rectProps.fillPatternScaleX = scale
        rectProps.fillPatternScaleY = scale
        rectProps.fillPatternOffsetX = offsetX
        rectProps.fillPatternOffsetY = offsetY
      } else {
        // No image - show placeholder with solid fill (no pattern)
        rectProps.fill = shape.fill || '#fafafa'
        rectProps.fillPatternImage = null
        rectProps.fillPatternScaleX = undefined
        rectProps.fillPatternScaleY = undefined
        rectProps.fillPatternOffsetX = undefined
        rectProps.fillPatternOffsetY = undefined
        if (!shape.imageUrl) {
          rectProps.onClick = handlePhotoUpload
        }
      }

      const photoRect = <Rect key={shape.id} {...rectProps} />

      // Add "Upload Photo" text if no image
      if (!shape.imageElement) {
        const photoText = (
          <KonvaText
            key={`${shape.id}-text`}
            text="Upload Photo"
            x={shape.x}
            y={shape.y + shape.height / 2 - 10}
            width={shape.width}
            align="center"
            fontSize={14}
            fill="#d4d4d8"
            listening={false}
          />
        )
        return [photoRect, photoText]
      }

      return photoRect
    }
    return null
  }

  const handleCanvasSelection = (frameId, shapeId, event) => {
    console.log('handleCanvasSelection called:', { frameId, shapeId })
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
      const deltaX = newX - drag.originalPosition.x
      const deltaY = newY - drag.originalPosition.y

      // Update frame and all its children positions in one state update
      const frame = shapes[drag.frameId]
      if (frame) {
        const newShapes = { ...shapes }

        // Update frame position
        newShapes[drag.frameId] = {
          ...frame,
          x: newX,
          y: newY
        }

        // Move all children with the frame
        if (frame.children) {
          frame.children.forEach(childId => {
            const child = shapes[childId]
            if (child) {
              newShapes[childId] = {
                ...child,
                x: child.x + deltaX,
                y: child.y + deltaY
              }
            }
          })
        }

        setShapes(newShapes)
      }
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
    if (activeTool === 'select') {
      // Use different cursor for node edit mode vs regular select mode
      return nodeEditMode ? 'url(/icons/cursor-node.svg) 0 0, pointer' : 'url(/icons/cursor-selector.svg) 0 0, default'
    }
    if (activeTool === 'pen') return 'crosshair'
    return 'crosshair'
  }, [activeTool, isAltPressed, nodeEditMode])

  return (
    <div className="min-h-screen w-full bg-surface-primary text-[12px] text-auto flex flex-col" style={{ cursor: 'url(/icons/cursor-selector.svg) 0 0, default' }}>
      <TopNav
        fileName={fileName}
        onFileNameChange={setFileName}
        onCanvasSizeClick={() => setCanvasDialog({ open: true, width: canvasSize.width, height: canvasSize.height })}
        onClearDocument={handleClearDocument}
        onGoHome={handleGoHome}
        canvasSize={canvasSize}
      />

      <div className="flex-1 flex overflow-hidden">
        <LayersSidebar
          layers={frames}
          shapes={shapes}
          selectedLayerId={selectedFrame?.id ?? null}
          selectedObjectId={selectedObject?.id ?? null}
          selectedObjectIds={selectedShapeIds}
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
              const wasExpanded = next.has(frameId)
              if (wasExpanded) {
                next.delete(frameId)
                console.log('Collapsing:', frameId, 'remaining:', Array.from(next))
              } else {
                next.add(frameId)
                console.log('Expanding:', frameId, 'all expanded:', Array.from(next))
              }
              return next
            })
          }}
          onToggleLayerVisibility={toggleShapeVisibility}
          onToggleObjectVisibility={(frameId, shapeId) => toggleShapeVisibility(shapeId)}
          onMoveLayer={moveFrame}
          onDeleteLayer={handleDeleteFrame}
          onDeleteObject={handleDeleteShape}
          onAddLayer={handleAddFrame}
          onReorderFrames={handleReorderFrames}
          onReorderObjects={handleReorderObjects}
          onMoveObjectToFrame={handleMoveObjectToFrame}
          onNestFrameInFrame={handleNestFrameInFrame}
          onMoveToInfiniteCanvas={handleMoveToInfiniteCanvas}
          onInsertItem={handleInsertItem}
        />

        <div className="flex-1 flex flex-col bg-surface-tertiary relative min-h-0 overflow-hidden">
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
            selectedObject={selectedObject}
            selectedObjectId={selectedObject?.id ?? null}
            activeTool={activeTool}
            stageCursor={stageCursor}
            stageRef={stageRef}
            transformerRef={transformerRef}
            nodeRefs={nodeRefs}
            dragDraft={dragDraft}
            layoutSettings={layoutSettings}
            canvasBackground={canvasBackground}
            marqueeSelection={marqueeSelection}
            penPoints={penPoints}
            penPreviewPoint={penPreviewPoint}
            nodeEditMode={nodeEditMode}
            editingNodeIndex={editingNodeIndex}
            onStagePointerDown={handleStagePointerDown}
            onStagePointerMove={handleStagePointerMove}
            onStagePointerUp={handleStagePointerUp}
            onArtboardBackgroundClick={handleArtboardBackgroundClick}
            onCanvasSelection={handleCanvasSelection}
            onObjectDragStart={handleObjectDragStart}
            onObjectDragEnd={handleObjectDragEnd}
            onObjectTransformEnd={handleObjectTransformEnd}
            onBeginArtboardDrag={beginArtboardDrag}
            onNodeDragStart={(nodeIndex) => setEditingNodeIndex(nodeIndex)}
            onNodeDrag={(nodeIndex, x, y) => handleNodeDrag(nodeIndex, x, y)}
            onNodeDragEnd={() => setEditingNodeIndex(null)}
            renderObject={renderObject}
            renderDraftGrid={renderDraftGrid}
            onGradientHandleDrag={handleGradientHandleDrag}
          />
        </div>

        <Inspector
          selectedLayer={selectedFrame}
          selectedObject={selectedObject}
          canvasBackground={canvasBackground}
          onLayerNameChange={(name) => {
            if (selectedFrame) updateShape(selectedFrame.id, { name })
          }}
          onLayerBackgroundChange={(colorData) => {
            if (selectedFrame) {
              // colorData is {color: '#hex', opacity: 0-1}
              const updates = {}
              if (colorData.color) updates.fillColor = colorData.color
              if (colorData.opacity !== undefined) updates.fillOpacity = colorData.opacity
              updateShape(selectedFrame.id, updates)
            } else {
              // For global canvas background, build rgba string
              const rgba = `rgba(${parseInt(colorData.color.slice(1,3), 16)}, ${parseInt(colorData.color.slice(3,5), 16)}, ${parseInt(colorData.color.slice(5,7), 16)}, ${colorData.opacity})`
              setCanvasBackground(rgba)
            }
          }}
          onLayerPropertyChange={(prop, value) => {
            if (selectedFrame) {
              // For blendMode and effects, keep as-is; for numeric props, parse as float
              const parsedValue = (prop === 'blendMode' || prop === 'effects') ? value : parseFloat(value)
              updateShape(selectedFrame.id, { [prop]: parsedValue })
            }
          }}
          onObjectPropertyChange={handlePositionInput}
          onObjectColorChange={handleColorChange}
          onObjectOpacityChange={handleOpacityChange}
          onObjectTextChange={(prop, value) => {
            if (selectedObject) updateShape(selectedObject.id, { [prop]: value })
          }}
          onExpandBooleanGroup={expandBooleanGroup}
          onUpdateFilterParams={(shapeId, filterId, params) => {
            updateFilterParams(shapeId, filterId, params)
          }}
          onRemoveFilter={(shapeId, filterId) => {
            removeFilter(shapeId, filterId)
          }}
          onToggleFilterEnabled={(shapeId, filterId) => {
            toggleFilterEnabled(shapeId, filterId)
          }}
        />
      </div>

      {canvasDialog.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center text-[12px]">
          <div className="bg-surface-primary border border-fg-08 rounded-lg p-4 w-[320px] space-y-3">
            <div className="text-fg-64 uppercase tracking-wide">Canvas Size</div>
            <div className="flex gap-2">
              <label className="flex-1 flex flex-col gap-1 text-fg-48">
                Width
                <input
                  type="number"
                  value={canvasDialog.width}
                  min={200}
                  onChange={(e) => setCanvasDialog((prev) => ({ ...prev, width: Number(e.target.value) }))}
                  className="bg-container-primary border border-fg-08 rounded px-2 py-1 text-auto"
                />
              </label>
              <label className="flex-1 flex flex-col gap-1 text-fg-48">
                Height
                <input
                  type="number"
                  value={canvasDialog.height}
                  min={200}
                  onChange={(e) => setCanvasDialog((prev) => ({ ...prev, height: Number(e.target.value) }))}
                  className="bg-container-primary border border-fg-08 rounded px-2 py-1 text-auto"
                />
              </label>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button className="px-3 py-1 rounded bg-container-primary text-fg-88" onClick={() => setCanvasDialog((prev) => ({ ...prev, open: false }))}>
                Cancel
              </button>
              <button className="px-3 py-1 rounded bg-surface-on-primary text-auto" onClick={handleCanvasDialogSave}>
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
