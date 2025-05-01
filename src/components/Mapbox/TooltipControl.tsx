import type { MapRef } from 'react-map-gl/mapbox'
import type { TooltipControlConfig } from 'weatherlayers-gl'

import React from 'react'
import * as WeatherLayers from 'weatherlayers-gl'

type TooltipControlProps = TooltipControlConfig & {
  mapInstance: React.RefObject<MapRef | null>
  ref: React.RefObject<WeatherLayers.TooltipControl | null>
}

const TooltipControl = ({
  directionFormat,
  mapInstance,
  ref,
  unitFormat,
  followCursor = true,
  ...restProps
}: TooltipControlProps): null => {
  React.useEffect(() => {
    if (!mapInstance || !mapInstance.current) return

    const tooltipControl = new WeatherLayers.TooltipControl({
      unitFormat,
      directionFormat,
      followCursor,
      ...restProps
    })

    const parentElement = mapInstance.current.getCanvas().parentElement as HTMLElement | null
    if (parentElement) {
      tooltipControl.addTo(parentElement)

      if (ref) {
        ref.current = tooltipControl
      }
    }

    return () => {
      tooltipControl.remove()

      if (ref) {
        ref.current = null
      }
    }
  }, [
    directionFormat,
    followCursor,
    mapInstance,
    ref,
    restProps,
    unitFormat
  ])

  return null
}

export default TooltipControl