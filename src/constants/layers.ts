import type { LayersState } from 'types'

const WIND = 'wind'
const WIND_BARBS = 'windBarbs'
const WIND_DIRECTION_HEATMAP = 'windDirectionHeatmap'
const WIND_HEATMAP = 'windHeatmap'

export const LAYER_KEYS = {
  WIND,
  WIND_BARBS,
  WIND_DIRECTION_HEATMAP,
  WIND_HEATMAP
}

export const INITIAL_LAYERS_STATE: LayersState = {
  [WIND]: {
    data: undefined,
    visible: true
  },

  [WIND_HEATMAP]: {
    data: undefined,
    visible: true
  },

  [WIND_DIRECTION_HEATMAP]: {
    data: undefined,
    visible: true
  },

  [WIND_BARBS]: {
    data: undefined,
    visible: true
  }
}

export const ACTIONS_MENU_LIST = [
  {
    id: LAYER_KEYS.WIND_HEATMAP,
    name: 'Wind Speed'
  },

  {
    id: LAYER_KEYS.WIND,
    name: 'Wind Particles'
  },

  {
    id: LAYER_KEYS.WIND_BARBS,
    name: 'Wind Barbs'
  },
  {
    id: LAYER_KEYS.WIND_DIRECTION_HEATMAP,
    name: 'Wind Direction Contour Lines'
  }
]