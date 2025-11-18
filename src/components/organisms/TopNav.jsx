import Button from '../atoms/Button'

const TopNav = ({
  onCanvasSizeClick,
  onClearDocument,
  canvasSize
}) => {
  return (
    <nav className="w-full border-b border-zinc-800 bg-zinc-900 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="uppercase tracking-wide text-zinc-400">Konva Layer Editor</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          square
          variant="default"
          title="Canvas Size"
          onClick={onCanvasSizeClick}
        >
          É
        </Button>
        <Button
          square
          variant="default"
          title="Clear Document"
          onClick={onClearDocument}
        >
          +
        </Button>
        <Button
          square
          variant="default"
          title="Load (pending)"
          disabled
        >
          =Â
        </Button>
      </div>
    </nav>
  )
}

export default TopNav
