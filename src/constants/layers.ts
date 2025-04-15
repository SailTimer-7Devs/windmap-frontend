import type { TextureData } from 'weatherlayers-gl-fork/client'

const WIND = 'wind'
const WIND_HEATMAP = 'windHeatmap'
const WIND_DIRECTION_HEATMAP = 'windDirectionHeatmap'

export const LAYERS = {
  WIND,
  WIND_HEATMAP,
  WIND_DIRECTION_HEATMAP
}

export type LayerKey = typeof WIND | typeof WIND_HEATMAP | typeof WIND_DIRECTION_HEATMAP

export type State = {
  [key in LayerKey]: {
    data?: TextureData
    visible: boolean
  }
}

export const INITIAL_STATE: State = {
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
  }
}