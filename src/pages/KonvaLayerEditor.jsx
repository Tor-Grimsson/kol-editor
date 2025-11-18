import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Circle,
  Layer as KonvaLayer,
  Line,
  Rect,
  RegularPolygon,
  Stage,
  Star,
  Text as KonvaText,
  Transformer,
} from 'react-konva'

import Icon from '../components/Icon'
import PointerIcon from '../assets/icons/custom/pointer.svg'
import ZoomIcon from '../assets/icons/tui/zoom.svg'
import CropIcon from '../assets/icons/tui/crop.svg'
import FlipXIcon from '../assets/icons/tui/flip-x.svg'
import FlipYIcon from '../assets/icons/tui/flip-y.svg'
import RotateLeftIcon from '../assets/icons/tui/rotate-left.svg'
import RotateRightIcon from '../assets/icons/tui/rotate-right.svg'
import DrawIcon from '../assets/icons/tui/draw.svg'
import ShapeIcon from '../assets/icons/tui/shape.svg'
import TextIcon from '../assets/icons/tui/text.svg'

const DEFAULT_CANVAS = { width: 1200, height: 700 }
const BASE_COLORS = ['#22d3ee', '#f472b6', '#a78bfa', '#4ade80', '#facc15']
const RULER_STEP = 100
const dropdownDefaults = { toolId: null, left: 0 }

const TOOLBAR_LAYOUT = [
  { id: 'select', icon: PointerIcon, label: 'Select', dropdown: true },
  { id: 'zoom', icon: ZoomIcon, label: 'Zoom', dropdown: true },
  { id: 'crop', icon: CropIcon, label: 'Crop', dropdown: true },
  { type: 'separator', id: 'separator-1' },
  { id: 'flipX', icon: FlipXIcon, label: 'Flip H' },
  { id: 'flipY', icon: FlipYIcon, label: 'Flip V' },
  { id: 'rotateLeft', icon: RotateLeftIcon, label: 'Rotate Left' },
  { id: 'rotateRight', icon: RotateRightIcon, label: 'Rotate Right' },
  { type: 'separator', id: 'separator-2' },
  { id: 'draw', icon: DrawIcon, label: 'Brush', dropdown: true },
  { id: 'shape', icon: ShapeIcon, label: 'Shape', dropdown: true },
  { id: 'text', icon: TextIcon, label: 'Text', dropdown: true },
]

const TOOL_SUBMENUS = {
  select: [
    { id: 'select-marquee', label: 'Marquee', icon: 'shape-square' },
    { id: 'select-pan', label: 'Pan', icon: 'move' },
    { id: 'select-multi', label: 'Multi-select', icon: 'objects-horizontal-center' },
  ],
  zoom: [
    { id: 'zoom-in', label: 'Zoom In', icon: 'plus-medical' },
    { id: 'zoom-out', label: 'Zoom Out (Alt)', icon: 'minus-front' },
  ],
  crop: [
    { id: 'crop-free', label: 'Free', icon: 'trim' },
    { id: 'crop-1-1', label: '1:1', icon: 'grid-small' },
    { id: 'crop-4-3', label: '4:3', icon: 'grid-horizontal' },
    { id: 'crop-16-9', label: '16:9', icon: 'grid-vertical' },
  ],
  draw: [
    { id: 'draw-free', label: 'Free Draw', icon: 'brush' },
    { id: 'draw-line', label: 'Line', icon: 'pen2' },
    { id: 'draw-eraser', label: 'Eraser', icon: 'trash' },
  ],
  shape: [
    { id: 'shape-rect', label: 'Rectangle', icon: 'shape-square' },
    { id: 'shape-circle', label: 'Circle', icon: 'shape-circle' },
    { id: 'shape-triangle', label: 'Triangle', icon: 'shape-triangle' },
    { id: 'shape-star', label: 'Star', icon: 'star' },
    { id: 'shape-polygon', label: 'Polygon', icon: 'shape-polygon' },
  ],
  text: [
    { id: 'text-add', label: 'Add Text', icon: 'pencil' },
    { id: 'text-fonts', label: 'Cycle Font', icon: 'objects-horizontal-center' },
    { id: 'text-styles', label: 'Toggle Bold', icon: 'bold' },
  ],
}

const FILTER_OPTIONS = [
  { id: 'filter-grayscale', label: 'Grayscale' },
  { id: 'filter-brightness', label: 'Brightness +' },
  { id: 'filter-contrast', label: 'Contrast +' },
  { id: 'filter-hue', label: 'Shift Hue' },
  { id: 'filter-dim', label: 'Dim' },
]

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const hexToHsb = (hex) => {
  if (!hex) return { h: 0, s: 0, b: 0 }
  let clean = hex.replace('#', '')
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((ch) => ch + ch)
      .join('')
  }
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : delta / max
  const brightness = max
  return { h: Math.round(h), s: Math.round(s * 100), b: Math.round(brightness * 100) }
}

const hsbToHex = (h, s, b) => {
  const sat = clamp(s, 0, 100) / 100
  const bright = clamp(b, 0, 100) / 100
  const chroma = bright * sat
  const hh = clamp(h, 0, 360) / 60
  const x = chroma * (1 - Math.abs((hh % 2) - 1))
  let [r1, g1, b1] = [0, 0, 0]
  if (hh >= 0 && hh < 1) [r1, g1, b1] = [chroma, x, 0]
  else if (hh >= 1 && hh < 2) [r1, g1, b1] = [x, chroma, 0]
  else if (hh >= 2 && hh < 3) [r1, g1, b1] = [0, chroma, x]
  else if (hh >= 3 && hh < 4) [r1, g1, b1] = [0, x, chroma]
  else if (hh >= 4 && hh < 5) [r1, g1, b1] = [x, 0, chroma]
  else if (hh >= 5 && hh <= 6) [r1, g1, b1] = [chroma, 0, x]
  const m = bright - chroma
  const rgb = [r1 + m, g1 + m, b1 + m].map((value) =>
    clamp(Math.round(value * 255), 0, 255)
      .toString(16)
      .padStart(2, '0'),
  )
  return `#${rgb.join('').toUpperCase()}`
}

const randomFromPalette = (index) => BASE_COLORS[index % BASE_COLORS.length]

