import { UAParser } from 'ua-parser-js'

import { WIND, WIND_VISIBLE_LAYERS } from 'constants/layer/wind'
import { PSWH_HEATMAP, PSWH_VISIBLE_LAYERS } from 'constants/layer/pswh'
import { PWH_HEATMAP, PWH_VISIBLE_LAYERS } from 'constants/layer/pwh'
import { WSH_HEATMAP, WSH_VISIBLE_LAYERS } from 'constants/layer/wsh'

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

export function setParticlesByDeviceType(): number {
  const deviceType = new UAParser().getDevice().type

  switch (deviceType) {
    case 'mobile': return 2000
    case 'tablet': return 3000
    default: return 5000
  }
}
