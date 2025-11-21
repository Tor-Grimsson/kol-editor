import Button from '../atoms/Button'
import Icon from '../icons/Icon'
import ThemeToggle from '../atoms/ThemeToggle'

const TopNav = ({
  fileName,
  onFileNameChange,
  onCanvasSizeClick,
  onClearDocument,
  onGoHome,
  canvasSize
}) => {
  return (
    <nav className="w-full border-b border-fg-08 bg-surface-primary px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          square
          variant="ghost"
          title="Go to Home"
          onClick={onGoHome}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Button>
        <input
          type="text"
          value={fileName}
          onChange={(e) => onFileNameChange(e.target.value)}
          className="text-auto font-medium bg-transparent border-none outline-none focus:bg-fg-08 px-2 py-1 rounded kol-mono-text"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          square
          variant="ghost"
          title="Canvas Size"
          onClick={onCanvasSizeClick}
        >
          <Icon name="layout" folder="active/navigation" size={20} />
        </Button>
        <Button
          square
          variant="ghost"
          title="Clear Document"
          onClick={onClearDocument}
        >
          <Icon name="corner-diag" folder="active/navigation" size={20} />
        </Button>
        <ThemeToggle variant="icon" />
      </div>
    </nav>
  )
}

export default TopNav
