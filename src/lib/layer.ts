import { WIND_VISIBLE_LAYERS } from 'constants/layer/wind'
import { WIND, PSWH, PWH, WSH, WEATHER_WNI } from 'constants/layer/names'
import { PSWH_VISIBLE_LAYERS } from 'constants/layer/pswh'
import { PWH_VISIBLE_LAYERS } from 'constants/layer/pwh'
import { WSH_VISIBLE_LAYERS } from 'constants/layer/wsh'
import { WEATHER_WNI_VISIBLE_LAYERS } from 'constants/layer/weather_wni'

import { deviceType } from 'lib/device'

export function getVisibleLayerList(name: string): string[] {
  switch (name) {
    case WIND: return WIND_VISIBLE_LAYERS as string[]
    case PSWH: return PSWH_VISIBLE_LAYERS as string[]
    case PWH: return PWH_VISIBLE_LAYERS as string[]
    case WSH: return WSH_VISIBLE_LAYERS as string[]
    case WEATHER_WNI: return WEATHER_WNI_VISIBLE_LAYERS as string[]

    default: return WIND_VISIBLE_LAYERS as string[]
  }
}

export function isWind(name: string): boolean {
  return name === WIND
}

export function isWeatherWni(name: string): boolean {
  return name === WEATHER_WNI
}

export const isWeatherWniGroup = (layers: string[]): boolean => {
  return layers.every(layer => layer.includes('weather_wni'))
}

export function setParticlesNumbersByDeviceType(): number {
  switch (deviceType) {
    case 'mobile': return 100
    case 'tablet': return 120
    default: return 200
  }
}

export function setParticleWidthByDevice(): number {
  const isRetina = window.devicePixelRatio > 1

  if (isRetina) {
    return 1
  }

  switch (deviceType) {
    case 'mobile': return 1
    case 'tablet': return 2
    default: return 2
  }
} 
