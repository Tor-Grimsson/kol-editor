/**
 * Glyph Sets - Static character collections for typography specimens
 *
 * Used by GlyphGrid and GlyphCategory components to display
 * font character coverage across different Unicode ranges.
 */

export const glyphSets = {
  uppercase: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  lowercase: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
  numbers: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  punctuation: ['.', ',', '!', '?', ';', ':', '"', "'", '-', '—', '(', ')', '[', ']', '{', '}', '&', '@', '#', '$', '%'],
  latin1: ['À', 'Á', 'Â', 'Ã', 'Ä', 'Å', 'Æ', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï', 'Ð', 'Ñ', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', 'Ø'],
  latinExtended: ['Ā', 'Ă', 'Ą', 'Ć', 'Ĉ', 'Ċ', 'Č', 'Ď', 'Đ', 'Ē', 'Ĕ', 'Ė', 'Ę', 'Ě', 'Ĝ', 'Ğ', 'Ġ', 'Ģ', 'Ĥ', 'Ħ', 'Ĩ', 'Ī', 'Ĭ', 'Į']
}

/**
 * Glyph Categories - Metadata for organizing glyph displays
 *
 * Maps category keys to display titles for consistent labeling
 * across the application.
 */
export const glyphCategories = [
  { key: 'uppercase', title: 'Uppercase' },
  { key: 'lowercase', title: 'Lowercase' },
  { key: 'numbers', title: 'Numbers' },
  { key: 'punctuation', title: 'Punctuation & Symbols' },
  { key: 'latin1', title: 'Latin-1 Supported' },
  { key: 'latinExtended', title: 'Latin Extended' }
]
