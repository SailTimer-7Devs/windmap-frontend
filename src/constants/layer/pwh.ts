import type { LayersState, LayerKey } from 'types'
import type { Layer } from 'deck.gl'
import type { Palette } from 'cpt2js'

import { ClipExtension } from '@deck.gl/extensions'
import 'mapbox-gl/dist/mapbox-gl.css'

import * as WeatherLayers from 'weatherlayers-gl'

import * as BASE from 'constants/basemap'

import WaveIcon from 'icons/Wave'

import { handleImageDataLoad } from 'lib/image'

import {
  createTimelineLayerFileByGroup,
  createTimelineDatetimes
} from 'lib/timeline'

import { PWH as PWH_NAME } from './names'
import { WNI_PWH_FILES } from './files'

export const PWH_HEATMAP = PWH_NAME
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

export const LAYERS_MENU_LIST = [
  {
    id: PWH_HEATMAP,
    name: 'Wave Height',
    icon: WaveIcon
  },
  {
    id: PWH_UV,
    name: 'Wave Animation',
    icon: WaveIcon
  }
]

export const getPwhLayers = (layersState: LayersState): Layer[] => [
  new WeatherLayers.RasterLayer({
    id: PWH_LAYER_KEYS.PWH_HEATMAP,
    image: layersState[PWH_LAYER_KEYS.PWH_HEATMAP as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.WAVE_HEIGHT_PALETTE_0_50 as Palette,
    opacity: 0.5,
    pickable: true,
    imageUnscale: [0, 25.5],
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

export const pwhTimelineFiles = {
  pwhHeatmap: createTimelineLayerFileByGroup(PWH_NAME, WNI_PWH_FILES.WAVE_HEATMAP),
  pwhUv: createTimelineLayerFileByGroup(PWH_NAME, WNI_PWH_FILES.WAVE_UV),
  datetime: createTimelineDatetimes()
}

const pwhCache = new Map<number, LayersState>()

export async function getPwhLayersData(timelineIndex: number = 0): Promise<LayersState> {
  if (pwhCache.has(timelineIndex)) {
    return pwhCache.get(timelineIndex)!
  }

  try {
    const [
      pwhHeatmapData,
      pwhUvData
    ] = await Promise.all([
      handleImageDataLoad(pwhTimelineFiles.pwhHeatmap[timelineIndex]),
      handleImageDataLoad(pwhTimelineFiles.pwhUv[timelineIndex])
    ])

    const result = {
      [PWH_LAYER_KEYS.PWH_HEATMAP]: pwhHeatmapData,
      [PWH_LAYER_KEYS.PWH_UV]: pwhUvData
    }

    pwhCache.set(timelineIndex, result)

    return result

  } catch (e) {
    console.error(e)

    return PWH_INITIAL_LAYERS_STATE
  }
}
