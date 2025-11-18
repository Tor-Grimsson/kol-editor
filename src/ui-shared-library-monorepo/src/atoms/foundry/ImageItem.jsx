import React from 'react'

const ImageItem = ({
  src,
  alt,
  className = "",
  aspectRatio = "auto",
  objectFit = "cover",
  useClampedRadius = false
}) => {
  return (
    <div
      className={`${className} w-full h-full overflow-hidden ${aspectRatio === 'square' ? 'aspect-square' : ''}`}
      style={{ borderRadius: useClampedRadius ? 'clamp(0px, calc(1400px - 100vw) * 0.02, 4px)' : '4px' }}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-${objectFit}`}
      />
    </div>
  )
}

export default ImageItem
