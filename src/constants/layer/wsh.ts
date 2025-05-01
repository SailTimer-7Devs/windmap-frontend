import type { LayersState, LayerKey } from 'types'
import type { Layer } from 'deck.gl'

import type { Palette } from 'cpt2js'
import { ClipExtension } from '@deck.gl/extensions'
import 'mapbox-gl/dist/mapbox-gl.css'

import * as WeatherLayers from 'weatherlayers-gl'

import * as BASE from 'constants/basemap'

import { isAndroid } from 'lib/device'
import { handleImageDataLoad } from 'lib/image'
import { when } from 'lib/object'

export const WSH_HEATMAP = 'wsh'
export const WSH_UV = 'wsh-uv'

export const WSH_LAYER_KEYS = {
  WSH_HEATMAP,
  WSH_UV
}

export const WSH_VISIBLE_LAYERS = [
  WSH_HEATMAP,
  !isAndroid && WSH_UV
].filter(Boolean)

export const WSH_INITIAL_LAYERS_STATE: LayersState = {
  [WSH_HEATMAP]: undefined,
  ...when(!isAndroid, { [WSH_UV]: undefined })
}

export const LAYERS_MENU_LIST = [
  {
    id: WSH_HEATMAP,
    name: 'Wsh Heatmap'
  },
  !isAndroid && {
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

  !isAndroid && new WeatherLayers.ParticleLayer({
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
].filter(Boolean) as Layer[]

export async function getWshLayersData(): Promise<LayersState> {
  try {
    const promises = [
      handleImageDataLoad(BASE.WNI_WSH_HEATMAP_URL),
      !isAndroid ? handleImageDataLoad(BASE.WNI_WSH_UV_URL) : null
    ]

    const [wshHeatmapData, wshUvData] = await Promise.all(
      promises.map(p => p ?? Promise.resolve(undefined))
    )

    return {
      [WSH_LAYER_KEYS.WSH_HEATMAP]: wshHeatmapData,
      ...when(!isAndroid, { [WSH_LAYER_KEYS.WSH_UV]: wshUvData })
    }
  } catch (e) {
    console.error(e)
    return WSH_INITIAL_LAYERS_STATE
  }
}