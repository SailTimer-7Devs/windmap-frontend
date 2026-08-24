import type { ReactElement } from 'react'

type HourlyForecastButtonProps = {
  onClick: () => void
  bottomOffset?: number
}

export default function HourlyForecastButton({ onClick, bottomOffset }: HourlyForecastButtonProps): ReactElement {
  return (
    <button
      type='button'
      className='absolute left-4 z-[60] flex items-center gap-2 rounded border border-[#34516f] bg-[#071628]/95 px-3 py-2 text-xs font-semibold text-[#b9ddff] shadow-lg backdrop-blur hover:bg-[#0b223a] focus:outline-none focus:ring-2 focus:ring-[#b9ddff]'
      style={{ bottom: bottomOffset ?? 80 }}
      aria-label='Open hourly forecast'
      onClick={onClick}
    >
      <svg
        className='h-5 w-5 shrink-0'
        viewBox='0 0 24 24'
        fill='none'
        aria-hidden='true'
      >
        <path
          d='M3 8h10.5c2 0 3.5-1.2 3.5-3 0-1.4-1.1-2.5-2.5-2.5-1.1 0-2 .6-2.4 1.5M3 12h15c1.7 0 3 1.2 3 2.8s-1.3 2.7-2.8 2.7c-1.2 0-2.1-.6-2.5-1.5M3 16h7'
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='1.8'
        />
      </svg>
      <span>Hourly Forecast</span>
    </button>
  )
}
