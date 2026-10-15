import type { AnimatedProps, MouseFaceProps, MouseMouthProps } from '../lib'
import {
  CAT_FILL_ACCENT,
  CAT_FILL_GLINT,
  CAT_FILL_INK,
  CAT_FILL_PAPER,
  MOUSE_BROWS,
  MOUSE_MOUTHS,
  MOUSE_NOSE,
} from '../lib'
import { MouseEye } from './mouse-eye'
import { Animate, Spin } from './smil'

const MOUTH_WIDTHS = { flat: 6, smile: 8, frown: 8, wavy: 6 }

function Mouth({ mouth, animated }: MouseMouthProps) {
  if (mouth === 'gasp') {
    return (
      <>
        <ellipse cx={842} cy={566} rx={20} ry={22} fill={CAT_FILL_INK} />
        <ellipse cx={842} cy={568} rx={10} ry={12} fill={CAT_FILL_ACCENT}>
          {animated && <Animate attributeName="ry" values="12;7;12" dur="0.9s" />}
        </ellipse>
      </>
    )
  }
  return (
    <path
      d={MOUSE_MOUTHS[mouth]}
      fill="none"
      stroke={CAT_FILL_PAPER}
      strokeWidth={MOUTH_WIDTHS[mouth]}
      strokeLinecap="round"
    />
  )
}

function Sweat({ animated }: AnimatedProps) {
  return (
    <path
      d="M716 380 Q700 404 716 418 Q732 404 716 380 Z"
      fill={CAT_FILL_GLINT}
      stroke={CAT_FILL_ACCENT}
      strokeWidth={5}
    >
      {animated && (
        <>
          <Spin type="translate" values="0 0;0 0;-4 26;-4 26" keyTimes="0;0.3;0.9;1" dur="1.6s" />
          <Animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.3;0.8;1" dur="1.6s" />
        </>
      )}
    </path>
  )
}

export function MouseFace({ spec, animated }: MouseFaceProps) {
  return (
    <>
      <MouseEye eye={spec.eye} animated={animated} />
      <Mouth mouth={spec.mouth} animated={animated} />
      {spec.brow !== 'none' && (
        <path
          d={MOUSE_BROWS[spec.brow]}
          fill="none"
          stroke={CAT_FILL_INK}
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {spec.blush && (
        <ellipse cx={812} cy={528} rx={16} ry={11} fill={CAT_FILL_ACCENT} opacity={0.6} />
      )}
      {spec.sweat && <Sweat animated={animated} />}
    </>
  )
}

export function MouseNose() {
  return <circle cx={MOUSE_NOSE[0]} cy={MOUSE_NOSE[1]} r={11} fill={CAT_FILL_ACCENT} />
}
