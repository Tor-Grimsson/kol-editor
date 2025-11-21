import { useState, useEffect } from 'react'
import Button from '../components/atoms/Button'

const HomeScreen = ({ onOpenFile, onNewFile }) => {
  const [files, setFiles] = useState([])

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = () => {
    const savedFiles = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('kolkrabbi-file-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key))
          savedFiles.push({
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
    // Sort by most recent first
    savedFiles.sort((a, b) => b.updatedAt - a.updatedAt)
    setFiles(savedFiles)
  }

  const deleteFile = (id) => {
    if (confirm('Are you sure you want to delete this file?')) {
      localStorage.removeItem(`kolkrabbi-file-${id}`)
      loadFiles()
    }
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-surface-primary text-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Kolkrabbi Editor</h1>
            <p className="text-fg-64 mt-1">Your design files</p>
          </div>
          <Button variant="primary" onClick={onNewFile}>
            + New File
          </Button>
        </div>

        {/* Files Grid */}
        {files.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-fg-48 mb-4">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-lg">No files yet</p>
              <p className="text-sm mt-2">Create your first design file to get started</p>
            </div>
            <Button variant="primary" onClick={onNewFile}>
              Create New File
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="group bg-container-primary rounded-lg overflow-hidden border border-fg-08 hover:border-fg-08 transition-colors cursor-pointer"
                onClick={() => onOpenFile(file.id)}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-surface-primary flex items-center justify-center">
                  {file.thumbnail ? (
                    <img
                      src={file.thumbnail}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-12 h-12 text-fg-24"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium text-sm truncate flex-1">{file.name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteFile(file.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 text-fg-48 hover:text-red-400 transition-all ml-2"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-fg-48">{formatDate(file.updatedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HomeScreen
