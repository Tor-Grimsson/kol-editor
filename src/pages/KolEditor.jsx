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

import TopNav from '../components/organisms/TopNav'
import Toolbar from '../components/organisms/Toolbar'
import LayersSidebar from '../components/organisms/LayersSidebar'
import Inspector from '../components/organisms/Inspector'
import CanvasArea from '../components/organisms/CanvasArea'
import { TOOL_SUBMENUS } from '../constants/editor'
import { hexToHsb, hsbToHex } from '../utils/colors'
import { clamp } from '../utils/geometry'

const DEFAULT_CANVAS = { width: 1200, height: 700 }
const BASE_COLORS = ['#22d3ee', '#f472b6', '#a78bfa', '#4ade80', '#facc15']
const RULER_STEP = 100
const dropdownDefaults = { toolId: null, left: 0 }

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

const KolEditor = () => {
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
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const [inspectorFilter, setInspectorFilter] = useState(null)
  const [layoutSettings, setLayoutSettings] = useState({ columns: 1, rows: 1, gutter: 0, showGrid: false })
  const [toolSelections, setToolSelections] = useState({})

  const stageRef = useRef(null)
  const transformerRef = useRef(null)
  const nodeRefs = useRef(new Map())
  const nextLayerIndexRef = useRef(2)
  const nextObjectIdRef = useRef(1)
  const colorIndexRef = useRef(0)
  const cloneDragRef = useRef(null)
  const undoStackRef = useRef([])
  const redoStackRef = useRef([])

  const selectedLayer = useMemo(() => layers.find((layer) => layer.id === selectedLayerId) ?? null, [layers, selectedLayerId])
  const selectedObject = useMemo(() => selectedLayer?.objects?.find((obj) => obj.id === selectedObjectId) ?? null, [selectedLayer, selectedObjectId])

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
    const handleOutsideClick = (event) => {
      if (dropdownState.toolId && !event.target.closest('.toolbar-container')) setDropdownState(dropdownDefaults)
      if (filterMenuOpen && !event.target.closest('.toolbar-container')) setFilterMenuOpen(false)
    }
    document.addEventListener('pointerdown', handleOutsideClick)
    return () => document.removeEventListener('pointerdown', handleOutsideClick)
  }, [dropdownState.toolId, filterMenuOpen])

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
    ensureLayerExpanded(canvasId)
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

  const handleColorChange = (hex) => {
    if (!selectedLayer || !selectedObject) return
    updateObject(selectedLayer.id, selectedObject.id, (obj) => ({ ...obj, color: hex }))
  }

  const handleOpacityChange = (percent) => {
    if (!selectedLayer || !selectedObject) return
    const opacity = clamp(Number(percent), 0, 100) / 100
    updateObject(selectedLayer.id, selectedObject.id, (obj) => ({ ...obj, opacity }))
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
    const hsb = hexToHsb(selectedObject.color)
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
          layers={layers}
          selectedLayerId={selectedLayerId}
          selectedObjectId={selectedObjectId}
          expandedLayers={expandedLayers}
          onLayerSelect={(layerId, objectId) => {
            setSelectedLayerId(layerId)
            setSelectedObjectId(objectId || null)
            ensureLayerExpanded(layerId)
          }}
          onObjectSelect={(layerId, objectId) => {
            setSelectedLayerId(layerId)
            setSelectedObjectId(objectId)
          }}
          onToggleExpand={(layerId) => {
            setExpandedLayers((prev) => {
              const next = new Set(prev)
              if (next.has(layerId)) next.delete(layerId)
              else next.add(layerId)
              return next
            })
          }}
          onToggleLayerVisibility={toggleLayerVisibility}
          onToggleObjectVisibility={toggleObjectVisibility}
          onMoveLayer={moveLayer}
          onDeleteLayer={handleDeleteLayer}
          onDeleteObject={handleDeleteObject}
          onAddLayer={handleAddLayer}
        />

        <div className="flex-1 flex flex-col bg-zinc-950 relative min-h-0">
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
            selectedLayer={selectedLayer}
            layers={layers}
            selectedObjectId={selectedObjectId}
            stageCursor={stageCursor}
            stageRef={stageRef}
            transformerRef={transformerRef}
            nodeRefs={nodeRefs}
            dragDraft={dragDraft}
            layoutSettings={layoutSettings}
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
            renderDraft={renderDraft}
            renderDraftGrid={renderDraftGrid}
          />
        </div>

        <Inspector
          selectedLayer={selectedLayer}
          selectedObject={selectedObject}
          onLayerNameChange={(name) =>
            setLayers((prev) =>
              prev.map((layer) => (layer.id === selectedLayer.id ? { ...layer, name } : layer)),
            )
          }
          onLayerBackgroundChange={(background) =>
            setLayers((prev) =>
              prev.map((layer) =>
                layer.id === selectedLayer.id ? { ...layer, background } : layer,
              ),
            )
          }
          onObjectPropertyChange={handlePositionInput}
          onObjectColorChange={handleColorChange}
          onObjectOpacityChange={handleOpacityChange}
          onObjectTextChange={(prop, value) =>
            updateObject(selectedLayer.id, selectedObject.id, (obj) => ({ ...obj, [prop]: value }))
          }
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
