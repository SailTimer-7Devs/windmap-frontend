
import type { LayersState, LayerKey } from 'types'
import type { Layer } from 'deck.gl'
import type { Palette } from 'cpt2js'

import { ClipExtension } from '@deck.gl/extensions'
import 'mapbox-gl/dist/mapbox-gl.css'

import * as WeatherLayers from 'weatherlayers-gl'

import * as BASE from 'constants/basemap'

import EyeIcon from 'icons/Eye'
import IntegratedPrecipitationIcon from 'icons/IntegratedPrecipitation'
import OceanIcon from 'icons/Ocean'
import SeaTemperatureIcon from 'icons/SeaTemperature'
import SnowIcon from 'icons/Snow'
// import TemperatureIcon from 'icons/Temperature'
import TemperatureHighIcon from 'icons/TemperatureHigh'
import WindAnimationIcon from 'icons/WindAnimation'
import WaveIcon from 'icons/Wave'
import SwellHeightIcon from 'icons/SwellHeight'

import { handleImageDataLoad } from 'lib/image'
import {
  setParticlesNumbersByDeviceType,
  setParticleWidthByDevice
} from 'lib/layer'

import {
  createTimelineLayerFileByGroup,
  createTimelineDatetimes
} from 'lib/timeline'

import { PSWH as PSWH_NAME } from './names'
import { WEATHER_WNI as WEATHER_WNI_NAME } from './names'
import { WEATHER_WNI_FILES } from './files'

export const WEATHER_WNI = WEATHER_WNI_NAME
export const WEATHER_WNI_ICE_PACK = 'weather_wni_ice_pack'
export const WEATHER_WNI_INTPCP = 'weather_wni_intpcp'
export const WEATHER_WNI_TMP850HPA = 'weather_wni_tmp850hpa'
export const WEATHER_WNI_AIR_TEMPERATURE = 'weather_wni_tmp1000hpa'
export const WEATHER_WNI_VISIBILITY = 'weather_wni_visibility'
export const WEATHER_WNI_WAVE_UV = 'weather_wni_wave_uv'
export const WEATHER_WNI_WAVE_HEATMAP = 'weather_wni_wave_heatmap'
export const WEATHER_WNI_WIND_UV = 'weather_wni_wind_uv'
export const WEATHER_WNI_WIND_HEATMAP = 'weather_wni_wind_heatmap'
export const WEATHER_WNI_SST = 'weather_wni_sst'
export const WEATHER_WNI_OCEAN_CURRENT_UV = 'weather_wni_ocean_current_uv'
export const WEATHER_WNI_OCEAN_CURRENT_HEATMAP = 'weather_wni_ocean_current_heatmap'
export const WEATHER_WNI_PSWH_HEATMAP = 'weather_wni_pswh_heatmap'
export const WEATHER_WNI_PSWH_UV = 'weather_wni_pswh-uv'
export const WEATHER_WNI_WIND_TOOLTIP = 'weather_wni_wind_uv-tooltip'
export const WEATHER_WNI_WAVE_TOOLTIP = 'weather_wni_wave_uv-tooltip'
export const WEATHER_WNI_OCEAN_CURRENT_TOOLTIP = 'weather_wni_ocean_current_uv-tooltip'
export const WEATHER_WNI_PSWH_UV_TOOLTIP = 'weather_wni_pswh-uv-tooltip'

export const WEATHER_WNI_LAYER_KEYS = {
  WEATHER_WNI_ICE_PACK,
  WEATHER_WNI_INTPCP,
  WEATHER_WNI_TMP850HPA,
  WEATHER_WNI_AIR_TEMPERATURE,
  WEATHER_WNI_VISIBILITY,
  WEATHER_WNI_WAVE_UV,
  WEATHER_WNI_WAVE_HEATMAP,
  WEATHER_WNI_WIND_UV,
  WEATHER_WNI_WIND_HEATMAP,
  WEATHER_WNI_SST,
  WEATHER_WNI_OCEAN_CURRENT_UV,
  WEATHER_WNI_OCEAN_CURRENT_HEATMAP,
  WEATHER_WNI_PSWH_HEATMAP,
  WEATHER_WNI_PSWH_UV,
  WEATHER_WNI_WAVE_TOOLTIP,
  WEATHER_WNI_WIND_TOOLTIP,
  WEATHER_WNI_OCEAN_CURRENT_TOOLTIP,
  WEATHER_WNI_PSWH_UV_TOOLTIP
}

