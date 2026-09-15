import { CatExpression } from '@code-whiskers/ui/brand'
import {
  BACKDROP_CELL_SIZE,
  BACKDROP_INK,
  BACKDROP_PAPER,
  BACKDROP_TILE_COUNT,
  BACKDROP_TILE_SIZE,
  BACKDROP_TILES,
} from '../lib'

const TILES = Array.from({ length: BACKDROP_TILE_COUNT }, (_, i) => ({
  key: i,
  ...BACKDROP_TILES[i % BACKDROP_TILES.length],
}))

export function SignInBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-45 md:opacity-100"
    >
      <div
        className="absolute -inset-[20%] grid origin-center content-start"
        style={{
          gridTemplateColumns: `repeat(auto-fill, ${BACKDROP_CELL_SIZE}px)`,
          gridAutoRows: `${BACKDROP_CELL_SIZE}px`,
          transform: 'rotate(-8deg) scale(0.85)',
        }}
      >
        {TILES.map((tile) => (
          <div key={tile.key} className="flex items-center justify-center">
            <CatExpression
              expression={tile.expression}
              size={BACKDROP_TILE_SIZE}
              ink={BACKDROP_INK}
              paper={BACKDROP_PAPER}
              style={{ transform: `rotate(${tile.rotate}deg)` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
