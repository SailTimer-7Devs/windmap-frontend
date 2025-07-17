import type { LayersState, LayerKey } from 'types'
import type { Layer } from 'deck.gl'
import type { Palette } from 'cpt2js'

import { ClipExtension } from '@deck.gl/extensions'
import 'mapbox-gl/dist/mapbox-gl.css'

import * as WeatherLayers from 'weatherlayers-gl'

import * as BASE from 'constants/basemap'

import { handleImageDataLoad } from 'lib/image'

export const WSH_HEATMAP = 'wsh'
export const WSH_UV = 'wsh-uv'

export const WSH_LAYER_KEYS = {
  WSH_HEATMAP,
  WSH_UV
}

export const WSH_VISIBLE_LAYERS = [
  WSH_HEATMAP,
  WSH_UV
]

export const WSH_INITIAL_LAYERS_STATE: LayersState = {
  [WSH_HEATMAP]: undefined,
  [WSH_UV]: undefined
}

export const LAYERS_MENU_LIST = [
  {
    id: WSH_HEATMAP,
    name: 'Wsh Heatmap'
  },
  {
    id: WSH_UV,
    name: 'Wsh Speed'
  }
]

export const getWshLayers = (layersState: LayersState): Layer[] => [
  new WeatherLayers.RasterLayer({
    id: WSH_LAYER_KEYS.WSH_HEATMAP,
    image: layersState[WSH_LAYER_KEYS.WSH_HEATMAP as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.WAVE_HEIGHT_PALETTE_0_50 as Palette,
    opacity: 0.5,
    pickable: true,
    imageUnscale: [0, 255],
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  new WeatherLayers.ParticleLayer({
    id: WSH_LAYER_KEYS.WSH_UV,
    image: layersState[WSH_LAYER_KEYS.WSH_UV as LayerKey],
    imageType: 'VECTOR',
    imageUnscale: BASE.IMAGE_UNSCALE,
    bounds: BASE.WIND_MAP_BOUNDS,
    numParticles: 5000,
    maxAge: 30,
    speedFactor: 4,
    width: 15,
    opacity: 0.15,
    animate: true,
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    getPolygonOffset: () => [0, -1000],
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  })
]

export async function getWshLayersData(): Promise<LayersState> {
  try {
    const [
      wshHeatmapData,
      wshUvData
    ] = await Promise.all([
      handleImageDataLoad(BASE.WNI_WSH_HEATMAP_URL),
      handleImageDataLoad(BASE.WNI_WSH_UV_URL)
    ])

    return {
      [WSH_LAYER_KEYS.WSH_HEATMAP]: wshHeatmapData,
      [WSH_LAYER_KEYS.WSH_UV]: wshUvData
    }
  } catch (e) {
    console.error(e)
    return WSH_INITIAL_LAYERS_STATE
  }
}