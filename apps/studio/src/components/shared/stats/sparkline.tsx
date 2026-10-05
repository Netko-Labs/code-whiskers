import { cn } from '@code-whiskers/ui/lib/utils'
import { TONE_STROKE } from '@/components/shared/status'
import { type SparkLinePathsProps, type SparklineProps, sparkBars, sparklineGeometry } from './lib'

/** Plain SVG, no chart library: cheap enough for one per row. Colors follow `currentColor`. */
export function Sparkline({
  values,
  width = 96,
  height = 28,
  tone = 'info',
  variant = 'line',
  label,
  className,
}: SparklineProps) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }

  return (
    <svg
      {...a11y}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('shrink-0 overflow-visible', TONE_STROKE[tone], className)}
    >
      {variant === 'bars' ? (
        <g className="animate-enter">
          {sparkBars(values, width, height).map((bar, index) => (
            <rect key={index} {...bar} rx={1} className="fill-current opacity-70" />
          ))}
        </g>
      ) : (
        <SparkLinePaths values={values} width={width} height={height} />
      )}
    </svg>
  )
}

function SparkLinePaths({ values, width, height }: SparkLinePathsProps) {
  const { line, area } = sparklineGeometry(values, width, height)
  return (
    <>
      <path d={area} className="animate-enter fill-current opacity-[0.08]" />
      <path
        d={line}
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-draw [stroke-dasharray:1]"
      />
    </>
  )
}
