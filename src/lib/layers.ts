import type { Layer } from 'deck.gl'
import type { LayerMenuProps, LayersState } from 'types'

import * as pswhLayer from 'constants/layer/pswh'
import * as pwhLayer from 'constants/layer/pwh'
import * as windLayer from 'constants/layer/wind'
import * as wshLayer from 'constants/layer/wsh'

interface LayerModule {
  LAYERS_MENU_LIST: LayerMenuProps[]
}

interface LayersConfig {
  name: string
  module: LayerModule
  getDataFn: (timelineIndex: number) => Promise<LayersState>
  getLayersFn: (state: LayersState) => Layer[]
}

const LAYERS_CONFIG: Record<string, LayersConfig> = {
  [windLayer.WIND]: {
    name: windLayer.WIND,
    module: windLayer as LayerModule,
    getDataFn: windLayer.getWindLayersData,
    getLayersFn: windLayer.getWindLayers
  },

  [pswhLayer.PSWH_HEATMAP]: {
    name: pswhLayer.PSWH_HEATMAP,
    module: pswhLayer as LayerModule,
    getDataFn: pswhLayer.getPswhLayersData,
    getLayersFn: pswhLayer.getPswhLayers
  },

  [pwhLayer.PWH_HEATMAP]: {
    name: pwhLayer.PWH_HEATMAP,
    module: pwhLayer as LayerModule,
    getDataFn: pwhLayer.getPwhLayersData,
    getLayersFn: pwhLayer.getPwhLayers
  },

  [wshLayer.WSH_HEATMAP]: {
    name: wshLayer.WSH_HEATMAP,
    module: wshLayer as LayerModule,
    getDataFn: wshLayer.getWshLayersData,
    getLayersFn: wshLayer.getWshLayers
  }
}

export function getLayersConfig(layerName: string): LayersConfig {
  return LAYERS_CONFIG[layerName] || LAYERS_CONFIG[windLayer.WIND]
}

export async function preloadLayersData(
  layerName: string,
  timelineIndex: number
): Promise<LayersState> {
  const config = getLayersConfig(layerName)
  return await config.getDataFn(timelineIndex)
}
