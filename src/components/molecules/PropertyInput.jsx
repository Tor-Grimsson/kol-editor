import Label from '../atoms/Label'
import Input from '../atoms/Input'

const PropertyInput = ({
  label,
  value,
  onChange,
  type = 'text',
  min,
  max,
  step,
  className = ''
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Label className="text-zinc-500">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100"
      />
    </div>
  )
}

export default PropertyInput
