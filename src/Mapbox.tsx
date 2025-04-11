import type { DeckProps } from 'deck.gl'
import type { BitmapBoundingBox } from '@deck.gl/layers'
import type { TextureData, ImageUnscale } from 'weatherlayers-gl-fork/client'
import type { CSSProperties } from 'react'
import type { Palette } from 'cpt2js';
import type { View } from '@deck.gl/core'
import type { MapboxOverlayProps } from '@deck.gl/mapbox'
import type { MapCallbacks } from 'react-map-gl/mapbox'

import React from 'react'
import { MapView } from 'deck.gl'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ClipExtension } from '@deck.gl/extensions'
import { Map, useControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import * as WeatherLayers from 'weatherlayers-gl'

import {
  BASEMAP_VECTOR_LAYER_BEFORE_ID,
  BASEMAP_VECTOR_STYLE_URL,
  MAPBOX_ACCESS_TOKEN,
  WINDMAP_URL,
  WIND_HEATMAP_URL,
  WIND_SPEED_PALETTE,
  // updateBasemapVectorStyle
} from './basemap'

import { handleImageDataLoad } from './lib'


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


const IMAGE_UNSCALE: ImageUnscale = [-128, 127]
const WIND_MAP_BOUNDS: BitmapBoundingBox = [-180, -90, 180, 90]
// const WIND_HEATMAP_BOUNDS: BitmapBoundingBox = [-180, -85.051129, 180, 85.051129]

const INITIAL_STATE = {
  windData: undefined,
  windHeatmapData: undefined
} as State

const MAP_VIEW = new MapView({
  repeat: true
})

let legendControl
let tooltipControl: WeatherLayers.TooltipControl

function Mapbox() {
  const [state, setState] = React.useState<State>(INITIAL_STATE)

  const layers = [
    new WeatherLayers.RasterLayer({
      id: 'heatmap',
      // data properties
      image: state.windHeatmapData,
      imageType: 'SCALAR', // "SCALAR" | "VECTOR"
      // imageUnscale: IMAGE_UNSCALE, ??? unsure if we need it
      bounds: WIND_MAP_BOUNDS,
      // style properties
      visible: true,
      palette: WIND_SPEED_PALETTE as Palette,
      opacity: 0.3,
      pickable: true,
      imageUnscale: [0, 255],
      extensions: [new ClipExtension()],
      clipBounds: CLIP_BOUNDS,
      beforeId: BASEMAP_VECTOR_LAYER_BEFORE_ID,
    }),

    new WeatherLayers.ParticleLayer({
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
    })
  ]

  const handleMapLoad: MapCallbacks['onLoad'] = (e) => {
    const mapInstance = e.target

    legendControl = new WeatherLayers.LegendControl({
      title: 'Wind speed',
      unitFormat: {
        unit: 'knots',
      },
      palette: WIND_SPEED_PALETTE as Palette
    })

    const el = document.getElementsByClassName('mapboxgl-ctrl-bottom-right')[0] as HTMLElement

    legendControl.addTo(el)

    // debugger

    tooltipControl = new WeatherLayers.TooltipControl({
      unitFormat: {
        unit: 'knots'
      },
      directionFormat: WeatherLayers.DirectionFormat.CARDINAL3,
      followCursor: true
    })
    const parentElement = mapInstance.getCanvas().parentElement as HTMLElement
    
    tooltipControl.addTo(parentElement)

    // mapInstance.setProps({
    //   onHover: event => tooltipControl.updatePickingInfo(event)
    // })


    // updateBasemapVectorStyle(e.target)
  }

  const handleHover: DeckProps['onHover'] = (e) => {
    tooltipControl && tooltipControl.updatePickingInfo(e)
  }

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
        onLoad={handleMapLoad}
        style={MAP_STYLE}
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        mapStyle={BASEMAP_VECTOR_STYLE_URL}
        initialViewState={INITIAL_VIEW_STATE}
      >
        <DeckGLOverlay<typeof MAP_VIEW>
          // interleaved
          views={MAP_VIEW}
          controller={true}
          onHover={handleHover}
          layers={layers}
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

type State = {
  windData?: TextureData
  windHeatmapData?: TextureData
}

export default Mapbox
