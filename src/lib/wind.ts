import type { RasterPointProperties } from 'weatherlayers-gl'

import * as WeatherLayers from 'weatherlayers-gl'

import { setParticlesNumbersByDeviceType } from 'lib/layer'
import { convertMetersPerSecondsToKnots } from 'lib/units'

export const getDensity = (zoom: number): number => {
  if (zoom < 5) return -0.6
  if (zoom < 9) return -1.3
  return -2
}

export const getNumParticles = (zoom: number): number => {
  if (zoom < 5) return Math.floor(setParticlesNumbersByDeviceType() * 0.5)
  if (zoom < 9) return Math.floor(setParticlesNumbersByDeviceType() * 0.25)
  return Math.floor(setParticlesNumbersByDeviceType() * 0.1)
}

export type WindPointReading = {
  value: number
  unit: string
  direction?: number
  directionLabel?: number | string
}

export const formatRasterPoint = (
  raster: RasterPointProperties,
  unit: string,
  convertToKnots: boolean
): WindPointReading => {
  const value = convertToKnots ? convertMetersPerSecondsToKnots(raster.value) : raster.value
  const direction = typeof raster.direction === 'number'
    ? ((raster.direction % 360) + 360) % 360
    : raster.direction

  const directionLabel = typeof direction === 'number'
    ? WeatherLayers.formatDirection(
      direction,
      WeatherLayers.DirectionType.INWARD,
      WeatherLayers.DirectionFormat.CARDINAL3
    )
    : undefined

  return { value, unit, direction, directionLabel }
}

export const getCircularDirectionDifference = (a: number, b: number): number => {
  const diff = Math.abs(a - b) % 360
  return diff > 180 ? 360 - diff : diff
}

export const getSpeedDifference = (a: number, b: number): number => Math.abs(a - b)

/**
 * Empty cells in the current crowdsourced vector raster decode as the same
 * low SW reading instead of NaN. Keep that data-source sentinel out of the UI
 * so an absent measurement is not presented as real crowdsourced wind.
 */
export const isCrowdsourcedNoData = (reading: WindPointReading): boolean =>
  reading.directionLabel === 'SW' && Math.round(reading.value) === 2
