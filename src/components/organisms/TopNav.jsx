import Button from '../atoms/Button'
import Icon from '../icons/Icon'

const TopNav = ({
  onCanvasSizeClick,
  onClearDocument,
  canvasSize
}) => {
  return (
    <nav className="w-full border-b border-zinc-800 bg-zinc-900 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="tracking-wide text-zinc-400">KOL--EDI--TóR</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          square
          variant="ghost"
          title="Canvas Size"
          onClick={onCanvasSizeClick}
        >
          <Icon name="layout" folder="tools-name/shape-align" size={20} />
        </Button>
        <Button
          square
          variant="ghost"
          title="Clear Document"
          onClick={onClearDocument}
        >
          <Icon name="corner-diag" folder="tools-name/shape-align" size={20} />
        </Button>
        <Button
          square
          variant="ghost"
          title="Load (pending)"
          disabled
        >
          <Icon name="photo-03" folder="a1" size={20} />
        </Button>
      </div>
    </nav>
  )
}

export default TopNav
