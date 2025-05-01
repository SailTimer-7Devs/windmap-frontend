import { UAParser } from 'ua-parser-js'

import { WIND, WIND_VISIBLE_LAYERS } from 'constants/layer/wind'
import { PSWH_HEATMAP, PSWH_VISIBLE_LAYERS } from 'constants/layer/pswh'
import { PWH_HEATMAP, PWH_VISIBLE_LAYERS } from 'constants/layer/pwh'
import { WSH_HEATMAP, WSH_VISIBLE_LAYERS } from 'constants/layer/wsh'

const deviceType = new UAParser().getDevice().type

export function getVisibleLayerList(name: string): string[] {
  switch (name) {
    case WIND: return WIND_VISIBLE_LAYERS
    case PSWH_HEATMAP: return PSWH_VISIBLE_LAYERS
    case PWH_HEATMAP: return PWH_VISIBLE_LAYERS
    case WSH_HEATMAP: return WSH_VISIBLE_LAYERS

    default: return WIND_VISIBLE_LAYERS
  }
}

export function isWind(name: string): boolean {
  return name === WIND
}

export function setParticlesNumbersByDeviceType(): number {
  switch (deviceType) {
    case 'mobile': return 2000
    case 'tablet': return 3000
    default: return 3000
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
