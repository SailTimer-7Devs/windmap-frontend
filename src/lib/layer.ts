import { WIND, WIND_VISIBLE_LAYERS } from 'constants/layer/wind'
import { WH, WH_VISIBLE_LAYERS } from 'constants/layer/wh'

export default function getVisibleLayerList(name: string): string[] {
  switch (name) {
    case WIND: return WIND_VISIBLE_LAYERS
    case WH: return WH_VISIBLE_LAYERS

    default: return WIND_VISIBLE_LAYERS
  }
}
