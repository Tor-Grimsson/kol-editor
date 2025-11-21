import { useState, useRef, useEffect } from 'react'

/**
 * DraggableControlPanel - Reusable draggable + resizable control panel
 *
 * Features:
 * - Draggable with momentum physics
 * - Optional width resizing (left edge handle)
 * - Lock state to prevent movement
 * - Smooth animations on drag
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Panel content
 * @param {boolean} props.isLocked - Lock state (disables drag/resize)
 * @param {boolean} props.resizable - Enable width resizing (default: false)
 * @param {number} props.initialWidth - Initial width in px (default: 320)
 * @param {number} props.minWidth - Minimum width in px (default: 240)
 * @param {number} props.maxWidth - Maximum width in px (default: 600)
 * @param {string} props.className - Additional CSS classes
 */
export default function DraggableControlPanel({
  children,
  isLocked = false,
  resizable = false,
  initialWidth = 320,
  minWidth = 240,
  maxWidth = 600,
  className = ''
}) {
  // Position and size state
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 })
  const [panelWidth, setPanelWidth] = useState(initialWidth)

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [isActuallyDragging, setIsActuallyDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })

  // Resize state
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeStartWidth, setResizeStartWidth] = useState(initialWidth)

  // Refs
  const panelRef = useRef(null)
  const velocityRef = useRef({ x: 0, y: 0 })
  const lastPosRef = useRef({ x: 0, y: 0, time: 0 })
  const animationFrameRef = useRef(null)

  // Resize handlers
  const handleResizeMouseDown = (e) => {
    if (isLocked || !resizable) return
    e.stopPropagation() // Prevent drag from triggering
    setIsResizing(true)
    setResizeStartX(e.clientX)
    setResizeStartWidth(panelWidth)
  }

  const handleResizeMouseMove = (e) => {
    if (!isResizing) return

    // Calculate new width (negative because handle is on left side)
    const deltaX = resizeStartX - e.clientX
    const newWidth = Math.max(minWidth, Math.min(maxWidth, resizeStartWidth + deltaX))
    setPanelWidth(newWidth)
  }

  const handleResizeMouseUp = () => {
    setIsResizing(false)
  }

  // Drag handlers
  const handleMouseDown = (e) => {
    if (!panelRef.current || isLocked || isResizing) return

    // Don't drag if clicking on interactive elements
    const target = e.target
    const isInteractive = target.closest('button, input, select, textarea, [role="button"], [role="listbox"], .cursor-pointer, [onClick]')
    if (isInteractive) return

    // Cancel any ongoing momentum animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    const rect = panelRef.current.getBoundingClientRect()
    setIsDragging(true)
    setIsActuallyDragging(false)
    setDragStartPos({ x: e.clientX, y: e.clientY })
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })

    // Reset velocity tracking
    velocityRef.current = { x: 0, y: 0 }
    lastPosRef.current = { x: 0, y: 0, time: 0 }
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y
    const currentTime = Date.now()

    // Calculate distance moved from start
    const distanceMoved = Math.sqrt(
      Math.pow(e.clientX - dragStartPos.x, 2) +
      Math.pow(e.clientY - dragStartPos.y, 2)
    )

    // Only trigger animation after moving 10px
    if (distanceMoved > 10 && !isActuallyDragging) {
      setIsActuallyDragging(true)
    }

    // Calculate velocity for momentum
    if (lastPosRef.current.time) {
      const dt = (currentTime - lastPosRef.current.time) / 16 // normalize to ~60fps
      if (dt > 0) {
        velocityRef.current = {
          x: (newX - lastPosRef.current.x) / dt,
          y: (newY - lastPosRef.current.y) / dt
        }
      }
    }

    lastPosRef.current = { x: newX, y: newY, time: currentTime }

    setPanelPosition({ x: newX, y: newY })
  }

  const applyMomentum = () => {
    const friction = 0.92
    const minVelocity = 0.1

    const step = () => {
      // Apply friction
      velocityRef.current.x *= friction
      velocityRef.current.y *= friction

      // Stop if velocity is too small
      if (Math.abs(velocityRef.current.x) < minVelocity && Math.abs(velocityRef.current.y) < minVelocity) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
        return
      }

      // Update position
      setPanelPosition(prev => ({
        x: prev.x + velocityRef.current.x,
        y: prev.y + velocityRef.current.y
      }))

      animationFrameRef.current = requestAnimationFrame(step)
    }

    step()
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsActuallyDragging(false)

    // Apply momentum if moving fast enough
    const speed = Math.sqrt(
      velocityRef.current.x ** 2 + velocityRef.current.y ** 2
    )

    if (speed > 1) {
      applyMomentum()
    }
  }

  // Event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging])

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMouseMove)
      window.addEventListener('mouseup', handleResizeMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleResizeMouseMove)
        window.removeEventListener('mouseup', handleResizeMouseUp)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResizing, resizeStartX, resizeStartWidth, panelWidth])

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={panelRef}
      className={`fixed z-50 ${className}`}
      style={{
        width: `${panelWidth}px`,
        right: panelPosition.x === 0 ? '2rem' : 'auto',
        bottom: panelPosition.y === 0 ? '2rem' : 'auto',
        left: panelPosition.x !== 0 ? `${panelPosition.x}px` : 'auto',
        top: panelPosition.y !== 0 ? `${panelPosition.y}px` : 'auto',
        cursor: isLocked ? 'default' : (isDragging ? 'grabbing' : 'grab'),
        transform: isActuallyDragging ? 'scale(1.02) rotate(-1deg)' : 'scale(1) rotate(0deg)',
        transition: isActuallyDragging ? 'transform 0.15s ease-out' : 'transform 0.2s ease-out',
        borderRadius: '4px'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Resize handle on left edge (optional) */}
      {resizable && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 transition-all group overflow-hidden"
          style={{
            cursor: isLocked ? 'default' : 'ew-resize',
            borderRadius: '4px 0 0 4px'
          }}
          onMouseDown={handleResizeMouseDown}
        >
          <div
            className="h-full border-l transition-opacity"
            style={{
              borderColor: 'color-mix(in srgb, var(--kol-surface-on-primary) 24%, transparent)',
              opacity: 0,
              borderRadius: '4px 0 0 4px'
            }}
            onMouseEnter={(e) => {
              if (!isLocked) {
                e.currentTarget.style.opacity = '1'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0'
            }}
          />
        </div>
      )}

      {children}
    </div>
  )
}
