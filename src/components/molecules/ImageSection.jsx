import React from 'react'
import { ImageItem } from '../atoms'

const ImageSection = ({
  // Single image props
  src,
  alt,
  className,
  aspectRatio,
  objectFit,
  // Multiple images prop
  images
}) => {
  // Single image mode
  if (src && !images) {
    return (
      <section className="h-[80vh] px-8">
        <ImageItem
          src={src}
          alt={alt}
          className={className}
          aspectRatio={aspectRatio}
          objectFit={objectFit}
        />
      </section>
    )
  }

  // Multiple images mode
  if (images && Array.isArray(images)) {
    return (
      <section className="w-full h-auto flex flex-col md:flex-row lg:flex-row gap-4 items-start px-8">
        {images.map((image, index) => (
          <div
            key={index}
            className={`w-full md:w-1/${images.length} lg:w-1/${images.length} ${image.aspectRatio || 'aspect-[4/5]'}`}
          >
            <ImageItem
              src={image.src}
              alt={image.alt}
              className={image.className}
              aspectRatio={image.aspectRatio}
              objectFit={image.objectFit}
            />
          </div>
        ))}
      </section>
    )
  }

  return null
}

export default ImageSection
