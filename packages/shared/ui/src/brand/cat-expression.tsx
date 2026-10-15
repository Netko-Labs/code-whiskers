import type { CatExpressionProps } from './lib'
import {
  BRAND_NAME,
  MOUSE_CROP_RATIO,
  MOUSE_VIEWBOX,
  MOUSE_VIEWBOX_CROP,
  paletteStyle,
} from './lib'
import { MouseScene } from './mouse-parts'

export function CatExpression({
  expression = 'idle',
  animated = false,
  crop = false,
  size = 112,
  tone = 'light',
  ink,
  paper,
  accent,
  className,
  style,
  label,
}: CatExpressionProps) {
  // With a CSS size, leave height unset so the viewBox keeps the ratio
  const height = !crop
    ? size
    : typeof size === 'number'
      ? Math.round(size * MOUSE_CROP_RATIO)
      : undefined

  return (
    <svg
      viewBox={crop ? MOUSE_VIEWBOX_CROP : MOUSE_VIEWBOX}
      width={size}
      height={height}
      role="img"
      aria-label={label ?? `${BRAND_NAME} mouse, ${expression}`}
      className={className}
      style={{ overflow: 'visible', ...paletteStyle(tone, { ink, paper, accent }), ...style }}
    >
      <MouseScene expression={expression} animated={animated} />
    </svg>
  )
}
