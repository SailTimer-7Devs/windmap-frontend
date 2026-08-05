import type { RasterPointProperties } from 'weatherlayers-gl'
import type { TextureData } from 'weatherlayers-gl/client'

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
 * Crowdsourced vector rasters use neutral RGB (128, 128, 128) for empty cells.
 * The GPU picker still decodes those pixels as a small wind reading on some
 * browsers, so validate the source pixel directly before showing comparison
 * rows in the tooltip.
 */
export const hasCrowdsourcedDataAt = (
  image: TextureData | undefined,
  longitude: number,
  latitude: number
): boolean => {
  if (!image || !image.width || !image.height) return false

  const normalizedX = Math.min(1, Math.max(0, (longitude + 180) / 360))
  const normalizedY = Math.min(1, Math.max(0, (90 - latitude) / 180))
  const x = Math.min(image.width - 1, Math.floor(normalizedX * image.width))
  const y = Math.min(image.height - 1, Math.floor(normalizedY * image.height))
  const channelCount = image.data.length / (image.width * image.height)

  if (!Number.isInteger(channelCount) || channelCount < 2) return false

  const offset = (y * image.width + x) * channelCount
  const u = image.data[offset]
  const v = image.data[offset + 1]

  if (!Number.isFinite(u) || !Number.isFinite(v)) return false
  return u !== 128 || v !== 128
}
