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
      <Label className="text-fg-48">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className="bg-container-primary border border-fg-08 rounded px-2 py-1 text-auto"
      />
    </div>
  )
}

export default PropertyInput
