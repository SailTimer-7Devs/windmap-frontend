import type { TimelineControlConfig } from 'weatherlayers-gl'

import { formatDateToLocalISOString } from 'lib/date'

import React from 'react'
import * as WeatherLayers from 'weatherlayers-gl'

const TimelineControl = (props: TimelineControlConfig): null => {
  const { datetime, datetimes } = props
  React.useEffect(() => {
    const timelineControl = new WeatherLayers.TimelineControl({ ...props })

    const el = document.getElementsByClassName('mapboxgl-ctrl-bottom-left')[0] as HTMLElement

    timelineControl.addTo(el)

    return () => {
      timelineControl.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datetimes])

  React.useEffect(() => {
    const current = document.getElementsByClassName('weatherlayers-timeline-control__current-datetime')[0] as HTMLElement
    const startDate = document.getElementsByClassName('weatherlayers-timeline-control__start-datetime')[0] as HTMLElement
    const endDate = document.getElementsByClassName('weatherlayers-timeline-control__end-datetime')[0] as HTMLElement

    startDate.innerText = formatDateToLocalISOString(datetimes[0])
    endDate.innerText = formatDateToLocalISOString(datetimes[datetimes.length - 1])
    current.innerText = formatDateToLocalISOString(datetime)

  }, [datetime])

  return null
}

export default TimelineControl
