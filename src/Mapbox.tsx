import type { ReactElement } from 'react'
import type { GeolocateControlInstance } from 'react-map-gl/mapbox'
import type { LayersState, LayerKey } from 'types'
import type { DeckProps } from 'deck.gl'
import type { MapboxOverlayProps } from '@deck.gl/mapbox'
import type { View } from '@deck.gl/core'
import type { Palette } from 'cpt2js'
import type { MapCallbacks } from 'react-map-gl/mapbox'

import React from 'react'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ClipExtension } from '@deck.gl/extensions'

import {
  Map,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  useControl
} from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

import * as WeatherLayers from 'weatherlayers-gl'

import * as BASE from 'constants/basemap'
import * as KEYS from 'constants/localStorage'

import {
  INITIAL_LAYERS_STATE,
  LAYER_KEYS,
  VISIBLE_LAYERS
} from 'constants/layers'

import { useLocalStorage } from 'hooks/useLocalStorage'

import { handleImageDataLoad } from 'lib/images'

import LayersMenu from './LayersMenu'

let legendControl
let tooltipControl: WeatherLayers.TooltipControl

function Mapbox(): ReactElement {
  const [layersState, setLayersState] = React.useState<LayersState>(INITIAL_LAYERS_STATE)
  const { value: layersId, toggle } = useLocalStorage(KEYS.LAYERS, VISIBLE_LAYERS)

  const geolocateControlRef = React.useRef<GeolocateControlInstance>(null)

  const layers = [
    new WeatherLayers.RasterLayer({
      id: LAYER_KEYS.WIND_HEATMAP,
      image: layersState[LAYER_KEYS.WIND_HEATMAP as LayerKey],
      imageType: 'SCALAR',
      bounds: BASE.WIND_MAP_BOUNDS,
      palette: BASE.WIND_SPEED_PALETTE as Palette,
      opacity: 0.55,
      pickable: true,
      imageUnscale: [0, 255],
      extensions: [new ClipExtension()],
      clipBounds: BASE.CLIP_BOUNDS,
      beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
    }),

    new WeatherLayers.ContourLayer({
      id: LAYER_KEYS.WIND_DIRECTION_HEATMAP,
      image: layersState[LAYER_KEYS.WIND_DIRECTION_HEATMAP as LayerKey],
      bounds: BASE.WIND_MAP_BOUNDS,
      imageUnscale: [0, 22.5],
      imageInterpolation: 'CUBIC',
      imageSmoothing: 10,
      interval: 1,
      majorInterval: 0,
      width: 1,
      maxZoom: 30,
      color: [255, 255, 255, 170],
      extensions: [new ClipExtension()],
      clipBounds: BASE.CLIP_BOUNDS
    }),

    new WeatherLayers.GridLayer({
      id: LAYER_KEYS.WIND_BARBS,
      image: layersState[LAYER_KEYS.WIND_BARBS as LayerKey],
      bounds: BASE.WIND_MAP_BOUNDS,
      imageUnscale: BASE.IMAGE_UNSCALE,
      density: 0,
      iconSize: 50,
      imageType: 'VECTOR',
      color: [255, 255, 255, 200],
      extensions: [new ClipExtension()],
      style: WeatherLayers.GridStyle.WIND_BARB,
      clipBounds: BASE.CLIP_BOUNDS
    }),

    new WeatherLayers.ParticleLayer({
      id: LAYER_KEYS.WIND,
      image: layersState[LAYER_KEYS.WIND as LayerKey],
      imageType: 'VECTOR',
      imageUnscale: BASE.IMAGE_UNSCALE,
      bounds: BASE.WIND_MAP_BOUNDS,
      numParticles: 5000,
      maxAge: 25,
      speedFactor: 10,
      width: 2,
      opacity: 0.15,
      animate: true,
      extensions: [new ClipExtension()],
      clipBounds: BASE.CLIP_BOUNDS,
      getPolygonOffset: () => [0, -1000],
      beforeId: BASE.BASEMAP_VECTOR_LAYER_BEFORE_ID
    })
  ]

  const handleMapLoad: MapCallbacks['onLoad'] = (e) => {
    const mapInstance = e.target

    legendControl = new WeatherLayers.LegendControl({
      title: 'Wind speed',
      unitFormat: {
        unit: 'knots'
      },
      palette: BASE.WIND_SPEED_PALETTE as Palette
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

    // CONST.updateBasemapVectorStyle(e.target)
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
        handleImageDataLoad(BASE.WINDMAP_URL),
        handleImageDataLoad(BASE.WIND_DIRECTION_HEATMAP_URL),
        handleImageDataLoad(BASE.WIND_HEATMAP_URL)
      ])

      setLayersState({
        [LAYER_KEYS.WIND]: windData,
        [LAYER_KEYS.WIND_DIRECTION_HEATMAP]: windDirectionHeatmapData,
        [LAYER_KEYS.WIND_HEATMAP]: windHeatmapData,
        [LAYER_KEYS.WIND_BARBS]: windData
      })

      if (geolocateControlRef.current) {
        geolocateControlRef.current.trigger()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const visibleLayers = layers.filter(item => layersId.includes(item.id))

  React.useEffect(() => {
    handleLoad()
  }, [])

  return (
    <>
      <div className='absolute top-[12px] right-[12px] z-10'>
        <LayersMenu
          layersId={layersId}
          toggle={toggle}
        />
      </div>

      <Map
        onLoad={handleMapLoad}
        style={BASE.MAP_STYLE}
        mapboxAccessToken={BASE.MAPBOX_ACCESS_TOKEN}
        mapStyle={BASE.BASEMAP_VECTOR_STYLE_URL}
        initialViewState={BASE.INITIAL_VIEW_STATE}
      >
        <GeolocateControl
          {...BASE.MAP_VIEW_CONTROLS_PROPS}
          ref={geolocateControlRef}
        />

        <FullscreenControl {...BASE.MAP_VIEW_CONTROLS_PROPS} />
        <NavigationControl {...BASE.MAP_VIEW_CONTROLS_PROPS} />

        <ScaleControl
          unit='nautical'
          style={{ borderRadius: '4px' }}
        />

        <DeckGLOverlay<typeof BASE.MAP_VIEW>
          // interleaved
          views={BASE.MAP_VIEW}
          controller={true}
          onHover={handleHover}
          layers={visibleLayers}
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
