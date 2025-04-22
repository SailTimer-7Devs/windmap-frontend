import { WIND, WIND_VISIBLE_LAYERS } from 'constants/layer/wind'
import { PSWD_HEATMAP, PSWD_VISIBLE_LAYERS } from 'constants/layer/pswd'
import { PWH_HEATMAP, PWH_VISIBLE_LAYERS } from 'constants/layer/pwh'

export default function getVisibleLayerList(name: string): string[] {
  switch (name) {
    case WIND: return WIND_VISIBLE_LAYERS
    case PSWD_HEATMAP: return PSWD_VISIBLE_LAYERS
    case PWH_HEATMAP: return PWH_VISIBLE_LAYERS
    default: return WIND_VISIBLE_LAYERS
  }
}
