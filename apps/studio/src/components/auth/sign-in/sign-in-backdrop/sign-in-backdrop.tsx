import { CatExpression } from '@code-whiskers/ui/brand'
import {
  BACKDROP_CELL_SIZE,
  BACKDROP_INK,
  BACKDROP_PAPER,
  BACKDROP_TILE_SIZE,
  BACKDROP_TILES,
} from '../lib'

const COLUMNS = 4
const PATTERN_SIZE = BACKDROP_CELL_SIZE * COLUMNS
const TILE_INSET = (BACKDROP_CELL_SIZE - BACKDROP_TILE_SIZE) / 2

// One 4x4 pattern tile, repeated by the GPU: 16 SVGs instead of one per cell
export function SignInBackdrop() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-45 md:opacity-100"
    >
      <defs>
        <pattern
          id="cw-backdrop"
          width={PATTERN_SIZE}
          height={PATTERN_SIZE}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-8) scale(0.85)"
        >
          {BACKDROP_TILES.map((tile, i) => {
            const x = (i % COLUMNS) * BACKDROP_CELL_SIZE + TILE_INSET
            const y = Math.floor(i / COLUMNS) * BACKDROP_CELL_SIZE + TILE_INSET
            const center = BACKDROP_TILE_SIZE / 2
            return (
              <g
                key={`${tile.expression}-${i}`}
                transform={`translate(${x} ${y}) rotate(${tile.rotate} ${center} ${center})`}
              >
                <CatExpression
                  expression={tile.expression}
                  size={BACKDROP_TILE_SIZE}
                  ink={BACKDROP_INK}
                  paper={BACKDROP_PAPER}
                />
              </g>
            )
          })}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cw-backdrop)" />
    </svg>
  )
}
