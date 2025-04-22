import type { CSSProperties } from 'react'
import type { ControlPosition } from 'react-map-gl/mapbox'
import type { BitmapBoundingBox } from '@deck.gl/layers'
import type { ImageUnscale } from 'weatherlayers-gl-fork/client'
import type { MapViewState } from 'types'

import { MapView } from 'deck.gl'

export const API_URL = 'https://d3s2may00o9nmt.cloudfront.net/public/latest/'

export const BASEMAP_VECTOR_LAYER_BEFORE_ID = 'waterway-label'
export const BASEMAP_VECTOR_STYLE_URL = 'mapbox://styles/s-t-/cm9laauxg00yc01s8fxzxcand'

export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoicy10LSIsImEiOiJjbTJhZGNldXowZjI2Mmxtdzg5NGl6MTlmIn0.-1-r5B8r6-xIzyL1gsbcEg'

/* WIND */
export const WINDMAP_URL = API_URL + 'wind_data.png'
export const WIND_HEATMAP_URL = API_URL + 'wind_data_heatmap.png'
export const WIND_DIRECTION_HEATMAP_URL = API_URL + 'wind_data_direction_heatmap.png'

/* WNI_PSWH */
export const WNI_PSWH_HEATMAP_URL = API_URL + 'wni_pswh_heatmap_feet.png'
export const WNI_PSWH_UV_URL = API_URL + 'wni_pswh_uv_feet.png'

/* WNI_PWH */
export const WNI_PWH_HEATMAP_URL = API_URL + 'wni_pwh_heatmap_feet.png'
export const WNI_PWH_UV_URL = API_URL + 'wni_pwh_uv_feet.png'

/* WNI_WSH */
export const WNI_WSH_HEATMAP_URL = API_URL + 'wni_wsh_heatmap_feet.png'
export const WNI_WSH_UV_URL = API_URL + 'wni_wsh_uv_feet.png'

export const WIND_SPEED_PALETTE = [
  [0, [48, 18, 59, 255]], // 0.00000 * 50 = 0
  [1, [55, 39, 104, 255]], // ≈ 0.02857 * 50 ≈ 1.43 → 1
  [3, [62, 59, 149, 255]], // ≈ 0.05714 * 50 ≈ 2.86 → 3
  [4, [66, 79, 184, 255]], // ≈ 0.08571 * 50 ≈ 4.29 → 4
  [6, [68, 98, 211, 255]], // ≈ 0.11429 * 50 ≈ 5.71 → 6
  [7, [70, 117, 237, 255]], // ≈ 0.14286 * 50 ≈ 7.14 → 7
  [9, [65, 135, 243, 255]], // ≈ 0.17143 * 50 ≈ 8.57 → 9
  [10, [60, 153, 249, 255]], // 0.20000 * 50 = 10
  [11, [51, 171, 244, 255]], // ≈ 0.22857 * 50 ≈ 11.43 → 11
  [13, [39, 189, 228, 255]], // ≈ 0.25714 * 50 ≈ 12.86 → 13
  [14, [27, 207, 212, 255]], // ≈ 0.28571 * 50 ≈ 14.29 → 14
  [16, [31, 219, 194, 255]], // ≈ 0.31429 * 50 ≈ 15.71 → 16
  [17, [34, 230, 175, 255]], // ≈ 0.34286 * 50 ≈ 17.14 → 17
  [19, [48, 239, 154, 255]], // ≈ 0.37143 * 50 ≈ 18.57 → 19
  [20, [72, 246, 131, 255]], // 0.40000 * 50 = 20
  [21, [97, 252, 108, 255]], // ≈ 0.42857 * 50 ≈ 21.43 → 21
  [23, [124, 252, 89, 255]], // ≈ 0.45714 * 50 ≈ 22.86 → 23
  [24, [151, 252, 69, 255]], // ≈ 0.48571 * 50 ≈ 24.29 → 24
  [26, [173, 248, 58, 255]], // ≈ 0.51429 * 50 ≈ 25.71 → 26
  [27, [191, 240, 55, 255]], // ≈ 0.54286 * 50 ≈ 27.14 → 27
  [29, [209, 232, 52, 255]], // ≈ 0.57143 * 50 ≈ 28.57 → 29
  [30, [223, 218, 54, 255]], // 0.60000 * 50 = 30
  [31, [236, 205, 57, 255]], // ≈ 0.62857 * 50 ≈ 31.43 → 31
  [33, [245, 189, 55, 255]], // ≈ 0.65714 * 50 ≈ 32.86 → 33
  [34, [250, 172, 50, 255]], // ≈ 0.68571 * 50 ≈ 34.29 → 34
  [36, [254, 155, 45, 255]], // ≈ 0.71429 * 50 ≈ 35.71 → 36
  [37, [250, 133, 35, 255]], // ≈ 0.74286 * 50 ≈ 37.14 → 37
  [39, [245, 110, 26, 255]], // ≈ 0.77143 * 50 ≈ 38.57 → 39
  [40, [238, 91, 18, 255]], // 0.80000 * 50 = 40
  [41, [227, 73, 12, 255]], // ≈ 0.82857 * 50 ≈ 41.43 → 41
  [43, [217, 56, 6, 255]], // ≈ 0.85714 * 50 ≈ 42.86 → 43
  [44, [201, 44, 4, 255]], // ≈ 0.88571 * 50 ≈ 44.29 → 44
  [46, [185, 31, 2, 255]], // ≈ 0.91429 * 50 ≈ 45.71 → 46
  [47, [166, 21, 1, 255]], // ≈ 0.94286 * 50 ≈ 47.14 → 47
  [49, [144, 12, 2, 255]], // ≈ 0.97143 * 50 ≈ 48.57 → 49
  [50, [122, 4, 2, 255]] // 1.00000 * 50 = 50
]