export const WEATHER_WNI_VISIBLE_LAYERS = [
  WEATHER_WNI_AIR_TEMPERATURE
]

export const WEATHER_WNI_INITIAL_LAYERS_STATE: LayersState = {
  [WEATHER_WNI_ICE_PACK]: undefined,
  [WEATHER_WNI_INTPCP]: undefined,
  [WEATHER_WNI_AIR_TEMPERATURE]: undefined,
  // [WEATHER_WNI_TMP850HPA]: undefined,
  [WEATHER_WNI_VISIBILITY]: undefined,
  [WEATHER_WNI_WAVE_UV]: undefined,
  [WEATHER_WNI_WAVE_HEATMAP]: undefined,
  [WEATHER_WNI_WIND_UV]: undefined,
  [WEATHER_WNI_SST]: undefined,
  [WEATHER_WNI_OCEAN_CURRENT_UV]: undefined,
  [WEATHER_WNI_PSWH_HEATMAP]: undefined,
  [WEATHER_WNI_PSWH_UV]: undefined
}

export const LAYERS_MENU_LIST = [
  {
    id: WEATHER_WNI_INTPCP,
    name: 'Precipitation',
    icon: IntegratedPrecipitationIcon
  },
  {
    id: WEATHER_WNI_AIR_TEMPERATURE,
    name: 'Air Temperature',
    icon: TemperatureHighIcon
  },
  {
    id: WEATHER_WNI_VISIBILITY,
    name: 'Visibility',
    icon: EyeIcon
  },
  {
    id: WEATHER_WNI_SST,
    name: 'Sea Surface Temperature',
    icon: SeaTemperatureIcon
  },
  {
    id: WEATHER_WNI_OCEAN_CURRENT_UV,
    name: 'Ocean Currents',
    icon: OceanIcon
  },
  // {
  //   id: WEATHER_WNI_TMP850HPA,
  //   name: 'Temperature 850 hPa',
  //   icon: TemperatureIcon
  // },
  {
    id: WEATHER_WNI_WIND_UV,
    name: 'Offshore Wind',
    icon: WindAnimationIcon
  },
  {
    id: WEATHER_WNI_WAVE_UV,
    name: 'Waves offshore',
    icon: WaveIcon
  },
  {
    id: WEATHER_WNI_PSWH_UV,
    name: 'Swell offshore',
    icon: SwellHeightIcon
  },
  {
    id: WEATHER_WNI_ICE_PACK,
    name: 'Ice Pack',
    icon: SnowIcon
  }
]

