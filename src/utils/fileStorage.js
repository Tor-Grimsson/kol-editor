/**
 * Save a file to localStorage
 */
export const saveFile = (fileId, data) => {
  try {
    const fileData = {
      id: fileId,
      name: data.name || 'Untitled',
      shapes: data.shapes || {},
      canvasBackground: data.canvasBackground || '#18181b',
      updatedAt: Date.now(),
      thumbnail: data.thumbnail || null,
    }

    localStorage.setItem(`kolkrabbi-file-${fileId}`, JSON.stringify(fileData))
    return true
  } catch (e) {
    console.error('Error saving file:', e)
    return false
  }
}

/**
 * Load a file from localStorage
 */
export const loadFile = (fileId) => {
  try {
    const data = localStorage.getItem(`kolkrabbi-file-${fileId}`)
    if (!data) return null
    return JSON.parse(data)
  } catch (e) {
    console.error('Error loading file:', e)
    return null
  }
}

/**
 * Delete a file from localStorage
 */
export const deleteFile = (fileId) => {
  try {
    localStorage.removeItem(`kolkrabbi-file-${fileId}`)
    return true
  } catch (e) {
    console.error('Error deleting file:', e)
    return false
  }
}

/**
 * Get all saved files
 */
export const getAllFiles = () => {
  const files = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith('kolkrabbi-file-')) {
      try {
        const data = JSON.parse(localStorage.getItem(key))
        files.push({
          id: key.replace('kolkrabbi-file-', ''),
          name: data.name || 'Untitled',
          updatedAt: data.updatedAt || Date.now(),
          thumbnail: data.thumbnail,
        })
      } catch (e) {
        console.error('Error loading file:', key, e)
      }
    }
  }
  return files.sort((a, b) => b.updatedAt - a.updatedAt)
}

/**
 * Generate a unique file ID
 */
export const generateFileId = () => {
  return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
