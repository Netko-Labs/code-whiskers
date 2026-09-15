import type { CatMouthProps } from '../lib'
import {
  CAT_FILL_PAPER,
  CAT_MOUTH_FROWN,
  CAT_MOUTH_IDLE,
  CAT_MOUTH_SMILE,
  CAT_MOUTH_SMIRK,
  CAT_MOUTH_WORRY,
  CAT_NOSE,
} from '../lib'

const MOUTH_PATHS = {
  idle: CAT_MOUTH_IDLE,
  smile: CAT_MOUTH_SMILE,
  worry: CAT_MOUTH_WORRY,
  frown: CAT_MOUTH_FROWN,
  smirk: CAT_MOUTH_SMIRK,
} as const

export function CatMouth({ mouth }: CatMouthProps) {
  return (
    <>
      <path d={CAT_NOSE} fill={CAT_FILL_PAPER} />
      {mouth === 'o' ? (
        <circle cx={512} cy={500} r={13} fill="none" stroke={CAT_FILL_PAPER} strokeWidth={10} />
      ) : (
        <path
          d={MOUTH_PATHS[mouth]}
          fill="none"
          stroke={CAT_FILL_PAPER}
          strokeWidth={mouth === 'smile' ? 14 : 12}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </>
  )
}
