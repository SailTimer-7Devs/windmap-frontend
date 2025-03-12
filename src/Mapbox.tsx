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
  [0, [255, 255, 255, 255]],
  [5, [127, 255, 255, 255]],
  [10, [127, 255, 127, 255]],
  [15, [255, 255, 127, 255]],
  [20, [255, 127, 127, 255]],
  [25, [127, 0, 0, 255]],
]
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
