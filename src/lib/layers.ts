import type { Layer } from 'deck.gl'
import type { LayerMenuProps, LayersState } from 'types'

import { WEATHER_WNI, PSWH, PWH, WSH, WIND } from 'constants/layer/names'

import * as pswhLayer from 'constants/layer/pswh'
import * as pwhLayer from 'constants/layer/pwh'
import * as windLayer from 'constants/layer/wind'
import * as wshLayer from 'constants/layer/wsh'
import * as weatherWniLayer from 'constants/layer/weather_wni'

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
  [WIND]: {
    name: WIND,
    module: windLayer as LayerModule,
    getDataFn: windLayer.getWindLayersData,
    getLayersFn: windLayer.getWindLayers
  },

  [PSWH]: {
    name: PSWH,
    module: pswhLayer as LayerModule,
    getDataFn: pswhLayer.getPswhLayersData,
    getLayersFn: pswhLayer.getPswhLayers
  },

  [PWH]: {
    name: PWH,
    module: pwhLayer as LayerModule,
    getDataFn: pwhLayer.getPwhLayersData,
    getLayersFn: pwhLayer.getPwhLayers
  },

  [WSH]: {
    name: WSH,
    module: wshLayer as LayerModule,
    getDataFn: wshLayer.getWshLayersData,
    getLayersFn: wshLayer.getWshLayers
  },

  [WEATHER_WNI]: {
    name: WEATHER_WNI,
    module: weatherWniLayer as LayerModule,
    getDataFn: weatherWniLayer.getWeatherWniLayersData,
    getLayersFn: weatherWniLayer.getWeatherWniLayers
  }
}

export function getLayersConfig(layerName: string): LayersConfig {
  return LAYERS_CONFIG[layerName] || LAYERS_CONFIG.WIND
}

export async function preloadLayersData(
  layerName: string,
  timelineIndex: number
): Promise<LayersState> {
  const config = getLayersConfig(layerName)
  return await config.getDataFn(timelineIndex)
}
