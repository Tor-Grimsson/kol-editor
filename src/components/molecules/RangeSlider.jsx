const RangeSlider = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step,
  showValue = true
}) => {
  return (
    <div className="flex items-center gap-3 py-1">
      {label && <span className="kol-mono-xs text-fg-64 flex-shrink-0">{label}</span>}
      <input
        type="range"
        value={value}
        onChange={onChange}
        onInput={onChange}
        min={min}
        max={max}
        step={step}
        className="slider-black flex-1"
      />
      {showValue && (
        <span className="kol-mono-xs text-right shrink-0 w-fit">
          {Math.round(value)}
        </span>
      )}
    </div>
  )
}

export default RangeSlider
