import type { TextureData } from 'weatherlayers-gl-fork/client'

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

export type LayerKey = typeof WIND
  | typeof WIND_HEATMAP
  | typeof WIND_DIRECTION_HEATMAP
  | typeof WIND_BARBS

export type State = {
  [key in LayerKey]: {
    data?: TextureData
    visible: boolean
  }
}

export const INITIAL_LAYERS_STATE: State = {
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