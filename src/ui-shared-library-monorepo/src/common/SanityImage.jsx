import imageUrlBuilder from '@sanity/image-url'

/**
 * SanityImage Component
 * 
 * Handles Sanity image rendering with automatic URL building
 * Requires sanityClient to be passed via props or imported
 * 
 * @param {Object} props
 * @param {Object|string} props.image - Sanity image object or URL string
 * @param {string} props.alt - Alt text for image
 * @param {number} props.width - Image width for URL builder
 * @param {number} props.height - Image height for URL builder
 * @param {string} props.className - Additional classes
 * @param {Object} props.sanityClient - Sanity client instance
 */

function Placeholder({ className, message = 'Image unavailable', ...props }) {
  return (
    <div
      className={`bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center ${className}`.trim()}
      {...props}
    >
      <span className="kol-meta uppercase">{message}</span>
    </div>
  )
}

export default function SanityImage({
  image,
  alt = '',
  width = 2000,
  height,
  className = '',
  sanityClient,
  ...props
}) {
  if (!image) {
    return <Placeholder className={className} message="No image" {...props} />
  }

  const altText = typeof image === 'object' && image?.alt ? image.alt : alt

  // Handle direct URL strings
  if (typeof image === 'string') {
    return <img src={image} alt={altText} className={className} loading="lazy" {...props} />
  }

  // Handle objects with direct URL
  if (image?.url) {
    return <img src={image.url} alt={altText} className={className} loading="lazy" {...props} />
  }

  // Build Sanity image URL
  if (!sanityClient) {
    console.warn('SanityImage: sanityClient prop required for image URL building')
    return <Placeholder className={className} {...props} />
  }

  try {
    const builder = imageUrlBuilder(sanityClient)
    let urlBuilder = builder
      .image(image)
      .width(width)
      .quality(90)
      .auto('format')

    if (height) {
      urlBuilder = urlBuilder.height(height)
    }

    const src = urlBuilder.url()

    if (!src) {
      return <Placeholder className={className} {...props} />
    }

    return <img src={src} alt={altText} className={className} loading="lazy" {...props} />
  } catch (error) {
    console.warn('Unable to generate Sanity image URL', error)
    return <Placeholder className={className} {...props} />
  }
}
