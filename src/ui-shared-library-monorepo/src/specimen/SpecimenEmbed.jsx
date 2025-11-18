import React, { useEffect, useRef } from 'react'

export default function SpecimenEmbed({ fontRef, options = {}, className = '', ...props }) {
  const container = useRef(null)

  useEffect(() => {
    // Hook up @kol/fontviewer here if desired
    // const viewer = new FontViewer({ container: container.current, ...options })
    // viewer.init(); return () => viewer.destroy()
  }, [])

  return (
    <div
      ref={container}
      data-specimen-embed
      className={`min-h-64 border-dashed border p-4 ${className}`.trim()}
      {...props}
    >
      Specimen Embed placeholder
    </div>
  )
}
