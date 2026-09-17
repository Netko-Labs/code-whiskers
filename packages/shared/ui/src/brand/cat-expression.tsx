import type { CSSProperties, ReactNode } from 'react'
import { CatEyes, CatMarks, CatMouth, CatRow, CatTail } from './cat-parts'
import type { CatExpressionName, CatExpressionProps } from './lib'
import {
  BRAND_NAME,
  CAT_BODY_EARS,
  CAT_BODY_FLAT,
  CAT_EXPRESSIONS,
  CAT_FILL_INK,
  CAT_INK,
  CAT_OFFSET,
  CAT_PAPER,
  CAT_VIEWBOX,
  CAT_VIEWBOX_CROP,
} from './lib'

// Pop (found) and shake (blocker) move the whole drawing; breathe (sleeping) only the face
function Motion({
  expression,
  animated,
  children,
}: {
  expression: CatExpressionName
  animated: boolean
  children: ReactNode
}) {
  if (!animated) return <>{children}</>
  if (expression === 'found') {
    return (
      <g transform="translate(512 600)">
        <g>
          <animateTransform
            attributeName="transform"
            type="scale"
            values="0.94;0.94;1.06;1;1;0.94"
            keyTimes="0;0.1;0.2;0.3;0.9;1"
            dur="3s"
            repeatCount="indefinite"
          />
          <g transform="translate(-512 -600)">{children}</g>
        </g>
      </g>
    )
  }
  if (expression === 'blocker') {
    return (
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0;-16 0;16 0;-12 0;12 0;-6 0;0 0;0 0"
          keyTimes="0;0.05;0.1;0.15;0.2;0.25;0.3;1"
          dur="2.4s"
          repeatCount="indefinite"
        />
        {children}
      </g>
    )
  }
  return <>{children}</>
}

function Face({ expression, animated }: { expression: CatExpressionName; animated: boolean }) {
  const spec = CAT_EXPRESSIONS[expression]
  const face = (
    <>
      <CatEyes eyes={spec.eyes} animated={animated} />
      <CatMouth mouth={spec.mouth} />
    </>
  )
  if (animated && expression === 'sleeping') {
    return (
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0;0 -10;0 0"
          dur="4s"
          repeatCount="indefinite"
        />
        {face}
      </g>
    )
  }
  return face
}

export function CatExpression({
  expression = 'idle',
  animated = false,
  crop = false,
  size = 112,
  tone = 'light',
  ink,
  paper,
  className,
  style,
  label,
}: CatExpressionProps) {
  const spec = CAT_EXPRESSIONS[expression]
  const inkColor = ink ?? (tone === 'light' ? CAT_INK : CAT_PAPER)
  const paperColor = paper ?? (tone === 'light' ? CAT_PAPER : CAT_INK)
  // A cropped frame is 720x620; with a CSS size, leave height unset so the viewBox keeps the ratio
  const height = !crop
    ? size
    : typeof size === 'number'
      ? Math.round((size * 620) / 720)
      : undefined

  return (
    <svg
      viewBox={crop ? CAT_VIEWBOX_CROP : CAT_VIEWBOX}
      width={size}
      height={height}
      role="img"
      aria-label={label ?? `${BRAND_NAME} cat, ${expression}`}
      className={className}
      style={
        {
          overflow: 'visible',
          '--cw-ink': inkColor,
          '--cw-bg': paperColor,
          ...style,
        } as CSSProperties
      }
    >
      <g transform={CAT_OFFSET}>
        <Motion expression={expression} animated={animated}>
          <path d={spec.body === 'flat' ? CAT_BODY_FLAT : CAT_BODY_EARS} fill={CAT_FILL_INK} />
          <Face expression={expression} animated={animated} />
          <CatTail tail={spec.tail} animated={animated} />
          <CatRow row={spec.row} animated={animated} />
          <CatMarks mark={spec.mark} animated={animated} />
        </Motion>
      </g>
    </svg>
  )
}
