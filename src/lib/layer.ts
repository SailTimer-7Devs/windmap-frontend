import { WIND, WIND_VISIBLE_LAYERS } from 'constants/layer/wind'
import { PSWH_HEATMAP, PSWH_VISIBLE_LAYERS } from 'constants/layer/pswh'
import { PWH_HEATMAP, PWH_VISIBLE_LAYERS } from 'constants/layer/pwh'
import { WSH_HEATMAP, WSH_VISIBLE_LAYERS } from 'constants/layer/wsh'

import { deviceType } from 'lib/device'

export function getVisibleLayerList(name: string): string[] {
  switch (name) {
    case WIND: return WIND_VISIBLE_LAYERS as string[]
    case PSWH_HEATMAP: return PSWH_VISIBLE_LAYERS as string[]
    case PWH_HEATMAP: return PWH_VISIBLE_LAYERS as string[]
    case WSH_HEATMAP: return WSH_VISIBLE_LAYERS as string[]

    default: return WIND_VISIBLE_LAYERS as string[]
  }
}

export function isWind(name: string): boolean {
  return name === WIND
}

export function setParticlesNumbersByDeviceType(): number {
  switch (deviceType) {
    case 'mobile': return 1000
    case 'tablet': return 2000
    default: return 1500
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
