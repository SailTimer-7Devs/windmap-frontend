import type { LayersState, LayerKey } from 'types'
import type { Layer } from 'deck.gl'

import type { Palette } from 'cpt2js'
import { ClipExtension } from '@deck.gl/extensions'
import 'mapbox-gl/dist/mapbox-gl.css'

import * as WeatherLayers from 'weatherlayers-gl'

import * as BASE from 'constants/basemap'

import { handleImageDataLoad } from 'lib/image'

export const WIND = 'wind'
export const WIND_BARBS = 'wind-barbs'
export const WIND_DIRECTION_HEATMAP = 'wind-direction-heatmap'
export const WIND_HEATMAP = 'wind-heatmap'

export const WIND_LAYER_KEYS = {
  WIND,
  WIND_BARBS,
  WIND_DIRECTION_HEATMAP,
  WIND_HEATMAP
}

export const WIND_VISIBLE_LAYERS = [
  WIND,
  WIND_BARBS,
  WIND_DIRECTION_HEATMAP,
  WIND_HEATMAP
]

export const WIND_INITIAL_LAYERS_STATE: LayersState = {
  [WIND]: undefined,
  [WIND_BARBS]: undefined,
  [WIND_DIRECTION_HEATMAP]: undefined,
  [WIND_HEATMAP]: undefined
}

export const WIND_LAYERS_MENU_LIST = [
  {
    id: WIND_HEATMAP,
    name: 'Wind Speed'
  },

  {
    id: WIND,
    name: 'Wind Animation'
  },

  {
    id: WIND_BARBS,
    name: 'Wind Barbs'
  },
  {
    id: WIND_DIRECTION_HEATMAP,
    name: 'Wind Direction Contour Lines'
  }
]

export const getWindLayers = (layersState: LayersState): Layer[] => [
  new WeatherLayers.RasterLayer({
    id: WIND_LAYER_KEYS.WIND_HEATMAP,
    image: layersState[WIND_LAYER_KEYS.WIND_HEATMAP as LayerKey],
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

  new WeatherLayers.RasterLayer({
    id: WIND_LAYER_KEYS.WIND_DIRECTION_HEATMAP,
    image: layersState[WIND_LAYER_KEYS.WIND_DIRECTION_HEATMAP as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.EXPERIMENTAL_WIND_PALETTE_0_16 as Palette,
    imageInterpolation: 'NEAREST',
    opacity: 0.55,
    pickable: true,
    imageUnscale: [0, 16],
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  new WeatherLayers.GridLayer({
    id: WIND_LAYER_KEYS.WIND_BARBS,
    image: layersState[WIND_LAYER_KEYS.WIND_BARBS as LayerKey],
    bounds: BASE.WIND_MAP_BOUNDS,
    imageUnscale: BASE.IMAGE_UNSCALE,
    density: 0,
    iconSize: 50,
    imageType: 'VECTOR',
    color: [255, 255, 255, 200],
    extensions: [new ClipExtension()],
    style: WeatherLayers.GridStyle.WIND_BARB,
    clipBounds: BASE.CLIP_BOUNDS
  }),

  new WeatherLayers.ParticleLayer({
    id: WIND_LAYER_KEYS.WIND,
    image: layersState[WIND_LAYER_KEYS.WIND as LayerKey],
    imageType: 'VECTOR',
    imageUnscale: BASE.IMAGE_UNSCALE,
    bounds: BASE.WIND_MAP_BOUNDS,
    numParticles: 5000,
    maxAge: 40,
    speedFactor: 10,
    width: 3,
    opacity: 0.1,
    animate: true,
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    getPolygonOffset: () => [0, -1000],
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  })
]

export async function getWindLayersData(): Promise<LayersState> {
  try {
    const [
      windData,
      windDirectionHeatmapData,
      windHeatmapData
    ] = await Promise.all([
      handleImageDataLoad(BASE.WINDMAP_URL),
      handleImageDataLoad(BASE.WIND_DIRECTION_HEATMAP_URL),
      handleImageDataLoad(BASE.WIND_HEATMAP_URL)
    ])

    return {
      [WIND_LAYER_KEYS.WIND]: windData,
      [WIND_LAYER_KEYS.WIND_DIRECTION_HEATMAP]: windDirectionHeatmapData,
      [WIND_LAYER_KEYS.WIND_HEATMAP]: windHeatmapData,
      [WIND_LAYER_KEYS.WIND_BARBS]: windData
    }
  } catch (e) {
    console.error(e)
    return WIND_INITIAL_LAYERS_STATE
  }
}