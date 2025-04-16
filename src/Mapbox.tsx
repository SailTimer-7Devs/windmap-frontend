import type { ReactElement } from 'react'
import type { State, LayerKey } from 'src/constants/layers'

import type { DeckProps } from 'deck.gl'
import type { MapboxOverlayProps } from '@deck.gl/mapbox'
import type { View } from '@deck.gl/core'

import type { Palette } from 'cpt2js'

import type { MapCallbacks } from 'react-map-gl/mapbox'

import React from 'react'

import { MapboxOverlay } from '@deck.gl/mapbox'
import { ClipExtension } from '@deck.gl/extensions'

import { Map, useControl } from 'react-map-gl/mapbox'

import * as WeatherLayers from 'weatherlayers-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import { INITIAL_STATE, LAYERS } from 'src/constants/layers'

import LayersMenu from './LayersMenu'

import * as OPTIONS from 'src/constants/basemap'

import { handleImageDataLoad } from './lib'

let legendControl
let tooltipControl: WeatherLayers.TooltipControl

function Mapbox(): ReactElement {
  const [state, setState] = React.useState<State>(INITIAL_STATE)

  const layers = [
    new WeatherLayers.RasterLayer({
      id: 'heatmap',
      // data properties
      image: state[LAYERS.WIND_HEATMAP as LayerKey].data,
      imageType: 'SCALAR', // "SCALAR" | "VECTOR"
      // imageUnscale: IMAGE_UNSCALE, ??? unsure if we need it
      bounds: OPTIONS.WIND_MAP_BOUNDS,
      // style properties
      visible: state[LAYERS.WIND_HEATMAP as LayerKey].visible,
      palette: OPTIONS.WIND_SPEED_PALETTE as Palette,
      opacity: 0.3,
      pickable: true,
      imageUnscale: [0, 255],
      extensions: [new ClipExtension()],
      clipBounds: OPTIONS.CLIP_BOUNDS,
      beforeId: OPTIONS.BASEMAP_VECTOR_LAYER_BEFORE_ID
    }),

    new WeatherLayers.ContourLayer({
      id: 'heatmap-contour-direction',
      // data properties
      image: state[LAYERS.WIND_DIRECTION_HEATMAP as LayerKey].data,
      bounds: OPTIONS.WIND_MAP_BOUNDS,
      imageUnscale: [0, 22.5],
      // style properties,
      imageInterpolation: 'CUBIC',
      imageSmoothing: 6,
      interval: 1,
      majorInterval: 0,
      width: 1,
      color: [255, 255, 255, 200], // [r, g, b, [a]?]
      extensions: [new ClipExtension()],
      clipBounds: OPTIONS.CLIP_BOUNDS,
      visible: state[LAYERS.WIND_DIRECTION_HEATMAP as LayerKey].visible,
      maxZoom: 30
    }),

    new WeatherLayers.GridLayer({
      id: 'wind-barbs',
      image: state[LAYERS.WIND_BARBS as LayerKey].data,
      bounds: OPTIONS.WIND_MAP_BOUNDS,
      imageUnscale: OPTIONS.IMAGE_UNSCALE,
      density: 0,
      iconSize: 50,
      imageType: 'VECTOR',
      color: [255, 255, 255, 200], // [r, g, b, [a]?]
      extensions: [new ClipExtension()],
      style: WeatherLayers.GridStyle.WIND_BARB,
      clipBounds: OPTIONS.CLIP_BOUNDS,
      visible: state[LAYERS.WIND_BARBS as LayerKey].visible
    }),

    new WeatherLayers.ParticleLayer({
      id: 'particle',
      // data properties
      image: state[LAYERS.WIND as LayerKey].data,
      imageType: 'VECTOR', // "SCALAR" | "VECTOR"
      imageUnscale: OPTIONS.IMAGE_UNSCALE,
      bounds: OPTIONS.WIND_MAP_BOUNDS,
      // style properties
      visible: state[LAYERS.WIND as LayerKey].visible,
      numParticles: 5000,
      maxAge: 25,
      speedFactor: 10,
      width: 2,
      opacity: 0.15,
      animate: true,
      extensions: [new ClipExtension()],
      clipBounds: OPTIONS.CLIP_BOUNDS,
      getPolygonOffset: () => [0, -1000],
      beforeId: OPTIONS.BASEMAP_VECTOR_LAYER_BEFORE_ID
    })
  ]

  const handleMapLoad: MapCallbacks['onLoad'] = (e) => {
    const mapInstance = e.target

    legendControl = new WeatherLayers.LegendControl({
      title: 'Wind speed',
      unitFormat: {
        unit: 'knots'
      },
      palette: OPTIONS.WIND_SPEED_PALETTE as Palette
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

    // OPTIONS.updateBasemapVectorStyle(e.target)
  }

  const handleHover: DeckProps['onHover'] = (e) => {
    tooltipControl && tooltipControl.updatePickingInfo(e)
  }

  const handleLoad = async () => {
    try {
      const [
        windData,
        windDirectionHeatmapData,
        windHeatmapData
      ] = await Promise.all([
        handleImageDataLoad(OPTIONS.WINDMAP_URL),
        handleImageDataLoad(OPTIONS.WIND_DIRECTION_HEATMAP_URL),
        handleImageDataLoad(OPTIONS.WIND_HEATMAP_URL)
      ])

      setState(prevState => ({
        ...prevState,
        [LAYERS.WIND]: {
          ...prevState[LAYERS.WIND as LayerKey],
          data: windData
        },
        [LAYERS.WIND_DIRECTION_HEATMAP]: {
          ...prevState[LAYERS.WIND_DIRECTION_HEATMAP as LayerKey],
          data: windDirectionHeatmapData
        },
        [LAYERS.WIND_HEATMAP]: {
          ...prevState[LAYERS.WIND_HEATMAP as LayerKey],
          data: windHeatmapData
        },
        [LAYERS.WIND_BARBS]: {
          ...prevState[LAYERS.WIND_BARBS as LayerKey],
          data: windData
        }
      }))
    } catch (e) {
      console.error(e)
    }
  }

  React.useEffect(() => {
    handleLoad()
  }, [])

  return (
    <>
      <div className='absolute top-[12px] right-[12px] z-10'>
        <LayersMenu state={state} setState={setState} />
      </div>

      <Map
        onLoad={handleMapLoad}
        style={OPTIONS.MAP_STYLE}
        mapboxAccessToken={OPTIONS.MAPBOX_ACCESS_TOKEN}
        mapStyle={OPTIONS.BASEMAP_VECTOR_STYLE_URL}
        initialViewState={OPTIONS.INITIAL_VIEW_STATE}
      >
        <DeckGLOverlay<typeof OPTIONS.MAP_VIEW>
          // interleaved
          views={OPTIONS.MAP_VIEW}
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

export default Mapbox