export const getWeatherWniLayers = (layersState: LayersState): Layer[] => [
  new WeatherLayers.RasterLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_ICE_PACK,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_ICE_PACK as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.ICE_PACK_PALETTE as Palette,
    opacity: 0.2,
    // pickable: true,
    imageUnscale: [0, 1],
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  new WeatherLayers.RasterLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_INTPCP,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_INTPCP as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.PRECIPITATION_PALETTE as Palette,
    opacity: 0.2,
    pickable: true,
    imageUnscale: [0, 20],
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  new WeatherLayers.RasterLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_AIR_TEMPERATURE,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_AIR_TEMPERATURE as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.TEMPERATURE_PALETTE as Palette,
    opacity: 0.2,
    pickable: true,
    imageUnscale: [-50, 50],
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  new WeatherLayers.RasterLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_TMP850HPA,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_TMP850HPA as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.TEMPERATURE_PALETTE as Palette,
    opacity: 0.2,
    pickable: true,
    imageUnscale: [-50, 50],
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  new WeatherLayers.RasterLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_VISIBILITY,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_VISIBILITY as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.VISIBILITY_PALETTE as Palette,
    opacity: 0.2,
    pickable: true,
    imageUnscale: [0, 10000],
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  new WeatherLayers.ParticleLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WIND_UV,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WIND_UV as LayerKey],
    imageType: 'VECTOR',
    imageUnscale: BASE.IMAGE_UNSCALE,
    bounds: BASE.WIND_MAP_BOUNDS,
    numParticles: setParticlesNumbersByDeviceType() * 4,
    maxAge: 30,
    speedFactor: 5,
    width: setParticleWidthByDevice(),
    opacity: 0.15,
    fadeFactor: 0.96,
    animate: true,
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    getPolygonOffset: () => [0, -1000],
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  new WeatherLayers.RasterLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WIND_HEATMAP,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WIND_HEATMAP as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.WIND_SPEED_PALETTE_1_40 as Palette,
    opacity: 0.2,
    pickable: true,
    imageUnscale: [0, 40],
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  // wind uv tooltip
  new WeatherLayers.RasterLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WIND_TOOLTIP,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WIND_UV as LayerKey],
    imageType: 'VECTOR',
    imageUnscale: [-40, 40],
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.WIND_SPEED_PALETTE_1_40 as Palette,
    imageInterpolation: 'CUBIC',
    opacity: 0,
    pickable: true,
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  new WeatherLayers.RasterLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_SST,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_SST as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.SST_PALETTE as Palette,
    opacity: 0.2,
    pickable: true,
    imageUnscale: [-50, 50],
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  new WeatherLayers.ParticleLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_OCEAN_CURRENT_UV,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_OCEAN_CURRENT_UV as LayerKey],
    imageType: 'VECTOR',
    imageUnscale: BASE.IMAGE_UNSCALE,
    bounds: BASE.OCEAN_CURRENT_MAP_BOUNDS,
    numParticles: setParticlesNumbersByDeviceType() * 14,
    maxAge: 60,
    speedFactor: 50,
    width: setParticleWidthByDevice(),
    opacity: 0.6,
    fadeFactor: 0.96,
    animate: true,
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    getPolygonOffset: () => [0, -1000],
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  new WeatherLayers.RasterLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_OCEAN_CURRENT_HEATMAP,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_OCEAN_CURRENT_HEATMAP as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.OCEAN_CURRENT_MAP_BOUNDS,
    palette: BASE.OCEAN_CURRENTS_PALETTE as Palette,
    opacity: 0.3,
    pickable: true,
    imageUnscale: [0, 2.2],
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  // ocean tooltip
  new WeatherLayers.RasterLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_OCEAN_CURRENT_TOOLTIP,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_OCEAN_CURRENT_UV as LayerKey],
    imageType: 'VECTOR',
    imageUnscale: [-128, 127],
    bounds: BASE.OCEAN_CURRENT_MAP_BOUNDS,
    palette: BASE.OCEAN_CURRENTS_PALETTE as Palette,
    imageInterpolation: 'CUBIC',
    opacity: 0,
    pickable: true,
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  //pswh Swell Height
  new WeatherLayers.RasterLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_PSWH_HEATMAP,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_PSWH_HEATMAP as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.SWELL_HEIGHT_PALETTE_0_50 as Palette,
    opacity: 0.5,
    pickable: true,
    imageUnscale: [0, 19.6],
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  //pswh Swell Animation
  new WeatherLayers.ParticleLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_PSWH_UV,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_PSWH_UV as LayerKey],
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

  //pswh Swell Animation tooltip
  new WeatherLayers.RasterLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_PSWH_UV_TOOLTIP,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_PSWH_UV as LayerKey],
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

  // pwh wave height
  new WeatherLayers.RasterLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WAVE_HEATMAP,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WAVE_HEATMAP as LayerKey],
    imageType: 'SCALAR',
    bounds: BASE.WIND_MAP_BOUNDS,
    palette: BASE.WAVE_HEIGHT_PALETTE_0_50 as Palette,
    opacity: 0.5,
    pickable: true,
    imageUnscale: [0, 19.6],
    extensions: [new ClipExtension()],
    clipBounds: BASE.CLIP_BOUNDS,
    beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
  }),

  // pwh wave animation
  new WeatherLayers.ParticleLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WAVE_UV,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WAVE_UV as LayerKey],
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

  // pwh wave animation tooltip
  new WeatherLayers.RasterLayer({
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WAVE_TOOLTIP,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WAVE_UV as LayerKey],
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
  })
]

