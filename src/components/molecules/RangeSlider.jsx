import Input from '../atoms/Input'

const RangeSlider = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  showValue = true
}) => {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="w-6 text-zinc-400">{label}</span>}
      <Input
        type="range"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className="flex-1 accent-blue-500"
      />
      {showValue && (
        <Input
          type="number"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-center"
        />
      )}
    </div>
  )
}

export default RangeSlider
