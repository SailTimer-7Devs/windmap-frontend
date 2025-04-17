import type { LayersState } from 'types'

const WIND = 'wind'
const WIND_BARBS = 'wind-barbs'
const WIND_DIRECTION_HEATMAP = 'wind-direction-heatmap'
const WIND_HEATMAP = 'wind-heatmap'

export const LAYER_KEYS = {
  WIND,
  WIND_BARBS,
  WIND_DIRECTION_HEATMAP,
  WIND_HEATMAP
}

export const VISIBLE_LAYERS = [
  WIND,
  WIND_BARBS,
  WIND_DIRECTION_HEATMAP,
  WIND_HEATMAP
]

export const INITIAL_LAYERS_STATE: LayersState = {
  [WIND]: undefined,
  [WIND_BARBS]: undefined,
  [WIND_DIRECTION_HEATMAP]: undefined,
  [WIND_HEATMAP]: undefined
}

export const ACTIONS_MENU_LIST = [
  {
    id: WIND_HEATMAP,
    name: 'Wind Speed'
  },

  {
    id: WIND,
    name: 'Wind Animation'
  },

  {
    id: WIND_BARBS,
    name: 'Wind Barbs'
  },
  {
    id: WIND_DIRECTION_HEATMAP,
    name: 'Wind Direction Contour Lines'
  }
]