import type { CatTailProps } from '../lib'
import { CAT_FILL_INK, CAT_TAIL_DOWN, CAT_TAIL_REST, CAT_TAIL_UP } from '../lib'

const TAIL_PATHS = {
  rest: CAT_TAIL_REST,
  up: CAT_TAIL_UP,
  down: CAT_TAIL_DOWN,
} as const

export function CatTail({ tail, animated }: CatTailProps) {
  return (
    <path
      d={TAIL_PATHS[tail]}
      fill="none"
      stroke={CAT_FILL_INK}
      strokeWidth={52}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {animated && tail === 'rest' && (
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 724 700;7 724 700;0 724 700;-5 724 700;0 724 700"
          keyTimes="0;0.25;0.5;0.75;1"
          dur="5s"
          repeatCount="indefinite"
        />
      )}
    </path>
  )
}
