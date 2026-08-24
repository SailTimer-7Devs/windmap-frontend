import type { ReactElement, ReactNode } from 'react'

import type { HourlyWniForecast as HourlyWniForecastItem } from 'hooks/useHourlyWniForecast'

import IntegratedPrecipitationIcon from 'icons/IntegratedPrecipitation'
import SeaTemperatureIcon from 'icons/SeaTemperature'
import TemperatureHighIcon from 'icons/TemperatureHigh'
import WaveIcon from 'icons/Wave'
import WindAnimationIcon from 'icons/WindAnimation'

type HourlyWniForecastProps = {
  forecasts: HourlyWniForecastItem[]
  selectedDatetime: string
  isLocating: boolean
  locationError: string | null
  showLocationHelp: boolean
  forecastError: string | null
  onRequestLocation: () => void
  onSelect: (datetime: string) => void
  onClose: () => void
}

const hourFormatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric' })

const formatValue = (value: number | null, suffix: string, digits = 0): string => (
  value === null ? '—' : `${value.toFixed(digits)}${suffix}`
)

function DirectionArrow({ direction }: { direction?: number }): ReactElement {
  return (
    <svg
      className='h-4 w-4 shrink-0'
      viewBox='0 0 24 24'
      aria-hidden='true'
      style={{ transform: typeof direction === 'number' ? `rotate(${(direction + 180) % 360}deg)` : undefined }}
    >
      <path d='M12 3v18M12 3 7.5 7.5M12 3l4.5 4.5' fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' />
    </svg>
  )
}

function Metric({ icon, value, label, color }: {
  icon: ReactNode
  value: ReactNode
  label: string
  color: string
}): ReactElement {
  return (
    <div className={`flex min-h-[31px] flex-col items-center justify-center border-t border-white/10 px-0.5 ${color}`} title={label}>
      <div className='flex items-center justify-center gap-1 text-[10px] font-semibold leading-none'>
        {icon}
        <span className='whitespace-nowrap'>{value}</span>
      </div>
    </div>
  )
}

export default function HourlyWniForecast({
  forecasts,
  selectedDatetime,
  isLocating,
  locationError,
  showLocationHelp,
  forecastError,
  onRequestLocation,
  onSelect,
  onClose
}: HourlyWniForecastProps): ReactElement {
  const message = locationError || forecastError

  return (
    <section className='absolute left-3 right-3 top-16 z-50 mx-auto max-w-xl overflow-hidden rounded-md border border-[#34516f] bg-[#071628]/95 text-white shadow-xl backdrop-blur' aria-label='Hourly WNI forecast at your location'>
      <header className='flex items-center justify-between border-b border-[#34516f] px-2.5 py-1.5'>
        <div>
          <h2 className='text-xs font-bold leading-tight'>Hourly WNI forecast</h2>
          <p className='text-[9px] text-[#b9ddff]'>Weather at your location</p>
        </div>
        <button type='button' className='ml-2 flex h-6 w-6 items-center justify-center rounded text-lg text-gray-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white' aria-label='Close hourly WNI forecast' onClick={onClose}>×</button>
      </header>

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
              <button type='button' className='rounded border border-gray-300 bg-gray-100 px-3 py-1.5 text-[11px] font-semibold text-[#071628] shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-white' onClick={onRequestLocation}>
                {showLocationHelp ? 'Try again' : 'Request location access'}
              </button>
            </>
          )}
        </div>
      ) : isLocating ? (
        <p className='px-3 py-3 text-center text-[11px] text-gray-300'>Finding your location…</p>
      ) : !forecasts.length ? (
        <p className='px-3 py-3 text-center text-[11px] text-gray-300'>Loading WNI hourly forecast…</p>
      ) : (
        <div className='flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-color:#34516f_transparent] [scrollbar-width:thin]'>
          {forecasts.map(forecast => {
            const selected = forecast.datetime === selectedDatetime
            return (
              <button key={forecast.datetime} type='button' className={`w-1/5 min-w-[72px] shrink-0 snap-start border-r border-[#34516f] text-center last:border-r-0 ${selected ? 'bg-[#17304a]' : 'bg-transparent hover:bg-white/5'}`} aria-pressed={selected} onClick={() => onSelect(forecast.datetime)}>
                <span className='block py-1.5 text-[11px] font-bold'>{hourFormatter.format(new Date(forecast.datetime))}</span>
                <Metric label='Air temperature' color='text-[#ffd36a]' icon={<TemperatureHighIcon className='h-4 w-4' />} value={formatValue(forecast.airTemperature, '°')} />
                <Metric label='Precipitation' color='text-[#75cfff]' icon={<IntegratedPrecipitationIcon className='h-4 w-4' />} value={formatValue(forecast.precipitation, '', 1)} />
                <Metric label='Wind speed and direction' color='text-[#9ce8ff]' icon={<><WindAnimationIcon className='h-3.5 w-3.5' /><DirectionArrow direction={forecast.wind?.direction} /></>} value={forecast.wind ? `${Math.round(forecast.wind.value)} kt` : '—'} />
                <Metric label='Wave/swell height and direction' color='text-[#78e0d0]' icon={<><WaveIcon className='h-4 w-4' /><DirectionArrow direction={forecast.waveDirection?.direction} /></>} value={formatValue(forecast.waveHeight, ' ft', 1)} />
                <Metric label='Sea temperature' color='text-[#ff9f8f]' icon={<SeaTemperatureIcon className='h-4 w-4' />} value={formatValue(forecast.seaTemperature, '°')} />
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
