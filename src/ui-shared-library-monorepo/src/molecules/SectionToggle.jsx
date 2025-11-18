import Divider from '../atoms/Divider.jsx'

const SectionToggle = ({
  label,
  isExpanded = false,
  onToggle,
  className = '',
  indicator = true,
  indicatorClassName = '',
  withDivider = true,
  dividerClassName = 'w-full'
}) => {
  return (

    <>
      <div className='flex flex-col gap-4 py-8'>
         <button
         type="button"
         onClick={onToggle}
         className={`flex w-full items-center justify-between group ${className}`.trim()}
         aria-expanded={isExpanded}
         >
         <span className="kol-mono-text-label">{label}</span>
         {indicator ? (
            <span className={`kol-mono-text-label text-xs ${indicatorClassName}`.trim()}>
               {isExpanded ? '-' : '+'}
            </span>
         ) : null}
         </button>
         {withDivider ? <Divider className={dividerClassName} /> : null}
      </div>
    </>
  )
}

export default SectionToggle
