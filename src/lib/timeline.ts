import * as LAYER_NAMES from 'constants/layer/names'
import { S3_DATA_URL } from 'constants/basemap'

import {
  MAX_FUTURE_HOURS,
  GFS_URL_SEGMENT,
  WNI_URL_SEGMENT
} from 'constants/timeline'

import { windTimelineFiles } from 'constants/layer/wind'
import { pswhTimelineFiles } from 'constants/layer/pswh'
import { pwhTimelineFiles } from 'constants/layer/pwh'
import { wshTimelineFiles } from 'constants/layer/wsh'
import { weatherWniTimelineFiles } from 'constants/layer/weather_wni'

import { joinPath } from 'lib/url'

function getGfsUrl(step: string, fileName: string): string {
  return joinPath(
    S3_DATA_URL,
    GFS_URL_SEGMENT,
    `F00${step}`,
    fileName
  )
}

function getWniUrl(step: string, fileName: string): string {
  return joinPath(
    S3_DATA_URL,
    WNI_URL_SEGMENT,
    `T00${step}`,
    fileName
  )
}

function getWeatherWniUrl(step: string, fileName: string): string {
  const SUB_FOLDER = fileName.includes('ice') ? 'ice' : 'v2'

  return joinPath(
    S3_DATA_URL,
    WNI_URL_SEGMENT,
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
  next.setHours(now.getHours() + step + 1)

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
