// Load default chess vector set
const svgModules = import.meta.glob('../../assets/chess-vector-set/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default'
})

// Load extra chess sets (set-1, set-2, set-3)
const extraSet1Modules = import.meta.glob('../../assets/chess-extra-set/set-1/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default'
})

const extraSet2Modules = import.meta.glob('../../assets/chess-extra-set/set-2/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default'
})

const extraSet3Modules = import.meta.glob('../../assets/chess-extra-set/set-3/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default'
})

const PIECE_KEY_MAP = {
  white: {
    king: 'WKing',
    queen: 'WQueen',
    rook: 'WRook',
    bishop: 'WBiskup',
    knight: 'WKnight',
    pawn: 'WPawn'
  },
  black: {
    king: 'BKing',
    queen: 'BQueen',
    rook: 'BRook',
    bishop: 'BBiskup',
    knight: 'BKnight',
    pawn: 'BPawn'
  }
}

// Map for extra sets (use simpler naming convention)
const EXTRA_SET_PIECE_MAP = {
  white: {
    king: 'king-1',
    queen: 'queen-1',
    rook: 'rook-1',
    bishop: 'bishop-1',
    knight: 'knight-1',
    pawn: 'pawn-1'
  },
  black: {
    king: 'king',
    queen: 'queen',
    rook: 'rook',
    bishop: 'bishop',
    knight: 'knight',
    pawn: 'pawn'
  }
}

const PIECE_CACHE = Object.entries(svgModules).reduce((acc, [path, svgContent]) => {
  const fileName = path.split('/').pop() || ''
  const key = fileName.replace('.svg', '')
  acc[key] = svgContent
  return acc
}, {})

// Cache for extra sets
const EXTRA_SET_1_CACHE = Object.entries(extraSet1Modules).reduce((acc, [path, svgContent]) => {
  const fileName = path.split('/').pop() || ''
  const key = fileName.replace('.svg', '')
  acc[key] = svgContent
  return acc
}, {})

const EXTRA_SET_2_CACHE = Object.entries(extraSet2Modules).reduce((acc, [path, svgContent]) => {
  const fileName = path.split('/').pop() || ''
  const key = fileName.replace('.svg', '')
  acc[key] = svgContent
  return acc
}, {})

const EXTRA_SET_3_CACHE = Object.entries(extraSet3Modules).reduce((acc, [path, svgContent]) => {
  const fileName = path.split('/').pop() || ''
  const key = fileName.replace('.svg', '')
  acc[key] = svgContent
  return acc
}, {})

const normalizeSize = (value) => {
  if (typeof value === 'number') {
    return `${value}px`
  }
  if (typeof value === 'string') {
    return value
  }
  return '64px'
}

const applySizeToMarkup = (markup) => {
  let updated = markup
  updated = updated.replace(/width="[^"]*"/i, 'width="100%"')
  updated = updated.replace(/height="[^"]*"/i, 'height="100%"')
  return updated
}

const ChessPieceBase = ({
  size = 64,
  className = '',
  style = {},
  children
}) => {
  const dimension = normalizeSize(size)

  return (
    <div
      className={`relative inline-flex aspect-square items-center justify-center ${className}`}
      style={{
        width: dimension,
        height: dimension,
        ...style
      }}
    >
      {children}
    </div>
  )
}

const ChessPiece = ({
  piece,
  color = 'white',
  size = 64,
  className = '',
  style = {},
  pieceSet = 'default'
}) => {
  const normalizedColor = color === 'black' ? 'black' : 'white'

  let pieceKey
  let cache

  // Select piece set and cache
  if (pieceSet === 'set-1') {
    pieceKey = EXTRA_SET_PIECE_MAP[normalizedColor]?.[piece]
    cache = EXTRA_SET_1_CACHE
  } else if (pieceSet === 'set-2') {
    pieceKey = EXTRA_SET_PIECE_MAP[normalizedColor]?.[piece]
    cache = EXTRA_SET_2_CACHE
  } else if (pieceSet === 'set-3') {
    pieceKey = EXTRA_SET_PIECE_MAP[normalizedColor]?.[piece]
    cache = EXTRA_SET_3_CACHE
  } else {
    // Default set
    pieceKey = PIECE_KEY_MAP[normalizedColor]?.[piece]
    cache = PIECE_CACHE
  }

  const markup = pieceKey ? cache[pieceKey] : null

  if (!markup) {
    console.warn(`ChessPiece: No asset found for ${normalizedColor} ${piece} in set ${pieceSet}`)
    return null
  }

  return (
    <ChessPieceBase
      size={size}
      className={`text-current ${className}`}
      style={style}
    >
      <span
        className="block h-full w-full"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        dangerouslySetInnerHTML={{ __html: applySizeToMarkup(markup) }}
      />
    </ChessPieceBase>
  )
}

ChessPiece.Base = ChessPieceBase

export default ChessPiece
