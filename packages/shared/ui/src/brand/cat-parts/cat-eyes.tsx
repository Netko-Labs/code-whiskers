import type { CatEyesProps } from '../lib'
import { CAT_EYE_SQUINT_RIGHT, CAT_EYES_CLOSED, CAT_EYES_HAPPY, CAT_FILL_PAPER } from '../lib'

const BLINK_VALUES = '24;24;3;24;24;24;3;24'
const BLINK_KEYTIMES = '0;0.42;0.45;0.48;0.56;0.6;0.63;0.66'

const stroke = {
  fill: 'none',
  stroke: CAT_FILL_PAPER,
  strokeWidth: 16,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function CatEyes({ eyes, animated }: CatEyesProps) {
  switch (eyes) {
    case 'round':
      return (
        <>
          <ellipse cx={430} cy={420} rx={24} ry={24} fill={CAT_FILL_PAPER}>
            {animated && (
              <animate
                attributeName="ry"
                values={BLINK_VALUES}
                keyTimes={BLINK_KEYTIMES}
                dur="5s"
                repeatCount="indefinite"
              />
            )}
          </ellipse>
          <ellipse cx={594} cy={420} rx={24} ry={24} fill={CAT_FILL_PAPER}>
            {animated && (
              <animate
                attributeName="ry"
                values={BLINK_VALUES}
                keyTimes={BLINK_KEYTIMES}
                dur="5s"
                repeatCount="indefinite"
              />
            )}
          </ellipse>
        </>
      )
    case 'lidded':
      return (
        <g>
          {animated && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="-10 0;10 0;10 0;-10 0;-10 0"
              keyTimes="0;0.4;0.5;0.9;1"
              dur="2.4s"
              repeatCount="indefinite"
            />
          )}
          <ellipse cx={430} cy={430} rx={24} ry={11} fill={CAT_FILL_PAPER} />
          <ellipse cx={594} cy={430} rx={24} ry={11} fill={CAT_FILL_PAPER} />
        </g>
      )
    case 'squint':
      return (
        <>
          <circle cx={430} cy={420} r={24} fill={CAT_FILL_PAPER} />
          <path d={CAT_EYE_SQUINT_RIGHT} {...stroke} />
        </>
      )
    case 'wide':
      return (
        <>
          <circle cx={430} cy={420} r={34} fill={CAT_FILL_PAPER} />
          <circle cx={594} cy={420} r={34} fill={CAT_FILL_PAPER} />
        </>
      )
    case 'happy':
      return <path d={CAT_EYES_HAPPY} {...stroke} />
    case 'dot':
      return (
        <>
          <circle cx={430} cy={420} r={14} fill={CAT_FILL_PAPER} />
          <circle cx={594} cy={420} r={14} fill={CAT_FILL_PAPER} />
        </>
      )
    case 'closed':
      return <path d={CAT_EYES_CLOSED} {...stroke} />
    case 'uneven':
      return (
        <>
          <circle cx={430} cy={424} r={24} fill={CAT_FILL_PAPER} />
          <circle cx={594} cy={412} r={15} fill={CAT_FILL_PAPER} />
        </>
      )
  }
}
