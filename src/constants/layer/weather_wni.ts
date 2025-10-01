
import type { LayersState, LayerKey } from 'types'
import type { Layer } from 'deck.gl'
import type { Palette } from 'cpt2js'

import { ClipExtension } from '@deck.gl/extensions'
import 'mapbox-gl/dist/mapbox-gl.css'

import * as WeatherLayers from 'weatherlayers-gl'

import * as BASE from 'constants/basemap'

import { handleImageDataLoad } from 'lib/image'

import {
  createTimelineLayerFileByGroup,
  createTimelineDatetimes
} from 'lib/timeline'

import { WEATHER_WNI as WEATHER_WNI_NAME } from './names'
import { WEATHER_WNI_FILES } from './files'

export const WEATHER_WNI = WEATHER_WNI_NAME
export const WEATHER_WNI_INTPCP = 'weather_wni_intpcp'
export const WEATHER_WNI_PH1000HPA = 'weather_wni_ph1000hpa'
export const WEATHER_WNI_PH500HPA = 'weather_wni_ph500hpa'
export const WEATHER_WNI_RH700HPA = 'weather_wni_rh700hpa'
export const WEATHER_WNI_RH850HPA = 'weather_wni_rh850hpa'
export const WEATHER_WNI_TMP1000HPA = 'weather_wni_tmp1000hpa'
export const WEATHER_WNI_TMP850HPA = 'weather_wni_tmp850hpa'
export const WEATHER_WNI_VISIBILITY = 'weather_wni_visibility'

export const WEATHER_WNI_LAYER_KEYS = {
  WEATHER_WNI,
  WEATHER_WNI_INTPCP,
  WEATHER_WNI_PH1000HPA,
  WEATHER_WNI_PH500HPA,
  WEATHER_WNI_RH700HPA,
  WEATHER_WNI_RH850HPA,
  WEATHER_WNI_TMP1000HPA,
  WEATHER_WNI_TMP850HPA,
  WEATHER_WNI_VISIBILITY
}

export const WEATHER_WNI_VISIBLE_LAYERS = [
  WEATHER_WNI
]

/*
  Layers: 'INTPCP' and 'PH500HPA' temporary disabled,
  their heatmaps without correct data
*/

export const WEATHER_WNI_INITIAL_LAYERS_STATE: LayersState = {
  [WEATHER_WNI]: undefined,
  // [WEATHER_WNI_INTPCP]: undefined,
  [WEATHER_WNI_PH1000HPA]: undefined,
  // [WEATHER_WNI_PH500HPA]: undefined,
  [WEATHER_WNI_RH700HPA]: undefined,
  [WEATHER_WNI_RH850HPA]: undefined,
  [WEATHER_WNI_TMP1000HPA]: undefined,
  [WEATHER_WNI_TMP850HPA]: undefined,
  [WEATHER_WNI_VISIBILITY]: undefined
}

export const LAYERS_MENU_LIST = [
  {
    id: WEATHER_WNI,
    name: 'Ice Pack'
  },
  // {
  //   id: WEATHER_WNI_INTPCP,
  //   name: 'Integrated Precipitation'
  // },
  // {
  //   id: WEATHER_WNI_PH500HPA,
  //   name: 'Pressure 500 hPa'
  // },
  {
    id: WEATHER_WNI_PH1000HPA,
    name: 'Pressure 1000 hPa'
  },
  {
    id: WEATHER_WNI_RH700HPA,
    name: 'Relative Humidity 700 hPa'
  },
  {
    id: WEATHER_WNI_RH850HPA,
    name: 'Relative Humidity 850 hPa'
  },
  {
    id: WEATHER_WNI_TMP850HPA,
    name: 'Temperature 850 hPa'
  },
  {
    id: WEATHER_WNI_TMP1000HPA,
    name: 'Temperature 1000 hPa'
  },
  {
    id: WEATHER_WNI_VISIBILITY,
    name: 'Visibility'
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
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_PH1000HPA,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_PH1000HPA as LayerKey],
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
  //   id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_PH500HPA,
  //   image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_PH500HPA as LayerKey],
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
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_RH700HPA,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_RH700HPA as LayerKey],
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
    id: WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_RH850HPA,
    image: layersState[WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_RH850HPA as LayerKey],
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
  })
]

export const weatherWniTimelineFiles = {
  weatherWniIce: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.ICE, 1),
  // weatherWniIntpcp: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.INTPCP, 1),
  weatherWniPh1000Hpa: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.PH1000HPA),
  // weatherWniPh500Hpa: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.PH500HPA, 1),
  weatherWniRh700Hpa: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.RH700HPA, 1),
  weatherWniRh850Hpa: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.RH850HPA, 1),
  weatherWniTmp1000Hpa: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.TMP1000HPA, 1),
  weatherWniTmp850Hpa: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.TMP850HPA, 1),
  weatherWniVisibility: createTimelineLayerFileByGroup(WEATHER_WNI_NAME, WEATHER_WNI_FILES.VISIBILITY, 1),
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
      weatherWniPh1000HpaData,
      // weatherWniPh500HpaData,
      weatherWniRh700HpaData,
      weatherWniRh850HpaData,
      weatherWniTmp1000HpaData,
      weatherWniTmp850HpaData,
      weatherWniVisibilityData
    ] = await Promise.all([
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniIce[timelineIndex]),
      // handleImageDataLoad(weatherWniTimelineFiles.weatherWniIntpcp[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniPh1000Hpa[timelineIndex]),
      // handleImageDataLoad(weatherWniTimelineFiles.weatherWniPh500Hpa[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniRh700Hpa[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniRh850Hpa[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniTmp1000Hpa[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniTmp850Hpa[timelineIndex]),
      handleImageDataLoad(weatherWniTimelineFiles.weatherWniVisibility[timelineIndex])
    ])

    const result = {
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI]: weatherWniIceData,
      // [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_INTPCP]: weatherWniIntpcpData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_PH1000HPA]: weatherWniPh1000HpaData,
      // [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_PH500HPA]: weatherWniPh500HpaData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_RH700HPA]: weatherWniRh700HpaData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_RH850HPA]: weatherWniRh850HpaData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_TMP1000HPA]: weatherWniTmp1000HpaData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_TMP850HPA]: weatherWniTmp850HpaData,
      [WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_VISIBILITY]: weatherWniVisibilityData
    }

    weatherWniCache.set(timelineIndex, result)

    return result

  } catch (e) {
    console.error(e)

    return WEATHER_WNI_INITIAL_LAYERS_STATE
  }
}