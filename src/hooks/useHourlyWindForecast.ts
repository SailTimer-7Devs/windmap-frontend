import type { TextureData } from 'weatherlayers-gl/client'

import React from 'react'
import * as WeatherLayers from 'weatherlayers-gl'

import * as BASE from 'constants/basemap'
import { WIND_LAYER_KEYS, windTimelineFiles } from 'constants/layer/wind'
import { UNIT_FORMAT } from 'constants/layer/units'

import type { LayerKey } from 'types'

import { handleImageDataLoad } from 'lib/image'
import { formatRasterPoint } from 'lib/wind'
import type { WindPointReading } from 'lib/wind'

export type HourlyWindForecast = {
  datetime: string
  reading: WindPointReading
}

type Coordinates = {
  longitude: number
  latitude: number
}

type HourlyWindForecastState = {
  forecasts: HourlyWindForecast[]
  isLoading: boolean
  error: string | null
}

const EMPTY_STATE: HourlyWindForecastState = {
  forecasts: [],
  isLoading: false,
  error: null
}

function sampleWindTexture(
  image: TextureData,
  coordinates: Coordinates
): WindPointReading | null {
  const feature = WeatherLayers.getRasterPoints(
    {
      image,
      image2: null,
      imageSmoothing: 0,
      imageInterpolation: WeatherLayers.ImageInterpolation.CUBIC,
      imageWeight: 0,
      imageType: WeatherLayers.ImageType.VECTOR,
      imageUnscale: BASE.IMAGE_UNSCALE,
      imageMinValue: null,
      imageMaxValue: null
    },
    [-180, -90, 180, 90],
    [[coordinates.longitude, coordinates.latitude]]
  ).features[0]

  if (!feature || !Number.isFinite(feature.properties.value)) return null

  return formatRasterPoint(
    feature.properties,
    UNIT_FORMAT[WIND_LAYER_KEYS.WIND_TOOLTIP as LayerKey] || 'knots',
    true
  )
}

export default function useHourlyWindForecast(
  coordinates: Coordinates | null,
  datetimes: string[],
  enabled: boolean
): HourlyWindForecastState {
  const [state, setState] = React.useState<HourlyWindForecastState>(EMPTY_STATE)

  React.useEffect(() => {
    if (!enabled || !coordinates) {
      setState(EMPTY_STATE)
      return
    }

    let isCancelled = false
    const forecastCoordinates = coordinates
    setState({ forecasts: [], isLoading: true, error: null })

    async function loadForecasts() {
      const forecasts: HourlyWindForecast[] = []

      /* Load and sample one frame at a time. Keeping all six decoded rasters
         in a shared cache can pressure Chrome's emulated WebGL context and,
         after context replacement, leave the original map layers holding
         textures created by the previous context. */
      for (let index = 0; index < datetimes.length; index++) {
        try {
          const image = await handleImageDataLoad(windTimelineFiles.windMap[index])
          if (isCancelled) return

          const reading = sampleWindTexture(image, forecastCoordinates)
          if (reading) {
            forecasts.push({ datetime: datetimes[index], reading })
            setState({
              forecasts: [...forecasts],
              isLoading: true,
              error: null
            })
          }
        } catch (error: unknown) {
          console.error(error)
        }
      }

      if (!isCancelled) {
        if (forecasts.length) {
          setState({
            forecasts,
            isLoading: false,
            error: null
          })
        } else {
          setState({
            forecasts: [],
            isLoading: false,
            error: 'No wind forecast is available at your location.'
          })
        }
      }
    }

    loadForecasts()

    return () => {
      isCancelled = true
    }
  }, [coordinates, datetimes, enabled])

  return state
}
