import type { LayersState, LayerKey } from 'types'
import type { Layer } from 'deck.gl'

import type { Palette } from 'cpt2js'
import { ClipExtension } from '@deck.gl/extensions'
import 'mapbox-gl/dist/mapbox-gl.css'

import * as WeatherLayers from 'weatherlayers-gl'

import * as BASE from 'constants/basemap'

import { handleImageDataLoad } from 'lib/image'

export const PWH_HEATMAP = 'pwh'
export const PWH_UV = 'pwh-uv'

export const PWH_LAYER_KEYS = {
  PWH_HEATMAP,
  PWH_UV
}

export const PWH_VISIBLE_LAYERS = [
  PWH_HEATMAP,
  PWH_UV
]

export const PWH_INITIAL_LAYERS_STATE: LayersState = {
  [PWH_HEATMAP]: undefined,
  [PWH_UV]: undefined
}

export const PWH_LAYERS_MENU_LIST = [
  {
    id: PWH_HEATMAP,
    name: 'Pwh Heatmap'
  },
  {
    id: PWH_UV,
    name: 'Pwh Speed'
  }
]

export const getPwhLayers = (layersState: LayersState): Layer[] => [
  new WeatherLayers.RasterLayer({
    id: PWH_LAYER_KEYS.PWH_HEATMAP,
    image: layersState[PWH_LAYER_KEYS.PWH_HEATMAP as LayerKey],
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
    id: PWH_LAYER_KEYS.PWH_UV,
    image: layersState[PWH_LAYER_KEYS.PWH_UV as LayerKey],
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

export async function getPwhLayersData(): Promise<LayersState> {
  try {
    const [
      pswdHeatmapData,
      pwhUvData
    ] = await Promise.all([
      handleImageDataLoad(BASE.WNI_PSWD_HEATMAP_URL),
      handleImageDataLoad(BASE.WNI_PWH_UV_URL)
    ])

    return {
      [PWH_LAYER_KEYS.PWH_HEATMAP]: pswdHeatmapData,
      [PWH_LAYER_KEYS.PWH_UV]: pwhUvData
    }
  } catch (e) {
    console.error(e)
    return PWH_INITIAL_LAYERS_STATE
  }
}