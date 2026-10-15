import type { CatMarkProps } from './lib'
import {
  BRAND_NAME,
  CAT_CUT_TRANSFORMS,
  CAT_EXPRESSIONS,
  CAT_FILL_PAPER,
  CAT_SMALL_SIZE,
  CAT_VIEWBOX,
  paletteStyle,
} from './lib'
import { MouseBody, MouseEnso } from './mouse-parts'

export function CatMark({
  cut = 'icon',
  size = 32,
  tone = 'light',
  ink,
  paper,
  accent,
  background = cut !== 'round',
  className,
  style,
  label = BRAND_NAME,
}: CatMarkProps) {
  // Same optical cut as the 16px favicon: heavier ensō and tail, no face, no whiskers
  const isSmall = typeof size === 'number' && size <= CAT_SMALL_SIZE

  return (
    <svg
      viewBox={CAT_VIEWBOX}
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className={className}
      style={{ ...paletteStyle(tone, { ink, paper, accent }), ...style }}
    >
      {background &&
        (cut === 'round' ? (
          <circle cx={512} cy={512} r={512} fill={CAT_FILL_PAPER} />
        ) : (
          <rect width={1024} height={1024} fill={CAT_FILL_PAPER} />
        ))}
      <g transform={CAT_CUT_TRANSFORMS[cut]}>
        <MouseEnso state="still" animated={false} bold={isSmall} />
        <MouseBody
          spec={CAT_EXPRESSIONS.idle}
          animated={false}
          whiskers={cut !== 'favicon' && !isSmall}
          face={!isSmall}
          bold={isSmall}
        />
      </g>
    </svg>
  )
}
