
import type { LayersState, LayerKey } from 'types'
import type { Layer } from 'deck.gl'
import type { Palette } from 'cpt2js'

import { ClipExtension } from '@deck.gl/extensions'
import 'mapbox-gl/dist/mapbox-gl.css'

import * as WeatherLayers from 'weatherlayers-gl'

import * as BASE from 'constants/basemap'

import EyeIcon from 'icons/Eye'
import SnowIcon from 'icons/Snow'
// import TemperatureIcon from 'icons/Temperature'
// import TemperatureHighIcon from 'icons/TemperatureHigh'
import WindAnimationIcon from 'icons/WindAnimation'
import WaveIcon from 'icons/Wave'

import { handleImageDataLoad } from 'lib/image'
import {
  setParticlesNumbersByDeviceType,
  setParticleWidthByDevice
} from 'lib/layer'

import {
  createTimelineLayerFileByGroup,
  createTimelineDatetimes
} from 'lib/timeline'

import { WEATHER_WNI as WEATHER_WNI_NAME } from './names'
import { WEATHER_WNI_FILES } from './files'

export const WEATHER_WNI = WEATHER_WNI_NAME
export const WEATHER_WNI_INTPCP = 'weather_wni_intpcp'
export const WEATHER_WNI_TMP850HPA = 'weather_wni_tmp850hpa'
export const WEATHER_WNI_TMP1000HPA = 'weather_wni_tmp1000hpa'
export const WEATHER_WNI_VISIBILITY = 'weather_wni_visibility'
export const WEATHER_WNI_UV = 'weather_wni_uv'
export const WEATHER_WNI_WIND_UV = 'weather_wni_wind_uv'

export const WEATHER_WNI_LAYER_KEYS = {
  WEATHER_WNI,
  WEATHER_WNI_INTPCP,
  WEATHER_WNI_TMP850HPA,
  WEATHER_WNI_TMP1000HPA,
  WEATHER_WNI_VISIBILITY,
  WEATHER_WNI_UV,
  WEATHER_WNI_WIND_UV
}

export const WEATHER_WNI_VISIBLE_LAYERS = [
  WEATHER_WNI
]

/*
  Layer: 'INTPCP' temporary disabled,
  heatmap without correct data yet
*/

export const WEATHER_WNI_INITIAL_LAYERS_STATE: LayersState = {
  [WEATHER_WNI]: undefined,
  // [WEATHER_WNI_INTPCP]: undefined,
  [WEATHER_WNI_TMP1000HPA]: undefined,
  [WEATHER_WNI_TMP850HPA]: undefined,
  [WEATHER_WNI_VISIBILITY]: undefined,
  [WEATHER_WNI_UV]: undefined,
  [WEATHER_WNI_WIND_UV]: undefined
}

export const LAYERS_MENU_LIST = [
  {
    id: WEATHER_WNI,
    name: 'Ice Pack',
    icon: SnowIcon
  },
  // {
  //   id: WEATHER_WNI_INTPCP,
  //   name: 'Integrated Precipitation'
  // },
  // {
  //   id: WEATHER_WNI_TMP850HPA,
  //   name: 'Temperature 850 hPa',
  //   icon: TemperatureIcon
  // },
  // {
  //   id: WEATHER_WNI_TMP1000HPA,
  //   name: 'Temperature 1000 hPa',
  //   icon: TemperatureHighIcon
  // },
  {
    id: WEATHER_WNI_VISIBILITY,
    name: 'Visibility',
    icon: EyeIcon
  },
  {
    id: WEATHER_WNI_UV,
    name: 'Wave speed',
    icon: WaveIcon
  },
  {
    id: WEATHER_WNI_WIND_UV,
    name: 'Wind speed',
    icon: WindAnimationIcon
  }
]

export const getWeatherWniLayers = (layersState: LayersState): Layer[] => [
  new WeatherLayers.RasterLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.WIND_SPEED_PALETTE as Palette,
    opacity: 0.2,
    imageUnscale: [0, 255],
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  // new WeatherLayers.RasterLayer({
  //   id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_INTPCP,
  //   image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_INTPCP as LayerKey],
  //   imageType: 'SCALAR',
  //   bounds: BASE.WIND_MAP_BOUNDS,
  //   palette: BASE.WIND_SPEED_PALETTE as Palette,
  //   opacity: 0.2,
  //   imageUnscale: [0, 255],
  //   extensions: [new ClipExtension()],
  //   clipBounds: BASE.CLIP_BOUNDS,
  //   beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  // }),

  new WeatherLayers.RasterLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_TMP1000HPA,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_TMP1000HPA as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.WIND_SPEED_PALETTE as Palette,
    opacity: 0.2,
    imageUnscale: [0, 255],
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  new WeatherLayers.RasterLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_TMP850HPA,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_TMP850HPA as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.WIND_SPEED_PALETTE as Palette,
    opacity: 0.2,
    imageUnscale: [0, 255],
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  new WeatherLayers.RasterLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_VISIBILITY,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_VISIBILITY as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.WIND_SPEED_PALETTE as Palette,
    opacity: 0.2,
    imageUnscale: [0, 255],
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  new WeatherLayers.ParticleLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_UV,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_UV as LayerKey],
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
  }),

  new WeatherLayers.ParticleLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WIND_UV,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WIND_UV as LayerKey],
    imageType: 'VECTOR',
    imageUnscale: BASE.IMAGE_UNSCALE,
    bounds: BASE.WIND_MAP_BOUNDS,
    numParticles: setParticlesNumbersByDeviceType(),
    maxAge: 100,
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

export const weatherWniTimelineFiles = {
  weatherWniIce: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.ICE, 1),
  // weatherWniIntpcp: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.INTPCP, 1),
  weatherWniTmp850Hpa: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.TMP850HPA, 1),
  weatherWniTmp1000Hpa: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.TMP1000HPA, 1),
  weatherWniVisibility: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.VISIBILITY, 1),
  weatherWniUv: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.UV, 1),
  weatherWniWindUv: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.WIND_UV, 1),
  datetime: createTimelineDatetimes(1)
}

const weatherWniCache = new Map<number, LayersState>()

export async function getWeatherWniLayersData(timelineIndex: number = 0): Promise<LayersState> {
  if (weatherWniCache.has(timelineIndex)) {
    return weatherWniCache.get(timelineIndex)!
  }

  try {
    const [
      weatherWniIceData,
      // weatherWniIntpcpData,
      weatherWniTmp850HpaData,
      weatherWniTmp1000HpaData,
      weatherWniVisibilityData,
      weatherWniUvData,
      weatherWniWindUvData
    ] = await Promise.all([
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniIce[timelineIndex]),
      // handleImageDataLoad(weatherWniTimelineFiles.weatherWniIntpcp[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniTmp850Hpa[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniTmp1000Hpa[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniVisibility[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniUv[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniWindUv[timelineIndex])
    ])

    const result = {
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI]: weatherWniIceData,
      // [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_INTPCP]: weatherWniIntpcpData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_TMP850HPA]: weatherWniTmp850HpaData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_TMP1000HPA]: weatherWniTmp1000HpaData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_VISIBILITY]: weatherWniVisibilityData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_UV]: weatherWniUvData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WIND_UV]: weatherWniWindUvData
    }

    weatherWniCache.set(timelineIndex, result)

    return result

  } catch (e) {
    console.error(e)

    return WEATHER_WNI_INITIAL_LAYERS_STATE
  }
}