const TEXT_LAYERS = [
  'place_hamlet',
  'place_suburbs',
  'place_villages',
  'place_town',
  'place_country_2',
  'place_country_1',
  'place_state',
  'place_continent',
  'place_city_r6',
  'place_city_r5',
  'place_city_dot_r7',
  'place_city_dot_r4',
  'place_city_dot_r2',
  'place_city_dot_z7',
  'place_capital_dot_z7',
  'watername_ocean',
  'watername_sea',
  'watername_lake',
  'watername_lake_line',
  'waterway_label'
]

const LINE_LAYERS = [
  'waterway',
  'boundary_county',
  'boundary_state',
  'boundary_country_outline',
  'boundary_country_inner'
]

const FILL_LAYERS = [
  'water'
]

export function updateBasemapVectorStyle<T extends {
  setPaintProperty(layer: string, property: string, value: string): void
}>(map: T): void {
  for (const layer of TEXT_LAYERS) {
    map.setPaintProperty(layer, 'text-color', '#ccc')
  }

  for (const layer of LINE_LAYERS) {
    map.setPaintProperty(layer, 'line-color', '#222')
  }

  for (const layer of FILL_LAYERS) {
    map.setPaintProperty(layer, 'fill-color', '#222')
  }
}

export const MAP_STYLE: CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
}

export const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 0.45,
  latitude: 51.47,
  zoom: 0,
  minZoom: 0,
  maxZoom: 15
}
// const CLIP_BOUNDS = [-180, -85.051129, 180, 85.051129]
export const CLIP_BOUNDS = [-181, -85.051129, 181, 85.051129]

export const IMAGE_UNSCALE: ImageUnscale = [-128, 127]
export const WIND_MAP_BOUNDS: BitmapBoundingBox = [-180, -90, 180, 90]
// const WIND_HEATMAP_BOUNDS: BitmapBoundingBox = [-180, -85.051129, 180, 85.051129]

export const MAP_VIEW = new MapView({
  repeat: true
})

export const MAP_VIEW_CONTROLS_PROPS: {
  position: ControlPosition;
  style: CSSProperties;
} = {
  position: 'top-left',
  style: {
    position: 'relative',
    zIndex: 2
  }
}
