import type { AnimateProps, AroundProps, FillProps, SpinProps } from '../lib'

export function Animate({ attributeName, values, dur, keyTimes, begin }: AnimateProps) {
  return (
    <animate
      attributeName={attributeName}
      values={values}
      dur={dur}
      keyTimes={keyTimes}
      begin={begin}
      repeatCount="indefinite"
    />
  )
}

export function Spin({ type = 'rotate', values, dur, keyTimes, begin }: SpinProps) {
  return (
    <animateTransform
      attributeName="transform"
      type={type}
      values={values}
      dur={dur}
      keyTimes={keyTimes}
      begin={begin}
      repeatCount="indefinite"
    />
  )
}

// Scale and rotate SMIL transforms pivot on the origin; this moves the pivot to `at`
export function Around({ at: [x, y], motion, children }: AroundProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g>
        {motion}
        <g transform={`translate(${-x} ${-y})`}>{children}</g>
      </g>
    </g>
  )
}

export function Fill({ shapes, fill }: FillProps) {
  return shapes.map((d, i) => <path key={i} d={d} fill={fill} />)
}
