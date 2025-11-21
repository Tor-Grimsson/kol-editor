import Input from '../atoms/Input'

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
    <div className="flex items-center gap-2 py-1">
      {label && <span className="w-12 text-xs text-zinc-400 flex-shrink-0">{label}</span>}
      <Input
        type="range"
        value={value}
        onChange={onChange}
        onInput={onChange}
        min={min}
        max={max}
        step={step}
        className="flex-1 h-1 accent-blue-500 bg-zinc-700 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
      />
      {showValue && (
        <Input
          type="number"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          className="w-14 text-xs bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-center flex-shrink-0"
        />
      )}
    </div>
  )
}

export default RangeSlider
