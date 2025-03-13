import type { DeckProps } from 'deck.gl'
import type { BitmapBoundingBox } from '@deck.gl/layers'
import type { TextureData, ImageUnscale } from 'weatherlayers-gl/client'
import type { CSSProperties } from 'react'
import type { Palette } from 'cpt2js';
import type { View } from '@deck.gl/core'
import type { MapboxOverlayProps } from '@deck.gl/mapbox'
// import type { MapCallbacks } from 'react-map-gl/mapbox'

import React from 'react'
import { Map, useControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapView } from 'deck.gl'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ClipExtension } from '@deck.gl/extensions'
import { RasterLayer, ParticleLayer } from 'weatherlayers-gl'

const BASEMAP_VECTOR_LAYER_BEFORE_ID = 'waterway-label'
const BASEMAP_VECTOR_STYLE_URL = 'mapbox://styles/serhiyandrejev/cm7npjmqq003h01qu6xsj7qr0'
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2VyaGl5YW5kcmVqZXYiLCJhIjoiY2tkbHg4eWN2MTNlZzJ1bGhvcmMyc25tcCJ9.BGYH_9ryrV4r5ttG6VuxFQ'
const MAP_STYLE: CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
}
const INITIAL_VIEW_STATE = {
  longitude: 0.45,
  latitude: 51.47,
  zoom: 0,
  minZoom: 0,
  maxZoom: 15,
}
// const CLIP_BOUNDS = [-180, -85.051129, 180, 85.051129]
const CLIP_BOUNDS = [-181, -85.051129, 181, 85.051129]
const PALETTE: Palette = [
  [0, [48, 18, 59, 255]],    // 0.00000 * 50 = 0
  [1, [55, 39, 104, 255]],   // ≈ 0.02857 * 50 ≈ 1.43 → 1
  [3, [62, 59, 149, 255]],   // ≈ 0.05714 * 50 ≈ 2.86 → 3
  [4, [66, 79, 184, 255]],   // ≈ 0.08571 * 50 ≈ 4.29 → 4
  [6, [68, 98, 211, 255]],   // ≈ 0.11429 * 50 ≈ 5.71 → 6
  [7, [70, 117, 237, 255]],  // ≈ 0.14286 * 50 ≈ 7.14 → 7
  [9, [65, 135, 243, 255]],  // ≈ 0.17143 * 50 ≈ 8.57 → 9
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
  [40, [238, 91, 18, 255]],  // 0.80000 * 50 = 40
  [41, [227, 73, 12, 255]],  // ≈ 0.82857 * 50 ≈ 41.43 → 41
  [43, [217, 56, 6, 255]],   // ≈ 0.85714 * 50 ≈ 42.86 → 43
  [44, [201, 44, 4, 255]],   // ≈ 0.88571 * 50 ≈ 44.29 → 44
  [46, [185, 31, 2, 255]],   // ≈ 0.91429 * 50 ≈ 45.71 → 46
  [47, [166, 21, 1, 255]],   // ≈ 0.94286 * 50 ≈ 47.14 → 47
  [49, [144, 12, 2, 255]],   // ≈ 0.97143 * 50 ≈ 48.57 → 49
  [50, [122, 4, 2, 255]],    // 1.00000 * 50 = 50
];

const IMAGE_UNSCALE: ImageUnscale = [-128, 127]
const WIND_MAP_BOUNDS: BitmapBoundingBox = [-180, -90, 180, 90]
const WIND_HEATMAP_BOUNDS: BitmapBoundingBox = [-180, -85.051129, 180, 85.051129]
const WINDMAP_URL = '/wind_data.png'
const WIND_HEATMAP_URL = '/wind_data_heatmap.png'
const INITIAL_STATE = {
  windData: undefined,
  windHeatmapData: undefined
} as State
const MAP_VIEW = new MapView({ repeat: true })

