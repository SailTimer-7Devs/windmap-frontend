import type { LayersState, LayerKey } from 'types'
import type { Layer } from 'deck.gl'
import type { Palette } from 'cpt2js'

import { ClipExtension } from '@deck.gl/extensions'
import 'mapbox-gl/dist/mapbox-gl.css'

import * as WeatherLayers from 'weatherlayers-gl'

import * as BASE from 'constants/basemap'

import WindSpeedIcon from 'icons/WindSpeed'
import WindAnimationIcon from 'icons/WindAnimation'
import WindBarbsIcon from 'icons/WindBarbs'
import WindDirectionIcon from 'icons/WindDirection'

import { handleImageDataLoad } from 'lib/image'
import {
  setParticlesNumbersByDeviceType,
  setParticleWidthByDevice
} from 'lib/layer'

import {
  createTimelineLayerFileByGroup,
  createTimelineDatetimes
} from 'lib/timeline'

import { WIND as WIND_NAME } from './names'
import { WIND_FILES } from './files'

export const WIND = 'wind-animation'
export const WIND_BARBS = 'wind-barbs'
export const WIND_DIRECTION_HEATMAP = 'wind-direction-heatmap'
export const WIND_HEATMAP = 'wind-heatmap'
export const WIND_TOOLTIP = 'wind-tooltip'

export const WIND_LAYER_KEYS = {
  WIND,
  WIND_BARBS,
  WIND_DIRECTION_HEATMAP,
  WIND_HEATMAP,
  WIND_TOOLTIP
}

export const WIND_VISIBLE_LAYERS = [
  WIND,
  WIND_BARBS,
  WIND_HEATMAP,
  WIND_TOOLTIP
]

export const WIND_INITIAL_LAYERS_STATE: LayersState = {
  [WIND]: undefined,
  [WIND_BARBS]: undefined,
  [WIND_DIRECTION_HEATMAP]: undefined,
  [WIND_HEATMAP]: undefined
}

export const LAYERS_MENU_LIST = [
  {
    id: WIND_HEATMAP,
    name: 'Wind Speed',
    icon: WindSpeedIcon
  },

  {
    id: WIND,
    name: 'Wind Animation',
    icon: WindAnimationIcon
  },

  {
    id: WIND_BARBS,
    name: 'Wind Barbs',
    icon: WindBarbsIcon
  },

  {
    id: WIND_DIRECTION_HEATMAP,
    name: 'Wind Direction Zones',
    icon: WindDirectionIcon
  }
]

export const getWindLayers = (layersState: LayersState): Layer[] => [
  new WeatherLayers.RasterLayer({
    id: WIND_LAYER_KEYS.WIND_HEATMAP,
    image: layersState[WIND_LAYER_KEYS.WIND_HEATMAP as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.WIND_SPEED_PALETTE_1_40 as Palette,
    opacity: 0.2,
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
    opacity: 0.2,
    imageUnscale: [0, 16],
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  //for tooltip
  new WeatherLayers.RasterLayer({
    id: WIND_LAYER_KEYS.WIND_TOOLTIP,
    image: layersState[WIND_LAYER_KEYS.WIND as LayerKey],
    imageType: 'VECTOR',
    imageUnscale: [-128, 127],
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.EXPERIMENTAL_WIND_PALETTE_0_16 as Palette,
    imageInterpolation: 'CUBIC',
    opacity: 0,
    pickable: true,
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  new WeatherLayers.GridLayer({
    id: WIND_LAYER_KEYS.WIND_BARBS,
    image: layersState[WIND_LAYER_KEYS.WIND_BARBS as LayerKey],
    bounds: BASE.WIND_MAP_BOUNDS,
    imageUnscale: BASE.IMAGE_UNSCALE,
    density: -0.5,
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
    numParticles: setParticlesNumbersByDeviceType(),
    maxAge: 20,
    speedFactor: 20,
    width: setParticleWidthByDevice(),
    opacity: 0.1,
    animate: true,
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    getPolygonOffset: () => [0, -1000],
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  })
]

export const windTimelineFiles = {
  windMap: createTimelineLayerFileByGroup(WIND_NAME, WIND_FILES.WINDMAP),
  windDirectionHeatmap: createTimelineLayerFileByGroup(WIND_NAME, WIND_FILES.DIRECTION_HEATMAP),
  windHeatmap: createTimelineLayerFileByGroup(WIND_NAME, WIND_FILES.HEATMAP),
  datetime: createTimelineDatetimes()
}

const windCache = new Map<number, LayersState>()

export async function getWindLayersData(timelineIndex: number = 0): Promise<LayersState> {
  if (windCache.has(timelineIndex)) {
    return windCache.get(timelineIndex)!
  }

  if (!navigator.onLine) {
    console.warn('Offline mode detected.')

    if (windCache.size === 0) {
      alert('Sorry, that data is not available while you are offline.')
      return WIND_INITIAL_LAYERS_STATE
    }

    const lastCached = Array.from(windCache.values()).pop()
    if (lastCached) return lastCached
  }

  try {
    const [
      windData,
      windDirectionHeatmapData,
      windHeatmapData
    ] = await Promise.all([
      handleImageDataLoad(windTimelineFiles.windMap[timelineIndex]),
      handleImageDataLoad(windTimelineFiles.windDirectionHeatmap[timelineIndex]),
      handleImageDataLoad(windTimelineFiles.windHeatmap[timelineIndex])
    ])

    const result = {
      [WIND_LAYER_KEYS.WIND]: windData,
      [WIND_LAYER_KEYS.WIND_DIRECTION_HEATMAP]: windDirectionHeatmapData,
      [WIND_LAYER_KEYS.WIND_HEATMAP]: windHeatmapData,
      [WIND_LAYER_KEYS.WIND_BARBS]: windData
    }

    windCache.set(timelineIndex, result)

    return result

  } catch (e) {
    console.error(e)

    return WIND_INITIAL_LAYERS_STATE
  }
}
