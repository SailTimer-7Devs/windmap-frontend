import type { LegendControlConfig } from 'weatherlayers-gl'

import React from 'react'

import * as WeatherLayers from 'weatherlayers-gl'

const LegendControl = ({
  title,
  unitFormat,
  palette
}: LegendControlConfig): null => {
  React.useEffect(() => {
    const legendControl = new WeatherLayers.LegendControl({
      title,
      unitFormat,
      palette
    })

    const el = document.getElementsByClassName('mapboxgl-ctrl-bottom-right')[0] as HTMLElement

    legendControl.addTo(el)

    /* Cleanup */
    return () => {
      legendControl.remove()
    }
  }, [title, unitFormat, palette])

  return null
}

export default LegendControl
