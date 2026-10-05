import type { ReactElement } from 'react'

import type { HourlyWindForecast as HourlyWindForecastItem } from 'hooks/useHourlyWindForecast'

type HourlyWindForecastProps = {
  forecasts: HourlyWindForecastItem[]
  selectedDatetime: string
  isLocating: boolean
  locationError: string | null
  showLocationHelp: boolean
  forecastError: string | null
  onRequestLocation: () => void
  onSelect: (datetime: string) => void
  onClose: () => void
}

const hourFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric'
})

export default function HourlyWindForecast({
  forecasts,
  selectedDatetime,
  isLocating,
  locationError,
  showLocationHelp,
  forecastError,
  onRequestLocation,
  onSelect,
  onClose
}: HourlyWindForecastProps): ReactElement {
  const message = locationError || forecastError

  return (
    <section
      className='absolute z-50 left-4 right-4 top-16 mx-auto max-w-xl overflow-hidden rounded bg-gray-900/95 text-white shadow-lg backdrop-blur'
      aria-label='Hourly wind forecast at your location'
    >
      <header className='flex items-center justify-between border-b border-gray-700 px-2.5 py-1.5'>
        <h2 className='text-xs font-bold leading-tight'>Hourly wind at your location</h2>

        <button
          type='button'
          className='ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded text-lg leading-none text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white'
          aria-label='Close hourly wind forecast'
          onClick={onClose}
        >
          ×
        </button>
      </header>

      <div className='min-h-12'>
        {message ? (
          <div className='flex flex-col items-center gap-2 px-3 py-3 text-center'>
            <p className='text-[11px] text-gray-300'>{message}</p>

            {locationError && (
              <>
                {showLocationHelp && (
                  <div className='w-full max-w-md rounded border border-[#34516f] bg-[#071628] px-3 py-2 text-left text-[10px] leading-relaxed text-gray-200'>
                    <p className='mb-1 font-semibold text-[#b9ddff]'>Allow location access</p>
                    <ol className='list-decimal space-y-0.5 pl-4'>
                      <li>Open your device or browser settings.</li>
                      <li>Allow location access for SailTimer.</li>
                      <li>Return here and tap <strong>Try again</strong>.</li>
                    </ol>
                  </div>
                )}

                <button
                  type='button'
                  className='rounded border border-gray-300 bg-gray-100 px-3 py-1.5 text-[11px] font-semibold text-[#071628] shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-white'
                  onClick={onRequestLocation}
                >
                  {showLocationHelp ? 'Try again' : 'Request location access'}
                </button>
              </>
            )}
          </div>
        ) : isLocating ? (
          <p className='px-3 py-3 text-center text-[11px] text-gray-300'>Finding your location…</p>
        ) : !forecasts.length ? (
          <p className='px-3 py-3 text-center text-[11px] text-gray-300'>Loading hourly wind forecast…</p>
        ) : (
          <div className='flex snap-x overflow-x-auto'>
            {forecasts.map(({ datetime, reading }) => {
              const selected = datetime === selectedDatetime

              return (
                <button
                  key={datetime}
                  type='button'
                  className={`min-w-[76px] flex-1 snap-start border-r border-gray-700 px-2 py-2 text-center last:border-r-0 ${
                    selected ? 'bg-gray-700 text-white' : 'bg-transparent text-gray-200'
                  }`}
                  aria-pressed={selected}
                  onClick={() => onSelect(datetime)}
                >
                  <span className='block text-xs font-semibold'>
                    {hourFormatter.format(new Date(datetime))}
                  </span>

                  <svg
                    className='mx-auto my-1 h-5 w-5 text-white'
                    viewBox='0 0 24 24'
                    aria-hidden='true'
                    style={{
                      transform: typeof reading.direction === 'number'
                        ? `rotate(${(reading.direction + 180) % 360}deg)`
                        : undefined
                    }}
                  >
                    <path
                      d='M12 3v18M12 3 7.5 7.5M12 3l4.5 4.5'
                      fill='none'
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                    />
                  </svg>

                  <span className='block text-xs font-bold'>
                    {Math.round(reading.value)} {reading.unit}
                  </span>
                  <span className='block text-[10px] text-gray-400'>
                    {typeof reading.direction === 'number'
                      ? `from ${Math.round(reading.direction)}° ${reading.directionLabel || ''}`.trim()
                      : 'from —'}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
