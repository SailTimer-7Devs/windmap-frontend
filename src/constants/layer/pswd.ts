import type { LayersState, LayerKey } from 'types'
import type { Layer } from 'deck.gl'

import type { Palette } from 'cpt2js'
import { ClipExtension } from '@deck.gl/extensions'
import 'mapbox-gl/dist/mapbox-gl.css'

import * as WeatherLayers from 'weatherlayers-gl'

import * as BASE from 'constants/basemap'

import { handleImageDataLoad } from 'lib/image'

export const PSWD_HEATMAP = 'pswd'

export const PSWD_LAYER_KEYS = {
  PSWD_HEATMAP
}

export const PSWD_VISIBLE_LAYERS = [
  PSWD_HEATMAP
]

export const PSWD_INITIAL_LAYERS_STATE: LayersState = {
  [PSWD_HEATMAP]: undefined
}

export const PSWD_LAYERS_MENU_LIST = [
  {
    id: PSWD_HEATMAP,
    name: 'Pswd Heatmap'
  }
]

export const getPswdLayers = (layersState: LayersState): Layer[] => [
  new WeatherLayers.RasterLayer({
    id: PSWD_LAYER_KEYS.PSWD_HEATMAP,
    image: layersState[PSWD_LAYER_KEYS.PSWD_HEATMAP as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.WIND_SPEED_PALETTE as Palette,
    opacity: 0.55,
    pickable: true,
    imageUnscale: [0, 255],
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  })
]

export async function getPswdLayersData(): Promise<LayersState> {
  try {
    const [
      pswdHeatmapData
    ] = await Promise.all([
      handleImageDataLoad(BASE.WNI_PSWD_HEATMAP_URL)
    ])

    return {
      [PSWD_LAYER_KEYS.PSWD_HEATMAP]: pswdHeatmapData
    }
  } catch (e) {
    console.error(e)
    return PSWD_INITIAL_LAYERS_STATE
  }
}