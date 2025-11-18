import { useEffect, useMemo, useState } from 'react'

const iconCache = new Map()

const fetchIcon = async (path) => {
  if (iconCache.has(path)) return iconCache.get(path)
  const response = await fetch(path)
  if (!response.ok) throw new Error(`Failed to load icon: ${path}`)
  const text = await response.text()
  iconCache.set(path, text)
  return text
}

const Icon = ({
  name,
  folder,
  size = 20,
  color = 'currentColor',
  className = '',
  fallback = null,
  title,
  'aria-hidden': ariaHidden = title ? undefined : true,
}) => {
  const [content, setContent] = useState(null)
  const [error, setError] = useState(null)

  const normalizedFolder = useMemo(() => (folder ? folder.toLowerCase() : name?.[0]?.toLowerCase()), [folder, name])
  const normalizedName = useMemo(() => name?.replace(/\.svg$/, ''), [name])
  const iconPath = useMemo(() => {
    if (!normalizedFolder || !normalizedName) return null
    return `/icons/${normalizedFolder}/${normalizedName}.svg`
  }, [normalizedFolder, normalizedName])

  useEffect(() => {
    if (!iconPath) return
    let cancelled = false
    fetchIcon(iconPath)
      .then((svg) => {
        if (!cancelled) {
          setContent(svg)
          setError(null)
        }
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setError(err)
      })
    return () => {
      cancelled = true
    }
  }, [iconPath])

  if (!iconPath) return fallback
  if (error) return fallback
  if (!content) return fallback

  return (
    <span
      className={`inline-flex items-center justify-center text-current ${className}`}
      style={{ width: size, height: size, color }}
      role={title ? 'img' : undefined}
      aria-hidden={ariaHidden}
      title={title}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

export default Icon