function Mapbox() {
  const [state, setState] = React.useState<State>(INITIAL_STATE)

  // const handleMapLoad: MapCallbacks['onLoad'] = (e) => {
  //   updateBasemapVectorStyle(e.target)
  // }

  // const handleHover: DeckProps['onHover'] = (e) => {
  //   console.log(e.raster)
  // }

  const handleLoad = async () => {
    try {
      const [windData, windHeatmapData] = await Promise.all([
        handleImageDataLoad(WINDMAP_URL),
        handleImageDataLoad(WIND_HEATMAP_URL)
      ])

      setState({
        windData,
        windHeatmapData
      })
    } catch (e) {
      console.error(e)
    }
  }

  React.useEffect(() => {
    handleLoad()
  }, [])

  return (
    <>
      <Map
        // onLoad={handleMapLoad}
        style={MAP_STYLE}
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        mapStyle={BASEMAP_VECTOR_STYLE_URL}
        initialViewState={INITIAL_VIEW_STATE}
      >
        <DeckGLOverlay<typeof MAP_VIEW>
          // interleaved
          views={MAP_VIEW}
          controller={true}
          // onHover={handleHover}
          layers={[
            new RasterLayer({
              id: 'heatmap',
              // data properties
              image: state.windHeatmapData,
              imageType: 'SCALAR', // "SCALAR" | "VECTOR"
              // imageUnscale: IMAGE_UNSCALE, ??? unsure if we need it
              bounds: WIND_HEATMAP_BOUNDS,
              // style properties
              visible: true,
              palette: PALETTE,
              opacity: 0.8,
              pickable: true,
              extensions: [new ClipExtension()],
              clipBounds: CLIP_BOUNDS,
              beforeId: BASEMAP_VECTOR_LAYER_BEFORE_ID,
            }),
            new ParticleLayer({
              id: 'particle',
              // data properties
              image: state.windData,
              imageType: 'VECTOR', // "SCALAR" | "VECTOR"
              imageUnscale: IMAGE_UNSCALE,
              bounds: WIND_MAP_BOUNDS,
              // style properties
              visible: true,
              numParticles: 5000,
              maxAge: 10,
              speedFactor: 10,
              width: 2,
              opacity: 0.2,
              animate: true,
              extensions: [new ClipExtension()],
              clipBounds: CLIP_BOUNDS,
              getPolygonOffset: () => [0, -1000],
              beforeId: BASEMAP_VECTOR_LAYER_BEFORE_ID
            }),
          ]}
        />
      </Map>
    </>
  )
}

function DeckGLOverlay<T extends View | View[]>(
  props: DeckProps<T>
) {
  const overlay = useControl<MapboxOverlay>(
    () => new MapboxOverlay(props as MapboxOverlayProps)
  )

  overlay.setProps(props as MapboxOverlayProps)

  return null
}

// const TEXT_LAYERS = [
//   'place_hamlet',
//   'place_suburbs',
//   'place_villages',
//   'place_town',
//   'place_country_2',
//   'place_country_1',
//   'place_state',
//   'place_continent',
//   'place_city_r6',
//   'place_city_r5',
//   'place_city_dot_r7',
//   'place_city_dot_r4',
//   'place_city_dot_r2',
//   'place_city_dot_z7',
//   'place_capital_dot_z7',
//   'watername_ocean',
//   'watername_sea',
//   'watername_lake',
//   'watername_lake_line',
//   'waterway_label',
// ]

// export function updateBasemapVectorStyle(map) {
//   for (let layer of TEXT_LAYERS) {
//     map.setPaintProperty(layer, 'text-color', '#ccc')
//   }
//   for (let layer of LINE_LAYERS) {
//     map.setPaintProperty(layer, 'line-color', '#222')
//   }
//   for (let layer of FILL_LAYERS) {
//     map.setPaintProperty(layer, 'fill-color', '#222')
//   }
// }

type State = {
  windData?: TextureData
  windHeatmapData?: TextureData
}

function handleImageDataLoad(url: string): Promise<TextureData> {
  return new Promise((resolve, reject) => {
    const windImg = new Image()

    windImg.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = windImg.width
      canvas.height = windImg.height
      const ctx = canvas.getContext('2d')
      ctx!.drawImage(windImg, 0, 0)
      const { data } = ctx!.getImageData(0, 0, canvas.width, canvas.height)

      resolve({
        data,
        width: canvas.width,
        height: canvas.height
      })
    }
    windImg.onerror = reject

    windImg.src = url
  })
}

export default Mapbox
