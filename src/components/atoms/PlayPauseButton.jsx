/**
 * PlayPauseButton - Toggle button for play/pause states
 *
 * Simple atom for controlling animation or media playback states.
 * Displays pause icon (two bars) when playing, play icon (triangle) when paused.
 *
 * @param {Object} props
 * @param {boolean} props.isPlaying - Whether currently playing/animating
 * @param {Function} props.onToggle - Callback when button is clicked
 * @param {number} props.size - Button size in pixels (default: 28)
 * @param {string} props.className - Additional classes
 */
const PlayPauseButton = ({
  isPlaying = false,
  onToggle,
  size = 28,
  className = '',
  style = {}
}) => {
  // Scale icon sizes proportionally based on button size
  // Default proportions based on 28px button: 12px bars, 6px triangle borders
  const barHeight = Math.round(size * 0.43) // 12/28 ≈ 0.43
  const barWidth = Math.max(2, Math.round(size * 0.07)) // 2/28 ≈ 0.07
  const triangleBorder = Math.round(size * 0.21) // 6/28 ≈ 0.21
  const gap = Math.max(2, Math.round(size * 0.07))

  return (
    <button
      onClick={onToggle}
      className={`cursor-pointer flex items-center justify-center !p-0 ${className}`.trim()}
      style={{ ...style, width: `${size}px`, height: `${size}px`, gap: `${gap}px` }}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {isPlaying ? (
        // Pause icon - two vertical bars
        <>
          <div style={{ width: `${barWidth}px`, height: `${barHeight}px` }} className="bg-current"></div>
          <div style={{ width: `${barWidth}px`, height: `${barHeight}px` }} className="bg-current"></div>
        </>
      ) : (
        // Play icon - triangle pointing right
        <div
          className="w-0 h-0"
          style={{
            borderLeft: `${triangleBorder}px solid currentColor`,
            borderTop: `${triangleBorder}px solid transparent`,
            borderBottom: `${triangleBorder}px solid transparent`,
            marginLeft: `${Math.round(size * 0.07)}px`
          }}
        ></div>
      )}
    </button>
  )
}

export default PlayPauseButton
