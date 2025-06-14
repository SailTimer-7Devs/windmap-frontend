import type { LayersState, LayerKey } from 'types'
import type { Layer } from 'deck.gl'

import type { Palette } from 'cpt2js'
import { ClipExtension } from '@deck.gl/extensions'
import 'mapbox-gl/dist/mapbox-gl.css'

import * as WeatherLayers from 'weatherlayers-gl'

import * as BASE from 'constants/basemap'

import { handleImageDataLoad } from 'lib/image'
import { setParticlesNumbersByDeviceType } from 'lib/layer'

export const PSWH_HEATMAP = 'pswh'
export const PSWH_UV = 'pswh-uv'

export const PSWH_LAYER_KEYS = {
  PSWH_HEATMAP,
  PSWH_UV
}

export const PSWH_VISIBLE_LAYERS = [
  PSWH_HEATMAP,
  PSWH_UV
]

export const PSWH_INITIAL_LAYERS_STATE: LayersState = {
  [PSWH_HEATMAP]: undefined,
  [PSWH_UV]: undefined
}

export const LAYERS_MENU_LIST = [
  {
    id: PSWH_HEATMAP,
    name: 'Swell Height'
  },
  {
    id: PSWH_UV,
    name: 'Swell Animation'
  }
]

export const getPswhLayers = (layersState: LayersState): Layer[] => [
  new WeatherLayers.RasterLayer({
    id: PSWH_LAYER_KEYS.PSWH_HEATMAP,
    image: layersState[PSWH_LAYER_KEYS.PSWH_HEATMAP as LayerKey],
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
    id: PSWH_LAYER_KEYS.PSWH_UV,
    image: layersState[PSWH_LAYER_KEYS.PSWH_UV as LayerKey],
    imageType: 'VECTOR',
    imageUnscale: BASE.IMAGE_UNSCALE,
    bounds: BASE.WIND_MAP_BOUNDS,
    numParticles: setParticlesNumbersByDeviceType(),
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

export async function getPswhLayersData(): Promise<LayersState> {
  try {
    const [
      pswhHeatmapData,
      pswhUvData
    ] = await Promise.all([
      handleImageDataLoad(BASE.WNI_PSWH_HEATMAP_URL),
      handleImageDataLoad(BASE.WNI_PSWH_UV_URL)
    ])

    return {
      [PSWH_LAYER_KEYS.PSWH_HEATMAP]: pswhHeatmapData,
      [PSWH_LAYER_KEYS.PSWH_UV]: pswhUvData
    }
  } catch (e) {
    console.error(e)
    return PSWH_INITIAL_LAYERS_STATE
  }
}