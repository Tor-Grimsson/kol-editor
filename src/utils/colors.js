import { clamp } from './geometry'

/**
 * Converts hex color to HSB (Hue, Saturation, Brightness)
 */
export const hexToHsb = (hex) => {
  if (!hex) return { h: 0, s: 0, b: 0 }
  
  let clean = hex.replace('#', '')
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((ch) => ch + ch)
      .join('')
  }
  
  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  
  let h = 0
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
    h *= 60
    if (h < 0) h += 360
  }
  
  const s = max === 0 ? 0 : delta / max
  const brightness = max
  
  return { 
    h: Math.round(h), 
    s: Math.round(s * 100), 
    b: Math.round(brightness * 100) 
  }
}

/**
 * Converts HSB (Hue, Saturation, Brightness) to hex color
 */
export const hsbToHex = (h, s, b) => {
  const sat = clamp(s, 0, 100) / 100
  const bright = clamp(b, 0, 100) / 100
  const chroma = bright * sat
  const hh = clamp(h, 0, 360) / 60
  const x = chroma * (1 - Math.abs((hh % 2) - 1))
  
  let [r1, g1, b1] = [0, 0, 0]
  if (hh >= 0 && hh < 1) [r1, g1, b1] = [chroma, x, 0]
  else if (hh >= 1 && hh < 2) [r1, g1, b1] = [x, chroma, 0]
  else if (hh >= 2 && hh < 3) [r1, g1, b1] = [0, chroma, x]
  else if (hh >= 3 && hh < 4) [r1, g1, b1] = [0, x, chroma]
  else if (hh >= 4 && hh < 5) [r1, g1, b1] = [x, 0, chroma]
  else if (hh >= 5 && hh <= 6) [r1, g1, b1] = [chroma, 0, x]
  
  const m = bright - chroma
  const rgb = [r1 + m, g1 + m, b1 + m].map((value) =>
    clamp(Math.round(value * 255), 0, 255)
      .toString(16)
      .padStart(2, '0')
  )
  
  return `#${rgb.join('').toUpperCase()}`
}