export const weatherWniTimelineFiles = {
  weatherWniIce: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.ICE),
  weatherWniIntpcp: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.INTPCP),
  weatherWniTmp850Hpa: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.TMP850HPA),
  weatherWniAirTemperature: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.AIR_TEMPERATURE),
  weatherWniVisibility: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.VISIBILITY),
  weatherWniWaveUv: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.WAVE_UV),
  weatherWniWaveHeatmap: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.WAVE_HEATMAP),
  weatherWniWindUv: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.WIND_UV),
  weatherWniWindHeatmap: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.WIND_HEATMAP),
  weatherWniSst: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.SST),
  weatherWniOceanCurrentUv: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.OCEAN_CURRENT_UV),
  weatherWniOceanCurrentHeatmap: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.OCEAN_CURRENT_HEATMAP),
  pswhHeatmap: createTimelineLayerFileByGroup(PSWH_NAME, WEATHER_WNI_FILES.HEATMAP),
  pswhUv: createTimelineLayerFileByGroup(PSWH_NAME, WEATHER_WNI_FILES.PSWH_UV),
  datetime: createTimelineDatetimes()
}

export const HIDE_TIMELINE_CONTROL_FOR_LAYERS = [
  WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_ICE_PACK,
  WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_VISIBILITY,
  WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_SST
]

const weatherWniCache = new Map<number, LayersState>()

export async function getWeatherWniLayersData(timelineIndex: number = 0): Promise<LayersState> {
  if (weatherWniCache.has(timelineIndex)) {
    return weatherWniCache.get(timelineIndex)!
  }

  if (!navigator.onLine) {
    console.warn('Offline mode detected.')

    if (weatherWniCache.size === 0) {
      alert('Sorry, that data is not available while you are offline.')
      return WEATHER_WNI_INITIAL_LAYERS_STATE
    }

    const lastCached = Array.from(weatherWniCache.values()).pop()
    if (lastCached) return lastCached
  }

  try {
    const results = await Promise.allSettled([
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniIce[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniIntpcp[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniAirTemperature[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniVisibility[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniWaveUv[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniWaveHeatmap[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniWindUv[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniWindHeatmap[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniSst[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniOceanCurrentUv[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniOceanCurrentHeatmap[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.pswhHeatmap[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.pswhUv[timelineIndex])
    ])

    const [
      weatherWniIceData,
      weatherWniIntpcpData,
      weatherWniAirTemperatureData,
      weatherWniVisibilityData,
      weatherWniWaveUvData,
      weatherWniWaveHeatmapData,
      weatherWniWindUvData,
      weatherWniWindHeatmapData,
      weatherWniSstData,
      weatherWniOceanCurrentUvData,
      weatherWniOceanCurrentHeatmapData,
      pswhHeatmapData,
      pswhUvData
    ] = results.map(r => (r.status === 'fulfilled' ? r.value : undefined))

    const result: LayersState = {
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_ICE_PACK]: weatherWniIceData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_INTPCP]: weatherWniIntpcpData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_AIR_TEMPERATURE]: weatherWniAirTemperatureData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_VISIBILITY]: weatherWniVisibilityData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WAVE_UV]: weatherWniWaveUvData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WAVE_HEATMAP]: weatherWniWaveHeatmapData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WIND_UV]: weatherWniWindUvData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WIND_HEATMAP]: weatherWniWindHeatmapData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_SST]: weatherWniSstData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_OCEAN_CURRENT_UV]: weatherWniOceanCurrentUvData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_OCEAN_CURRENT_HEATMAP]: weatherWniOceanCurrentHeatmapData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_PSWH_HEATMAP]: pswhHeatmapData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_PSWH_UV]: pswhUvData
    }

    weatherWniCache.set(timelineIndex, result)
    return result
  } catch (e) {
    console.error(e)
    return WEATHER_WNI_INITIAL_LAYERS_STATE
  }
}

