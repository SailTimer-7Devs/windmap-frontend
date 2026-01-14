import * as LAYER_NAMES from 'constants/layer/names'
import { S3_DATA_URL } from 'constants/basemap'

import { MAX_FUTURE_HOURS, URL_SEGMENTS } from 'constants/timeline'

import { windTimelineFiles } from 'constants/layer/wind'
import { pswhTimelineFiles } from 'constants/layer/pswh'
import { pwhTimelineFiles } from 'constants/layer/pwh'
import { wshTimelineFiles } from 'constants/layer/wsh'
import { weatherWniTimelineFiles } from 'constants/layer/weather_wni'

import { joinPath } from 'lib/url'

function getGfsUrl(step: string, fileName: string): string {
  return joinPath(
    S3_DATA_URL,
    URL_SEGMENTS.GFS,
    `F00${step}`,
    fileName
  )
}

function getWniUrl(step: string, fileName: string): string {
  return joinPath(
    S3_DATA_URL,
    URL_SEGMENTS.WNI,
    `T00${step}`,
    fileName
  )
}

function getWniSubfolder(fileName: string): string {
  switch (true) {
    case fileName.includes('ice'):
      return URL_SEGMENTS.ICE
    case fileName.includes('_mps'):
      return URL_SEGMENTS.GHI
    case fileName.includes('_sigwh'):
    case fileName.includes('_pswh'):
    case fileName.includes('_pwh'):
    case fileName.includes('_wsh'):
      return ''
    default:
      return URL_SEGMENTS.V2
  }
}

function getWeatherWniUrl(step: string, fileName: string): string {
  const SUB_FOLDER = getWniSubfolder(fileName)

  return joinPath(
    S3_DATA_URL,
    URL_SEGMENTS.WNI,
    SUB_FOLDER,
    `T00${step}`,
    fileName
  )
}

export function getNextDatetimeByStep(step: number): string {
  const now = new Date()

  const next = new Date(now)

  /* round to hour */
  next.setMinutes(0, 0, 0)

  /* add + hours to current time */
  next.setHours(now.getHours() + step)

  return next.toISOString()
}

export function getTimelineLayerGroupFileURL(
  layerName: string,
  index: number,
  fileName: string
): string {
  const stepString = index.toString()

  const windUrl = getGfsUrl(stepString, fileName)
  const wniUrl = getWniUrl(stepString, fileName)
  const weatherWniUrl = getWeatherWniUrl(stepString, fileName)

  switch (layerName) {
    case LAYER_NAMES.WIND:
      return windUrl

    case LAYER_NAMES.PSWH:
    case LAYER_NAMES.PWH:
    case LAYER_NAMES.WSH:
      return wniUrl

    case LAYER_NAMES.WEATHER_WNI:
      return weatherWniUrl

    default:
      return windUrl
  }
}

export function createTimelineLayerFileByGroup(
  layerName: string,
  fileName: string,
  total: number = MAX_FUTURE_HOURS
): string[] {
  return Array.from({ length: total }, (_, index) =>
    getTimelineLayerGroupFileURL(layerName, index, fileName)
  )
}

export function createTimelineDatetimes(
  total: number = MAX_FUTURE_HOURS
): string[] {
  return Array.from({ length: total }, (_, index) =>
    getNextDatetimeByStep(index)
  )
}
export function getDateTimeByLayerName(name: string): string[] {
  switch (name) {
    case LAYER_NAMES.WIND:
      return windTimelineFiles.datetime

    case LAYER_NAMES.PSWH:
      return pswhTimelineFiles.datetime

    case LAYER_NAMES.PWH:
      return pwhTimelineFiles.datetime

    case LAYER_NAMES.WSH:
      return wshTimelineFiles.datetime

    case LAYER_NAMES.WEATHER_WNI:
      return weatherWniTimelineFiles.datetime

    default:
      return windTimelineFiles.datetime
  }
}
