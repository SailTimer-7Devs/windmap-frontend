import type { TextureData } from 'weatherlayers-gl/client'

import React from 'react'
import * as WeatherLayers from 'weatherlayers-gl'

import { weatherWniTimelineFiles } from 'constants/layer/weather_wni'

import { handleImageDataLoad } from 'lib/image'
import { formatRasterPoint } from 'lib/wind'
import type { WindPointReading } from 'lib/wind'

type Coordinates = {
  longitude: number
  latitude: number
}

export type HourlyWniForecast = {
  datetime: string
  airTemperature: number | null
  precipitation: number | null
  wind: WindPointReading | null
  waveHeight: number | null
  waveDirection: WindPointReading | null
  seaTemperature: number | null
}

type HourlyWniForecastState = {
  forecasts: HourlyWniForecast[]
  isLoading: boolean
  error: string | null
}

const EMPTY_STATE: HourlyWniForecastState = {
  forecasts: [],
  isLoading: false,
  error: null
}

function getRasterFeature(
  image: TextureData,
  coordinates: Coordinates,
  imageType: WeatherLayers.ImageType,
  imageUnscale: [number, number],
  imageInterpolation: WeatherLayers.ImageInterpolation = WeatherLayers.ImageInterpolation.CUBIC
) {
  return WeatherLayers.getRasterPoints(
    {
      image,
      image2: null,
      imageSmoothing: 0,
      imageInterpolation,
      imageWeight: 0,
      imageType,
      imageUnscale,
      imageMinValue: null,
      imageMaxValue: null
    },
    [-180, -90, 180, 90],
    [[coordinates.longitude, coordinates.latitude]]
  ).features[0]
}

function sampleScalar(
  image: TextureData,
  coordinates: Coordinates,
  imageUnscale: [number, number],
  imageInterpolation?: WeatherLayers.ImageInterpolation
): number | null {
  const feature = getRasterFeature(
    image,
    coordinates,
    WeatherLayers.ImageType.SCALAR,
    imageUnscale,
    imageInterpolation
  )

  return feature && Number.isFinite(feature.properties.value)
    ? feature.properties.value
    : null
}

function sampleVector(
  image: TextureData,
  coordinates: Coordinates,
  imageUnscale: [number, number],
  unit: string,
  convertToKnots: boolean
): WindPointReading | null {
  const feature = getRasterFeature(
    image,
    coordinates,
    WeatherLayers.ImageType.VECTOR,
    imageUnscale
  )

  if (!feature || !Number.isFinite(feature.properties.value)) return null
  return formatRasterPoint(feature.properties, unit, convertToKnots)
}

export default function useHourlyWniForecast(
  coordinates: Coordinates | null,
  datetimes: string[],
  enabled: boolean
): HourlyWniForecastState {
  const [state, setState] = React.useState<HourlyWniForecastState>(EMPTY_STATE)

  React.useEffect(() => {
    if (!enabled || !coordinates) {
      setState(EMPTY_STATE)
      return
    }

    let isCancelled = false
    const forecastCoordinates = coordinates
    setState({ forecasts: [], isLoading: true, error: null })

    async function loadForecasts() {
      const forecasts: HourlyWniForecast[] = []

      // Five columns keep the denser WNI summary readable on phone screens.
      for (let index = 0; index < Math.min(5, datetimes.length); index++) {
        try {
          const [air, precipitation, wind, waves, waveDirection, sea] = await Promise.all([
            handleImageDataLoad(weatherWniTimelineFiles.weatherWniAirTemperature[index]),
            handleImageDataLoad(weatherWniTimelineFiles.weatherWniIntpcp[index]),
            handleImageDataLoad(weatherWniTimelineFiles.weatherWniWindUv[index]),
            handleImageDataLoad(weatherWniTimelineFiles.weatherWniSigwhHeatmap[index]),
            handleImageDataLoad(weatherWniTimelineFiles.weatherWniSigwhUv[index]),
            handleImageDataLoad(weatherWniTimelineFiles.weatherWniSst[index])
          ])
          if (isCancelled) return

          forecasts.push({
            datetime: datetimes[index],
            airTemperature: sampleScalar(air, forecastCoordinates, [-50, 50]),
            precipitation: sampleScalar(precipitation, forecastCoordinates, [0, 20]),
            wind: sampleVector(wind, forecastCoordinates, [-40, 40], 'knots', true),
            waveHeight: sampleScalar(waves, forecastCoordinates, [0, 50]),
            waveDirection: sampleVector(waveDirection, forecastCoordinates, [-128, 127], 'ft', false),
            seaTemperature: sampleScalar(
              sea,
              forecastCoordinates,
              [-50, 50],
              WeatherLayers.ImageInterpolation.NEAREST
            )
          })

          setState({ forecasts: [...forecasts], isLoading: true, error: null })
        } catch (error: unknown) {
          console.error(error)
        }
      }

      if (!isCancelled) {
        setState(forecasts.length
          ? { forecasts, isLoading: false, error: null }
          : { forecasts: [], isLoading: false, error: 'No WNI forecast is available at your location.' })
      }
    }

    loadForecasts()
    return () => { isCancelled = true }
  }, [coordinates, datetimes, enabled])

  return state
}
