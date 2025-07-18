import type { TimelineControlConfig } from 'weatherlayers-gl'

import React from 'react'
import * as WeatherLayers from 'weatherlayers-gl'

const TimelineControl = (props: TimelineControlConfig): null => {
  React.useEffect(() => {
    const timelineControl = new WeatherLayers.TimelineControl({ ...props })

    const el = document.getElementsByClassName('mapboxgl-ctrl-bottom-left')[0] as HTMLElement

    timelineControl.addTo(el)

    return () => {
      timelineControl.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.datetimes])

  return null
}

export default TimelineControl