import type { LayersState, LayerKey } from 'types'
import type { Layer } from 'deck.gl'

import type { Palette } from 'cpt2js'
import { ClipExtension } from '@deck.gl/extensions'
import 'mapbox-gl/dist/mapbox-gl.css'

import * as WeatherLayers from 'weatherlayers-gl'

import * as BASE from 'constants/basemap'

import { handleImageDataLoad } from 'lib/image'

export const WH = 'wh'
export const WH_HEATMAP = 'wh-heatmap'

export const WH_LAYER_KEYS = {
  WH,
  WH_HEATMAP
}

export const WH_VISIBLE_LAYERS = [
  WH,
  WH_HEATMAP
]

export const WH_INITIAL_LAYERS_STATE: LayersState = {
  [WH]: undefined,
  [WH_HEATMAP]: undefined
}

export const WH_LAYERS_MENU_LIST = [
  {
    id: WH_HEATMAP,
    name: 'Wh Heatmap'
  },

  {
    id: WH,
    name: 'Wh Particles'
  }
]

export const getWhLayers = (layersState: LayersState): Layer[] => [
  new WeatherLayers.RasterLayer({
    id: WH_LAYER_KEYS.WH_HEATMAP,
    image: layersState[WH_LAYER_KEYS.WH_HEATMAP as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.WIND_SPEED_PALETTE as Palette,
    opacity: 0.55,
    pickable: true,
    imageUnscale: [0, 255],
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  new WeatherLayers.ParticleLayer({
    id: WH_LAYER_KEYS.WH,
    image: layersState[WH_LAYER_KEYS.WH as LayerKey],
    imageType: 'VECTOR',
    imageUnscale: BASE.IMAGE_UNSCALE,
    bounds: BASE.WIND_MAP_BOUNDS,
    numParticles: 5000,
    maxAge: 25,
    speedFactor: 10,
    width: 2,
    opacity: 0.15,
    animate: true,
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    getPolygonOffset: () => [0, -1000],
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  })
]

export async function getWhLayersData(): Promise<LayersState> {
  try {
    const [
      whData,
      whHeatmapData
    ] = await Promise.all([
      handleImageDataLoad(BASE.WINDMAP_URL),
      handleImageDataLoad(BASE.WIND_HEATMAP_URL)
    ])

    return {
      [WH_LAYER_KEYS.WH]: whData,
      [WH_LAYER_KEYS.WH_HEATMAP]: whHeatmapData
    }
  } catch (e) {
    console.error(e)
    return WH_INITIAL_LAYERS_STATE
  }
}