const createCanvasDescriptor = (index, overrides = {}) => ({
  id: overrides.id ?? `canvas-${index}`,
  name: `Canvas ${index}`,
  background: '#18181b',
  frame: { x: 0, y: 0, width: DEFAULT_CANVAS.width, height: DEFAULT_CANVAS.height, ...(overrides.frame || {}) },
  visible: true,
  objects: [],
  ...overrides,
})

const KonvaLayerEditor = () => {
  const [layers, setLayers] = useState(() => [createCanvasDescriptor(1)])
  const [selectedLayerId, setSelectedLayerId] = useState('canvas-1')
  const [selectedObjectId, setSelectedObjectId] = useState(null)
  const [expandedLayers, setExpandedLayers] = useState(() => new Set())
  const [zoomLevel, setZoomLevel] = useState(1)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })
  const [artboardPosition, setArtboardPosition] = useState({ x: 0, y: 0 })
  const [activeTool, setActiveTool] = useState('select')
  const [dropdownState, setDropdownState] = useState(dropdownDefaults)
  const [canvasSize, setCanvasSize] = useState(DEFAULT_CANVAS)
  const [canvasDialog, setCanvasDialog] = useState({ open: false, width: DEFAULT_CANVAS.width, height: DEFAULT_CANVAS.height })
  const [pendingInsert, setPendingInsert] = useState(null)
  const [dragDraft, setDragDraft] = useState(null)
  const [isAltPressed, setIsAltPressed] = useState(false)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const [inspectorFilter, setInspectorFilter] = useState(null)
  const [layoutSettings, setLayoutSettings] = useState({ columns: 1, rows: 1, gutter: 0, showGrid: false })
  const [toolSelections, setToolSelections] = useState({})

  const stageRef = useRef(null)
  const transformerRef = useRef(null)
  const nodeRefs = useRef(new Map())
  const toolbarRef = useRef(null)
  const toolbarButtonRefs = useRef(new Map())
  const nextLayerIndexRef = useRef(2)
  const nextObjectIdRef = useRef(1)
  const colorIndexRef = useRef(0)
  const cloneDragRef = useRef(null)
  const undoStackRef = useRef([])
  const redoStackRef = useRef([])

  const selectedLayer = useMemo(() => layers.find((layer) => layer.id === selectedLayerId) ?? null, [layers, selectedLayerId])
  const selectedObject = useMemo(() => selectedLayer?.objects?.find((obj) => obj.id === selectedObjectId) ?? null, [selectedLayer, selectedObjectId])
  const selectedColorHsb = useMemo(() => (selectedObject ? hexToHsb(selectedObject.color) : { h: 0, s: 0, b: 0 }), [selectedObject?.color])
  const selectedOpacityPercent = useMemo(() => Math.round((selectedObject?.opacity ?? 1) * 100), [selectedObject?.opacity])
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

  const pushUndoState = (snapshot) => {
    undoStackRef.current.push(JSON.stringify(layers))
    redoStackRef.current = []
    setLayers(snapshot)
  }

  const handleUndo = () => {
    const last = undoStackRef.current.pop()
    if (!last) return
    redoStackRef.current.push(JSON.stringify(layers))
    setLayers(JSON.parse(last))
  }

  const handleRedo = () => {
    const next = redoStackRef.current.pop()
    if (!next) return
    undoStackRef.current.push(JSON.stringify(layers))
    setLayers(JSON.parse(next))
  }

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    stage.scale({ x: zoomLevel, y: zoomLevel })
    stage.position(stagePosition)
    stage.batchDraw()
  }, [zoomLevel, stagePosition])

  useEffect(() => {
    const selectedCanvas = layers.find((layer) => layer.id === selectedLayerId)
    if (!selectedCanvas) return
    const { frame } = selectedCanvas
    const needsPositionUpdate = frame.x !== artboardPosition.x || frame.y !== artboardPosition.y
    const needsSizeUpdate = frame.width !== canvasSize.width || frame.height !== canvasSize.height
    if (needsPositionUpdate) {
      setArtboardPosition({ x: frame.x, y: frame.y })
    }
    if (needsSizeUpdate) {
      setCanvasSize({ width: frame.width, height: frame.height })
    }
  }, [selectedLayerId, layers])

  useEffect(() => {
    const transformer = transformerRef.current
    const node = selectedObjectId ? nodeRefs.current.get(selectedObjectId) : null
    if (transformer && node && node.getStage()) {
      transformer.nodes([node])
      transformer.getLayer()?.batchDraw()
    } else if (transformer) {
      transformer.nodes([])
      transformer.getLayer()?.batchDraw()
    }
  }, [selectedObjectId, selectedObject])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    stage.scale({ x: zoomLevel, y: zoomLevel })
    stage.position(stagePosition)
    stage.batchDraw()
  }, [zoomLevel, stagePosition])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownState.toolId && !toolbarRef.current?.contains(event.target)) setDropdownState(dropdownDefaults)
      if (filterMenuOpen && !toolbarRef.current?.contains(event.target)) setFilterMenuOpen(false)
      if (colorPickerOpen && event.target?.dataset?.colorpanel !== 'true') setColorPickerOpen(false)
    }
    document.addEventListener('pointerdown', handleOutsideClick)
    return () => document.removeEventListener('pointerdown', handleOutsideClick)
  }, [dropdownState.toolId, filterMenuOpen, colorPickerOpen])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Alt') setIsAltPressed(true)
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
      if (event.key === 'Escape') {
        setPendingInsert(null)
        setDragDraft(null)
        setSelectedObjectId(null)
      }
      if (['INPUT', 'TEXTAREA'].includes(event.target.tagName) || event.target.isContentEditable) return
      if (event.key === 'v' || event.key === 'V') {
        setActiveTool('select')
        setDropdownState(dropdownDefaults)
        setPendingInsert(null)
      }
      if (event.key === 'Backspace') {
        if (selectedLayerId && selectedObjectId) {
          handleDeleteObject(selectedLayerId, selectedObjectId)
          event.preventDefault()
        } else if (selectedLayerId) {
          handleDeleteLayer(selectedLayerId)
          event.preventDefault()
        }
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
  }, [selectedLayerId, selectedObjectId])

  const ensureLayerExpanded = (layerId) => {
    setExpandedLayers((prev) => {
      if (prev.has(layerId)) return prev
      const next = new Set(prev)
      next.add(layerId)
      return next
    })
  }

  const getDefaultFrame = () => ({ x: canvasSize.width / 2 - 100, y: canvasSize.height / 2 - 80, width: 200, height: 160, rotation: 0 })

  const createObject = (type, overrides = {}) => {
    const id = `object-${nextObjectIdRef.current++}`
    const color = overrides.color ?? randomFromPalette(colorIndexRef.current++)
    return {
      id,
      type,
      name: overrides.name ?? type.charAt(0).toUpperCase() + type.slice(1),
      visible: true,
      opacity: 1,
      color,
      frame: overrides.frame ?? getDefaultFrame(),
      meta: overrides.meta ?? {},
      text: overrides.text ?? 'JetBrains Mono',
      fontFamily: overrides.fontFamily ?? 'JetBrains Mono, monospace',
      fontSize: overrides.fontSize ?? 32,
      fontStyle: overrides.fontStyle ?? 'normal',
    }
  }

  const ensureLayerForObject = () => {
    if (selectedLayerId) return selectedLayerId
    if (layers.length > 0) {
      const last = layers[layers.length - 1]
      setSelectedLayerId(last.id)
      ensureLayerExpanded(last.id)
      return last.id
    }
    const newLayerId = `layer-${nextLayerIndexRef.current++}`
    pushUndoState([...layers, { id: newLayerId, name: `Layer ${nextLayerIndexRef.current - 1}`, visible: true, objects: [] }])
    setSelectedLayerId(newLayerId)
    ensureLayerExpanded(newLayerId)
    return newLayerId
  }

  const appendObjectToLayer = (layerId, object) => {
    pushUndoState(
      layers.map((layer) => (layer.id === layerId ? { ...layer, objects: [...layer.objects, object] } : layer)),
    )
    setSelectedLayerId(layerId)
    setSelectedObjectId(object.id)
    ensureLayerExpanded(layerId)
  }

  const updateObjectFrame = (layerId, objectId, updates) => {
    pushUndoState(
      layers.map((layer) => {
        if (layer.id !== layerId) return layer
        return {
          ...layer,
          objects: layer.objects.map((obj) =>
            obj.id === objectId ? { ...obj, frame: { ...obj.frame, ...updates } } : obj,
          ),
        }
      }),
    )
  }

  const updateObject = (layerId, objectId, mapper) => {
    pushUndoState(
      layers.map((layer) => {
        if (layer.id !== layerId) return layer
        return {
          ...layer,
          objects: layer.objects.map((obj) => (obj.id === objectId ? mapper(obj) : obj)),
        }
      }),
    )
  }

  const handleAddLayer = () => {
    const index = nextLayerIndexRef.current++
    const canvasId = `canvas-${index}`
    const newCanvas = createCanvasDescriptor(index, {
      id: canvasId,
      frame: {
        x: Math.max(0, artboardPosition.x + 40),
        y: Math.max(0, artboardPosition.y + 40),
        width: canvasSize.width,
        height: canvasSize.height,
      },
    })
    pushUndoState([...layers, newCanvas])
    setSelectedLayerId(canvasId)
    setSelectedObjectId(null)
    ensureLayerExpanded(id)
  }

  const handleDeleteLayer = (layerId) => {
    if (layers.length === 1) return
    const next = layers.filter((layer) => layer.id !== layerId)
    pushUndoState(next)
    if (selectedLayerId === layerId) {
      const fallback = next[next.length - 1]
      setSelectedLayerId(fallback?.id ?? null)
      setSelectedObjectId(null)
    }
    setExpandedLayers((prev) => {
      const copy = new Set(prev)
      copy.delete(layerId)
      return copy
    })
  }

  const toggleLayerVisibility = (layerId) => {
    pushUndoState(
      layers.map((layer) => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer)),
    )
  }

  const toggleObjectVisibility = (layerId, objectId) => {
    updateObject(layerId, objectId, (obj) => ({ ...obj, visible: !obj.visible }))
  }

  const handleDeleteObject = (layerId, objectId) => {
    const next = layers
      .map((layer) => {
        if (layer.id !== layerId) return layer
        return { ...layer, objects: layer.objects.filter((obj) => obj.id !== objectId) }
      })
      .filter((layer) => layer.objects.length > 0 || layer.id !== layerId)
    pushUndoState(next)
    if (selectedObjectId === objectId) setSelectedObjectId(null)
  }

  const moveLayer = (layerId, direction) => {
    const index = layers.findIndex((layer) => layer.id === layerId)
    if (index < 0) return
    const target = index + direction
    if (target < 0 || target >= layers.length) return
    const next = [...layers]
    const [removed] = next.splice(index, 1)
    next.splice(target, 0, removed)
    pushUndoState(next)
  }

  const handleToolbarButton = (toolId) => {
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

  const toggleDropdown = (toolId) => {
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
      const layerId = ensureLayerForObject()
      setDragDraft({ layerId, kind: 'shape', shapeType: pendingInsert.shapeType, start: pointer, current: pointer, shift: e.evt?.shiftKey })
      return
    }

    if (activeTool === 'zoom') {
      handleZoomAtPointer(e.evt?.altKey ? 'out' : 'in')
      return
    }

    if (activeTool === 'select' && e.target === stage) {
      const { x, y } = stage.getPointerPosition()
      const withinX = x >= artboardPosition.x && x <= artboardPosition.x + canvasSize.width
      const withinY = y >= artboardPosition.y && y <= artboardPosition.y + canvasSize.height
      if (!withinX || !withinY) {
        setSelectedObjectId(null)
        return
      }
      setSelectedObjectId(null)
    }
  }

  const handleArtboardBackgroundClick = (e) => {
    if (activeTool !== 'select') return
    e.cancelBubble = true
    setSelectedObjectId(null)
  }

  const handleStagePointerMove = (e) => {
    if (dragDraft?.kind === 'shape') {
      const pointer = e.target.getStage().getPointerPosition()
      setDragDraft((prev) => (prev ? { ...prev, current: pointer, shift: e.evt?.shiftKey } : prev))
    }
  }

  const finalizeShapeDraft = () => {
    if (!dragDraft) return
    const { start, current, shift, shapeType, layerId } = dragDraft
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
    const frame = {
      x: Math.min(start.x, current.x),
      y: Math.min(start.y, current.y),
      width: finalWidth,
      height: finalHeight,
      rotation: 0,
    }
    const object = createObject(shapeType, { frame })
    appendObjectToLayer(layerId, object)
    setDragDraft(null)
  }

  const handleStagePointerUp = () => {
    if (dragDraft?.kind === 'shape') finalizeShapeDraft()
  }

  const normalizePosition = (type, frame, node) => {
    if (['rect', 'text'].includes(type)) return { x: node.x(), y: node.y() }
    const width = frame.width
    const height = frame.height
    return { x: node.x() - width / 2, y: node.y() - height / 2 }
  }

  const handleObjectDragStart = (layerId, object, event) => {
    if (event.evt?.altKey) {
      event.target.stopDrag()
      const clone = { ...object, id: `object-${nextObjectIdRef.current++}`, name: `${object.name} copy` }
      pushUndoState(
        layers.map((layer) => (layer.id === layerId ? { ...layer, objects: [...layer.objects, clone] } : layer)),
      )
      setSelectedLayerId(layerId)
      setSelectedObjectId(clone.id)
      ensureLayerExpanded(layerId)
      cloneDragRef.current = clone.id
      requestAnimationFrame(() => {
        const clonedNode = nodeRefs.current.get(clone.id)
        if (clonedNode) clonedNode.startDrag()
      })
    }
  }

  const handleObjectDragEnd = (layerId, objectId, type, node, frame) => {
    if (cloneDragRef.current && cloneDragRef.current === objectId) cloneDragRef.current = null
    const position = normalizePosition(type, frame, node)
    updateObjectFrame(layerId, objectId, position)
  }

  const handleObjectTransformEnd = (layerId, objectId, type, node) => {
    const width = Math.max(10, node.width() * node.scaleX())
    const height = Math.max(10, node.height() * node.scaleY())
    node.scaleX(1)
    node.scaleY(1)
    const position = normalizePosition(type, { width, height }, node)
    updateObjectFrame(layerId, objectId, {
      ...position,
      width,
      height,
      rotation: node.rotation(),
    })
  }

  const handlePositionInput = (prop, value) => {
    if (!selectedLayer || !selectedObject) return
    const numeric = prop === 'rotation' ? Number(value) : Math.max(0, Number(value))
    updateObjectFrame(selectedLayer.id, selectedObject.id, { [prop]: numeric })
  }

  const handleColorHsbChange = (channel, value) => {
    if (!selectedLayer || !selectedObject) return
    const hsb = { ...selectedColorHsb, [channel]: Number(value) }
    const hex = hsbToHex(hsb.h, hsb.s, hsb.b)
    updateObject(selectedLayer.id, selectedObject.id, (obj) => ({ ...obj, color: hex }))
  }

  const handleOpacityChange = (value) => {
    if (!selectedLayer || !selectedObject) return
    const percent = clamp(Number(value), 0, 100)
    updateObject(selectedLayer.id, selectedObject.id, (obj) => ({ ...obj, opacity: percent / 100 }))
  }

  const applyCropRatio = (ratio) => {
    if (!selectedLayer || !selectedObject) return
    const { frame } = selectedObject
    const cx = frame.x + frame.width / 2
    const cy = frame.y + frame.height / 2
    let width = frame.width
    let height = frame.height
    if (ratio !== 'free') {
      width = Math.max(40, frame.height * ratio)
      height = Math.max(40, width / ratio)
    }
    updateObjectFrame(selectedLayer.id, selectedObject.id, {
      width,
      height,
      x: cx - width / 2,
      y: cy - height / 2,
    })
  }

  const applyRotation = (delta) => {
    if (!selectedLayer || !selectedObject) return
    updateObjectFrame(selectedLayer.id, selectedObject.id, {
      rotation: selectedObject.frame.rotation + delta,
    })
  }

  const applyFlip = (axis) => {
    if (!selectedLayer || !selectedObject) return
    if (axis === 'x') {
      updateObjectFrame(selectedLayer.id, selectedObject.id, {
        rotation: (360 - selectedObject.frame.rotation) % 360,
      })
    } else {
      updateObjectFrame(selectedLayer.id, selectedObject.id, {
        rotation: (180 - selectedObject.frame.rotation) % 360,
      })
    }
  }

  const applyFilter = (optionId) => {
    if (!selectedLayer || !selectedObject) return
    const hsb = { ...selectedColorHsb }
    if (optionId === 'filter-grayscale') hsb.s = 0
    if (optionId === 'filter-brightness') hsb.b = clamp(hsb.b + 10, 0, 100)
    if (optionId === 'filter-contrast') hsb.s = clamp(hsb.s + 10, 0, 100)
    if (optionId === 'filter-hue') hsb.h = (hsb.h + 25) % 360
    if (optionId === 'filter-dim') hsb.b = clamp(hsb.b - 10, 0, 100)
    const hex = hsbToHex(hsb.h, hsb.s, hsb.b)
    updateObject(selectedLayer.id, selectedObject.id, (obj) => ({ ...obj, color: hex }))
    setInspectorFilter({ type: optionId, amount: 50 })
  }

  const handleShapeInsert = (shapeType) => {
    setPendingInsert({ type: 'shape', shapeType })
    setActiveTool('shape')
    setDropdownState(dropdownDefaults)
  }

  const handleDrawOption = (optionId) => {
    if (optionId === 'draw-eraser') {
      if (selectedLayer && selectedObject) handleDeleteObject(selectedLayer.id, selectedObject.id)
      return
    }
    const object =
      optionId === 'draw-line'
        ? createObject('line', {
            name: 'Line',
            frame: { ...getDefaultFrame(), height: 2 },
            meta: { points: [0, 0, 160, 0] },
          })
        : createObject('scribble', {
            name: 'Scribble',
            frame: { ...getDefaultFrame(), height: 2 },
            meta: { points: [0, 0, 30, -20, 80, 10, 120, -10, 170, 0] },
          })
    appendObjectToLayer(ensureLayerForObject(), object)
  }

  const handleTextOption = (optionId) => {
    if (optionId === 'text-add') {
      const object = createObject('text', {
        frame: { ...getDefaultFrame(), height: 60, width: 240 },
      })
      appendObjectToLayer(ensureLayerForObject(), object)
      return
    }
    if (!selectedLayer || !selectedObject || selectedObject.type !== 'text') return
    if (optionId === 'text-fonts') {
      const fonts = ['JetBrains Mono, monospace', 'Space Mono, monospace', 'IBM Plex Mono, monospace']
      const currentIndex = fonts.indexOf(selectedObject.fontFamily)
      const nextFont = fonts[(currentIndex + 1) % fonts.length]
      updateObject(selectedLayer.id, selectedObject.id, (obj) => ({ ...obj, fontFamily: nextFont }))
    }
    if (optionId === 'text-styles') {
      updateObject(selectedLayer.id, selectedObject.id, (obj) => ({ ...obj, fontStyle: obj.fontStyle === 'bold' ? 'normal' : 'bold' }))
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
    setDropdownState(dropdownDefaults)
  }

  const handleFilterSelect = (optionId) => {
    applyFilter(optionId)
    setFilterMenuOpen(false)
  }

  const handleClearDocument = () => {
    pushUndoState([])
    setSelectedLayerId(null)
    setSelectedObjectId(null)
    setExpandedLayers(new Set())
    setPendingInsert(null)
    setDragDraft(null)
  }

  const handleCanvasDialogSave = () => {
    setCanvasSize({ width: canvasDialog.width, height: canvasDialog.height })
    updateSelectedCanvas(() => ({
      frame: {
        x: artboardPosition.x,
        y: artboardPosition.y,
        width: canvasDialog.width,
        height: canvasDialog.height,
      },
    }))
    setCanvasDialog((prev) => ({ ...prev, open: false }))
  }

  const hexDisplay = selectedObject?.color?.toUpperCase() ?? '#000000'
  const showFilterPanel = Boolean(inspectorFilter && selectedLayer && selectedObject)

  const renderObject = (layerId, obj) => {
    const commonProps = {
      ref: (node) => {
        if (node) nodeRefs.current.set(obj.id, node)
        else nodeRefs.current.delete(obj.id)
      },
      rotation: obj.frame.rotation,
      draggable: true,
      opacity: obj.opacity,
      onClick: () => handleCanvasSelection(layerId, obj.id),
      onTap: () => handleCanvasSelection(layerId, obj.id),
      onDragStart: (e) => handleObjectDragStart(layerId, obj, e),
      onDragEnd: (e) => handleObjectDragEnd(layerId, obj.id, obj.type, e.target, obj.frame),
      onTransformEnd: (e) => handleObjectTransformEnd(layerId, obj.id, obj.type, e.target),
      onTransform: (e) => e.target.getLayer().batchDraw(),
    }

    if (obj.type === 'rect') {
      return <Rect key={obj.id} {...commonProps} x={obj.frame.x} y={obj.frame.y} width={obj.frame.width} height={obj.frame.height} fill={obj.color} />
    }
    if (obj.type === 'circle') {
      const radius = Math.min(obj.frame.width, obj.frame.height) / 2
      return <Circle key={obj.id} {...commonProps} x={obj.frame.x + obj.frame.width / 2} y={obj.frame.y + obj.frame.height / 2} radius={radius} fill={obj.color} />
    }
    if (obj.type === 'triangle' || obj.type === 'polygon') {
      const sides = obj.type === 'triangle' ? 3 : 6
      const radius = Math.min(obj.frame.width, obj.frame.height) / 2
      return <RegularPolygon key={obj.id} {...commonProps} x={obj.frame.x + obj.frame.width / 2} y={obj.frame.y + obj.frame.height / 2} sides={sides} radius={radius} fill={obj.color} />
    }
    if (obj.type === 'star') {
      const outer = Math.min(obj.frame.width, obj.frame.height) / 2
      return <Star key={obj.id} {...commonProps} x={obj.frame.x + obj.frame.width / 2} y={obj.frame.y + obj.frame.height / 2} numPoints={5} innerRadius={outer / 2.5} outerRadius={outer} fill={obj.color} />
    }
    if (obj.type === 'line' || obj.type === 'scribble') {
      return <Line key={obj.id} {...commonProps} x={obj.frame.x} y={obj.frame.y} points={obj.meta.points} stroke={obj.color} strokeWidth={obj.type === 'line' ? 4 : 3} lineCap="round" lineJoin="round" />
    }
    if (obj.type === 'text') {
      return (
        <KonvaText
          key={obj.id}
          {...commonProps}
          text={obj.text}
          x={obj.frame.x}
          y={obj.frame.y}
          width={obj.frame.width}
          fill={obj.color}
          fontSize={obj.fontSize}
          fontFamily={obj.fontFamily}
          fontStyle={obj.fontStyle}
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
              updateObject(selectedLayer.id, selectedObject.id, (obj) => ({ ...obj, text: textarea.value }))
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

  const handleCanvasSelection = (layerId, objectId) => {
    setSelectedLayerId(layerId)
    setSelectedObjectId(objectId)
  }

  const renderDraft = () => {
    if (!dragDraft || dragDraft.kind !== 'shape') return null
    const { start, current, shift } = dragDraft
    let width = Math.abs(current.x - start.x)
    let height = Math.abs(current.y - start.y)
    if (shift) {
      const size = Math.max(width, height)
      width = size
      height = size
    }
    const x = Math.min(start.x, current.x)
    const y = Math.min(start.y, current.y)
    return <Rect x={x} y={y} width={width} height={height} fill="rgba(14,165,233,0.2)" stroke="#38bdf8" strokeWidth={1} dash={[6, 4]} />
  }

  const renderColorSection = () => {
    if (!selectedLayer || !selectedObject) return null
    const rows = [
      { label: 'H', key: 'h', min: 0, max: 360, value: selectedColorHsb.h },
      { label: 'S', key: 's', min: 0, max: 100, value: selectedColorHsb.s },
      { label: 'B', key: 'b', min: 0, max: 100, value: selectedColorHsb.b },
    ]
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="uppercase tracking-wide text-zinc-400">Fill</span>
          <button className="text-zinc-500 hover:text-white" onClick={() => setColorPickerOpen((prev) => !prev)}>
            Spectrum
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded border border-zinc-700" style={{ background: hexDisplay }} />
          <div className="flex-1">
            <label className="text-zinc-500 uppercase text-[10px]">HEX</label>
            <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 font-mono text-sm">
              <span>#</span>
              <input
                type="text"
                value={hexDisplay.replace('#', '')}
                onChange={(e) => {
                  const value = `#${e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)}`
                  updateObject(selectedLayer.id, selectedObject.id, (obj) => ({ ...obj, color: value }))
                }}
                className="flex-1 bg-transparent outline-none"
              />
            </div>
          </div>
        </div>
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-2">
            <span className="w-6 text-zinc-400">{row.label}</span>
            <input
              type="range"
              min={row.min}
              max={row.max}
              value={row.value}
              onChange={(e) => handleColorHsbChange(row.key, e.target.value)}
              className="flex-1 accent-blue-500"
            />
            <input
              type="number"
              min={row.min}
              max={row.max}
              value={row.value}
              onChange={(e) => handleColorHsbChange(row.key, e.target.value)}
              className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-center"
            />
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="w-6 text-zinc-400">O</span>
          <input
            type="range"
            min={0}
            max={100}
            value={selectedOpacityPercent}
            onChange={(e) => handleOpacityChange(e.target.value)}
            className="flex-1 accent-blue-500"
          />
          <input
            type="number"
            min={0}
            max={100}
            value={selectedOpacityPercent}
            onChange={(e) => handleOpacityChange(e.target.value)}
            className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-center"
          />
        </div>
        {colorPickerOpen && (
          <div className="relative" data-colorpanel="true">
            <div className="absolute z-20 mt-2 bg-zinc-900 border border-zinc-700 rounded p-3" data-colorpanel="true">
              <input
                type="color"
                data-colorpanel="true"
                value={selectedObject.color}
                onChange={(e) => updateObject(selectedLayer.id, selectedObject.id, (obj) => ({ ...obj, color: e.target.value }))}
                className="w-32 h-32 border border-zinc-700 rounded"
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderDraftGrid = () => {
    if (!layoutSettings.showGrid) return null
    const columns = layoutSettings.columns
    const rows = layoutSettings.rows
    const gutter = layoutSettings.gutter
    const colWidth = (canvasSize.width - gutter * (columns - 1)) / columns
    const rowHeight = (canvasSize.height - gutter * (rows - 1)) / rows
    const elements = []
    for (let c = 0; c < columns; c += 1) {
      elements.push(
        <Rect
          key={`col-${c}`}
          x={c * (colWidth + gutter)}
          y={0}
          width={colWidth}
          height={canvasSize.height}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />,
      )
    }
    for (let r = 0; r < rows; r += 1) {
      elements.push(
        <Rect
          key={`row-${r}`}
          x={0}
          y={r * (rowHeight + gutter)}
          width={canvasSize.width}
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
    dragStateRef.current = {
      mode,
      directionX: options.directionX ?? 'center',
      directionY: options.directionY ?? 'center',
      startX: event.clientX,
      startY: event.clientY,
      originalPosition: artboardPosition,
      originalSize: canvasSize,
    }
    window.addEventListener('pointermove', handleArtboardPointerMove)
    window.addEventListener('pointerup', endArtboardDrag)
  }

  const updateSelectedCanvas = (updater) => {
    setLayers((prev) =>
      prev.map((layer) => (layer.id === selectedLayerId ? { ...layer, ...updater(layer) } : layer)),
    )
  }

  const handleArtboardPointerMove = (event) => {
    const drag = dragStateRef.current
    if (!drag) return
    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    if (drag.mode === 'move') {
      setArtboardPosition({
        x: Math.max(0, drag.originalPosition.x + dx),
        y: Math.max(0, drag.originalPosition.y + dy),
      })
      updateSelectedCanvas(() => ({
        frame: {
          x: Math.max(0, drag.originalPosition.x + dx),
          y: Math.max(0, drag.originalPosition.y + dy),
          width: drag.originalSize.width,
          height: drag.originalSize.height,
        },
      }))
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

      setArtboardPosition({ x: newX, y: newY })
      setCanvasSize({ width: newWidth, height: newHeight })
      updateSelectedCanvas(() => ({
        frame: {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        },
      }))
    }
  }

  const endArtboardDrag = () => {
    dragStateRef.current = null
    window.removeEventListener('pointermove', handleArtboardPointerMove)
    window.removeEventListener('pointerup', endArtboardDrag)
  }

  useEffect(() => () => endArtboardDrag(), [])

  const renderToolButton = (item) => {
    if (item.type === 'separator') return <div key={item.id} className="w-px h-8 bg-zinc-700 mx-1" />
    const hasDropdown = Boolean(item.dropdown && TOOL_SUBMENUS[item.id]?.length)
    return (
      <div key={item.id} className="flex items-center">
        <button
          type="button"
          ref={(node) => {
            if (node) toolbarButtonRefs.current.set(item.id, node)
            else toolbarButtonRefs.current.delete(item.id)
          }}
          onClick={() => handleToolbarButton(item.id)}
          className={`w-9 h-9 rounded flex items-center justify-center ${activeTool === item.id ? 'bg-blue-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}
          title={item.label}
        >
          <img src={item.icon} alt="" className="w-4 h-4 invert brightness-150" />
        </button>
        {hasDropdown && (
          <button
            type="button"
            className={`w-5 h-9 border-l border-zinc-700 text-zinc-400 ${dropdownState.toolId === item.id ? 'bg-blue-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700'}`}
            onClick={() => toggleDropdown(item.id)}
            title={`${item.label} options`}
          >
            ▾
          </button>
        )}
      </div>
    )
  }

  const renderToolOptionsPanel = () => {
    if (!dropdownState.toolId) return null
    const options = TOOL_SUBMENUS[dropdownState.toolId]
    if (!options?.length) return null
    return (
      <div
        className="absolute z-20 pointer-events-none"
        style={{ top: 'calc(100% + 8px)', left: dropdownState.left, transform: 'translateX(-50%)' }}
      >
        <div className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 px-2 py-1 shadow-xl pointer-events-auto">
          {options.map((option) => {
            const isActive = toolSelections[dropdownState.toolId] === option.id
            const iconName = option.icon
            const fallback = <span className="text-[10px] uppercase">{option.label[0]}</span>
            return (
              <button
                key={option.id}
                className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                  isActive ? 'bg-blue-600 border-blue-400 text-white' : 'bg-zinc-800 border-transparent text-zinc-300 hover:bg-zinc-700'
                }`}
                title={option.label}
                onClick={() => handleToolOption(dropdownState.toolId, option.id)}
              >
                {iconName ? <Icon name={iconName} size={16} fallback={fallback} /> : fallback}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const stageCursor = useMemo(() => {
    if (activeTool === 'zoom') return isAltPressed ? 'zoom-out' : 'zoom-in'
    if (activeTool === 'select') return 'default'
    return 'crosshair'
  }, [activeTool, isAltPressed])

  const renderInspector = () => {
    if (!selectedLayer || !selectedObject) {
      return <div className="flex-1 flex items-center justify-center text-zinc-600">No selection</div>
    }

    return (
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div className="flex flex-col gap-1">
          <span className="text-zinc-500">Canvas name</span>
          <input
            type="text"
            value={selectedLayer.name}
            onChange={(e) =>
              setLayers((prev) =>
                prev.map((layer) => (layer.id === selectedLayer.id ? { ...layer, name: e.target.value } : layer)),
              )
            }
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {['x', 'y', 'width', 'height', 'rotation'].map((prop) => (
            <label key={prop} className="flex flex-col gap-1 text-zinc-500">
              {prop}
              <input
                type="number"
                step={prop === 'rotation' ? 1 : 5}
                value={selectedObject.frame[prop]}
                onChange={(e) => handlePositionInput(prop, e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100"
              />
            </label>
          ))}
        </div>

        {selectedObject.type === 'text' && (
          <div className="space-y-2 border-t border-zinc-800 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 w-16">Font</span>
              <input
                type="text"
                value={selectedObject.fontFamily}
                onChange={(e) => updateObject(selectedLayer.id, selectedObject.id, (obj) => ({ ...obj, fontFamily: e.target.value }))}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 w-16">Size</span>
              <input
                type="number"
                min={8}
                value={selectedObject.fontSize}
                onChange={(e) => updateObject(selectedLayer.id, selectedObject.id, (obj) => ({ ...obj, fontSize: Number(e.target.value) }))}
                className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100"
              />
              <button
                className={`px-3 py-1 rounded border ${selectedObject.fontStyle === 'bold' ? 'bg-blue-600 border-blue-500' : 'border-zinc-700 bg-zinc-800'}`}
                onClick={() => updateObject(selectedLayer.id, selectedObject.id, (obj) => ({ ...obj, fontStyle: obj.fontStyle === 'bold' ? 'normal' : 'bold' }))}
              >
                B
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <span className="text-zinc-500">Canvas background</span>
          <input
            type="color"
            value={selectedLayer.background}
            onChange={(e) =>
              setLayers((prev) =>
                prev.map((layer) =>
                  layer.id === selectedLayer.id ? { ...layer, background: e.target.value } : layer,
                ),
              )
            }
            className="w-16 h-8 border border-zinc-700 rounded bg-transparent"
          />
        </div>

        <div className="border-t border-zinc-800 pt-3">{renderColorSection()}</div>

        {showFilterPanel && (
          <div className="border-t border-zinc-800 pt-3 space-y-2">
            <div className="text-zinc-500 uppercase tracking-wide">Filter Controls ({inspectorFilter.type})</div>
            <div className="flex items-center gap-2">
              <span className="w-16 text-zinc-500">Amount</span>
              <input
                type="range"
                min={0}
                max={100}
                value={inspectorFilter.amount}
                onChange={(e) => setInspectorFilter((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                className="flex-1 accent-blue-500"
              />
              <span className="w-10 text-right">{inspectorFilter.amount}%</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-[12px] text-zinc-100 flex flex-col">
      <nav className="w-full border-b border-zinc-800 bg-zinc-900 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-wide text-zinc-400">Konva Layer Editor</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="w-9 h-9 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center"
            title="Canvas Size"
            onClick={() => setCanvasDialog({ open: true, width: canvasSize.width, height: canvasSize.height })}
          >
            ⧉
          </button>
          <button className="w-9 h-9 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center" title="Clear Document" onClick={handleClearDocument}>
            ⌫
          </button>
          <button className="w-9 h-9 rounded bg-zinc-800 opacity-40 cursor-not-allowed flex items-center justify-center" title="Load (pending)" disabled>
            📂
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-56 border-r border-zinc-800 bg-zinc-900 flex flex-col">
          <div className="px-3 py-2 border-b border-zinc-800 uppercase tracking-wide text-zinc-500">Canvas</div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {layers.length === 0 && <div className="text-zinc-600 text-center py-4 border border-dashed border-zinc-800 rounded">Empty</div>}
            {layers.map((layer, index) => (
              <div key={layer.id} className="space-y-1">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedLayerId(layer.id)
                    setSelectedObjectId(layer.objects[0]?.id ?? null)
                    ensureLayerExpanded(layer.id)
                  }}
                  className={`w-full flex items-center justify-between rounded border px-3 py-2 ${
                    selectedLayerId === layer.id ? 'border-blue-500 bg-blue-600/20' : 'border-transparent bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {layer.objects.length > 0 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedLayers((prev) => {
                            const next = new Set(prev)
                            if (next.has(layer.id)) next.delete(layer.id)
                            else next.add(layer.id)
                            return next
                          })
                        }}
                        className="w-4 h-4 text-zinc-400 hover:text-white"
                      >
                        {expandedLayers.has(layer.id) ? '▾' : '▸'}
                      </button>
                    ) : (
                      <span className="w-4" />
                    )}
                    <span>{layer.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-400">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLayerVisibility(layer.id)
                      }}
                      title={layer.visible ? 'Hide' : 'Show'}
                    >
                      {layer.visible ? '👁️' : '🚫'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveLayer(layer.id, -1)
                      }}
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveLayer(layer.id, 1)
                      }}
                      disabled={index === layers.length - 1}
                    >
                      ↓
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteLayer(layer.id)
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {expandedLayers.has(layer.id) && layer.objects.length > 0 && (
                  <div className="ml-6 space-y-1">
                    {layer.objects.map((obj) => (
                      <div
                        key={obj.id}
                        className={`flex items-center justify-between rounded px-2 py-1 ${
                          selectedObjectId === obj.id ? 'bg-blue-600/30' : 'bg-zinc-800'
                        }`}
                        onClick={() => handleCanvasSelection(layer.id, obj.id)}
                      >
                        <span>{obj.name}</span>
                        <div className="flex items-center gap-1 text-zinc-400">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleObjectVisibility(layer.id, obj.id)
                            }}
                          >
                            {obj.visible ? '👁️' : '🚫'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteObject(layer.id, obj.id)
                            }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-zinc-800">
            <button onClick={handleAddLayer} className="w-8 h-8 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center" title="Add canvas">
              +
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-zinc-950 relative min-h-0">
          <div className="relative border-b border-zinc-800 bg-zinc-900" ref={toolbarRef}>
            <div className="flex items-center px-3 py-2 gap-1">
              {TOOLBAR_LAYOUT.map((item) => renderToolButton(item))}
              <button
                type="button"
                className={`ml-auto px-3 h-9 rounded border border-zinc-700 ${filterMenuOpen ? 'bg-blue-600 border-blue-500' : 'bg-zinc-900 hover:bg-zinc-800'}`}
                onClick={() => setFilterMenuOpen((prev) => !prev)}
              >
                Filters ▾
              </button>
            </div>

            {renderToolOptionsPanel()}

            {filterMenuOpen && (
              <div className="absolute top-full right-4 mt-1 z-10 rounded border border-zinc-800 bg-zinc-900 shadow-lg min-w-[180px]">
                <div className="px-3 py-2 text-zinc-400 uppercase tracking-wide">Filters</div>
                <div className="flex flex-col">
                  {FILTER_OPTIONS.map((option) => (
                    <button key={option.id} type="button" className="px-3 py-1 text-left hover:bg-zinc-800 text-zinc-200" onClick={() => handleFilterSelect(option.id)}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 bg-zinc-950 flex overflow-hidden min-h-0 h-full">
            <div className="relative bg-zinc-900/60 border border-zinc-800 shadow-inner flex-1 overflow-hidden">
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
              <div className="absolute left-[16px] top-0 text-[10px] text-zinc-400 flex items-center gap-2 select-none">
                <span>X: {Math.round(artboardPosition.x)}px</span>
                <span>Y: {Math.round(artboardPosition.y)}px</span>
              </div>
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
                <Stage
                  width={canvasSize.width}
                  height={canvasSize.height}
                  ref={stageRef}
                  className="bg-zinc-900"
                  style={{ cursor: stageCursor }}
                  onMouseDown={handleStagePointerDown}
                  onMouseMove={handleStagePointerMove}
                  onMouseUp={handleStagePointerUp}
                  onTouchStart={handleStagePointerDown}
                  onTouchMove={handleStagePointerMove}
                  onTouchEnd={handleStagePointerUp}
                >
                  <KonvaLayer>
                    <Rect
                      x={0}
                      y={0}
                      width={canvasSize.width}
                      height={canvasSize.height}
                      fill={selectedLayer?.background ?? '#18181b'}
                      onPointerDown={handleArtboardBackgroundClick}
                    />
                    {layoutSettings.showGrid && renderDraftGrid()}
                    {layers.flatMap((layer) => (layer.visible ? layer.objects.filter((obj) => obj.visible).map((obj) => renderObject(layer.id, obj)) : []))}
                    {renderDraft()}
                    <Transformer ref={transformerRef} rotateEnabled />
                  </KonvaLayer>
                </Stage>
              </div>
              <div
                className="absolute bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full shadow"
                style={{
                  top: 16 + artboardPosition.y + canvasSize.height + 10,
                  left: 16 + artboardPosition.x + canvasSize.width / 2 - 30,
                }}
              >
                {Math.round(canvasSize.width)} × {Math.round(canvasSize.height)}
              </div>
              {(() => {
                const left = 16 + artboardPosition.x
                const top = 16 + artboardPosition.y
                const right = left + canvasSize.width
                const bottom = top + canvasSize.height
                const centerX = left + canvasSize.width / 2
                const centerY = top + canvasSize.height / 2
                const specs = [
                  { id: 'corner-nw', x: left, y: top, cursor: 'nwse-resize', directionX: 'start', directionY: 'start', shape: 'square' },
                  { id: 'corner-ne', x: right, y: top, cursor: 'nesw-resize', directionX: 'end', directionY: 'start', shape: 'square' },
                  { id: 'corner-sw', x: left, y: bottom, cursor: 'nesw-resize', directionX: 'start', directionY: 'end', shape: 'square' },
                  { id: 'corner-se', x: right, y: bottom, cursor: 'nwse-resize', directionX: 'end', directionY: 'end', shape: 'square' },
                  { id: 'edge-top', x: centerX, y: top, cursor: 'ns-resize', directionX: 'center', directionY: 'start', shape: 'circle' },
                  { id: 'edge-bottom', x: centerX, y: bottom, cursor: 'ns-resize', directionX: 'center', directionY: 'end', shape: 'circle' },
                  { id: 'edge-left', x: left, y: centerY, cursor: 'ew-resize', directionX: 'start', directionY: 'center', shape: 'circle' },
                  { id: 'edge-right', x: right, y: centerY, cursor: 'ew-resize', directionX: 'end', directionY: 'center', shape: 'circle' },
                  { id: 'center', x: centerX, y: centerY, cursor: 'move', mode: 'move', shape: 'center' },
                ]
                return specs.map((spec) => {
                  const size = spec.shape === 'square' ? 10 : 12
                  const className =
                    spec.shape === 'square'
                      ? 'absolute w-[10px] h-[10px] bg-blue-500 border border-white cursor-pointer'
                      : spec.shape === 'center'
                        ? 'absolute w-4 h-4 bg-blue-500/20 border border-blue-400 rounded-full cursor-move flex items-center justify-center'
                        : 'absolute w-[12px] h-[12px] bg-zinc-900 border-2 border-blue-400 rounded-full'
                  const style = {
                    left: spec.x - size / 2,
                    top: spec.y - size / 2,
                    cursor: spec.cursor,
                  }
                  const onPointerDown = beginArtboardDrag(spec.mode ?? 'resize', {
                    directionX: spec.directionX,
                    directionY: spec.directionY,
                  })

                  if (spec.shape === 'center') {
                    return (
                      <button key={spec.id} className={className} style={style} onPointerDown={onPointerDown} title="Move artboard">
                        <span className="w-1 h-1 bg-blue-400 rounded-full" />
                      </button>
                    )
                  }
                  return <button key={spec.id} className={className} style={style} onPointerDown={onPointerDown} title="Artboard handle" />
                })
              })()}
            </div>
          </div>
        </div>

        <div className="w-80 border-l border-zinc-800 bg-zinc-900 flex flex-col">
          <div className="px-3 py-2 border-b border-zinc-800 uppercase tracking-wide text-zinc-500">Inspector</div>
          {renderInspector()}
        </div>
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

export default KonvaLayerEditor
