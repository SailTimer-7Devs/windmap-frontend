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

export const PWH_HEATMAP = 'pwh'
export const PWH_UV = 'pwh-uv'

export const PWH_LAYER_KEYS = {
  PWH_HEATMAP,
  PWH_UV
}

export const PWH_VISIBLE_LAYERS = [
  PWH_HEATMAP,
  !isAndroid && PWH_UV
].filter(Boolean)

export const PWH_INITIAL_LAYERS_STATE: LayersState = {
  [PWH_HEATMAP]: undefined,
  ...when(!isAndroid, { [PWH_UV]: undefined })
}

export const LAYERS_MENU_LIST = [
  {
    id: PWH_HEATMAP,
    name: 'Waves Heatmap'
  },
  !isAndroid && {
    id: PWH_UV,
    name: 'Waves Speed'
  }
].filter(Boolean)

export const getPwhLayers = (layersState: LayersState): Layer[] => [
  new WeatherLayers.RasterLayer({
    id: PWH_LAYER_KEYS.PWH_HEATMAP,
    image: layersState[PWH_LAYER_KEYS.PWH_HEATMAP as LayerKey],
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
    id: PWH_LAYER_KEYS.PWH_UV,
    image: layersState[PWH_LAYER_KEYS.PWH_UV as LayerKey],
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

export async function getPwhLayersData(): Promise<LayersState> {
  try {
    const promises = [
      handleImageDataLoad(BASE.WNI_PWH_HEATMAP_URL),
      !isAndroid ? handleImageDataLoad(BASE.WNI_PWH_UV_URL) : null
    ]

    const [pwhHeatmapData, pwhUvData] = await Promise.all(
      promises.map(p => p ?? Promise.resolve(undefined))
    )

    return {
      [PWH_LAYER_KEYS.PWH_HEATMAP]: pwhHeatmapData,
      ...when(!isAndroid, { [PWH_LAYER_KEYS.PWH_UV]: pwhUvData })
    }
  } catch (e) {
    console.error(e)
    return PWH_INITIAL_LAYERS_STATE
  }
}