import type { ReactElement } from 'react'
import type {
  GeolocateControlInstance,
  GeolocateResultEvent,
  MapCallbacks,
  MapRef
} from 'react-map-gl/mapbox'
import type { DeckProps, PickingInfo } from 'deck.gl'
import type { Palette } from 'cpt2js'

import type { RasterPointProperties } from 'weatherlayers-gl'

import React from 'react'

import {
  Map,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl
} from 'react-map-gl/mapbox'

import 'mapbox-gl/dist/mapbox-gl.css'

import * as WeatherLayers from 'weatherlayers-gl'

import * as BASE from 'constants/basemap'
import { STORAGE_LAYER_KEY } from 'constants/localStorage'

import useLayerData from 'hooks/useLayerData'
import useLocalStorageLayer from 'hooks/useLocalStorageLayer'
import useUrlChange from 'hooks/useUrlChange'

import getUrlParams from 'lib/url'
import {
  getVisibleLayerList,
  isWind
} from 'lib/layer'
import { convertMetersPerSecondsToKnots } from 'lib/units'

import BrandMenu from 'components/Mapbox/BrandMenu'
import DeckGLOverlay from './DeckGLOverlay'
import LayerListMenu from './LayerListMenu'
import LegendControl from './LegendControl'
import TooltipControl from './TooltipControl'
import WniLogo from './WniLogo'
interface DeckGLOverlayHoverEventProps extends PickingInfo {
  raster?: RasterPointProperties
}

function Mapbox(): ReactElement {
  const layerName = getUrlParams()
  const visibleList = getVisibleLayerList(layerName)
  const isWindLayer = isWind(layerName)

  const storageLayerValue = { name: layerName, list: visibleList }

  const { value: storageLayer, reset, toggle } = useLocalStorageLayer(STORAGE_LAYER_KEY, storageLayerValue)
  const { layerList, layerMenu, layerLoading } = useLayerData(storageLayer.name)

  const mapRef = React.useRef<MapRef>(null)
  const geolocateControlRef = React.useRef<GeolocateControlInstance>(null)
  const tooltipControlRef = React.useRef<WeatherLayers.TooltipControl | null>(null)

  useUrlChange((url) => {
    const urlParams = new URL(url)
    const currentLayerName = urlParams.searchParams.get(STORAGE_LAYER_KEY) || layerName

    const visibleList = getVisibleLayerList(currentLayerName)

    if (currentLayerName !== storageLayer.name) {
      reset({
        name: currentLayerName,
        list: visibleList
      })
    }
  })

  const handleMapLoad: MapCallbacks['onLoad'] = () => {
    if (geolocateControlRef.current) {
      geolocateControlRef.current.trigger()
    }
  }

  const handleHover: DeckProps['onHover'] = (e: DeckGLOverlayHoverEventProps) => {
    const raster = e.raster

    if (!tooltipControlRef.current || !raster) return

    const convertedValue = isWindLayer
      ? convertMetersPerSecondsToKnots(raster.value)
      : raster.value

    tooltipControlRef.current.updatePickingInfo({
      ...e,
      raster: {
        ...raster,
        value: convertedValue
      }
    })
  }

  const handleGeolocate = (position: GeolocateResultEvent) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [
          position.coords.longitude,
          position.coords.latitude
        ],
        zoom: 15,
        speed: 1.2
      })
    }
  }

  /* prevent issue with WebGL context is having problems 
     with buffer reinitialization on show\hide layers */
  const visibleLayers = React.useMemo(() => {
    return layerList.map(layerItem => {
      const props = { ...layerItem.props }

      props.visible = storageLayer.list.includes(layerItem.id)
      return layerItem.clone(props)
    })
  }, [layerList, storageLayer.list])

  return (
    <>
      <div className='absolute top-[10px] right-[10px] z-10 flex gap-2'>
        <BrandMenu />

        <LayerListMenu
          menuList={layerMenu}
          layersId={storageLayer.list}
          toggle={toggle}
        />
      </div>

      {layerLoading && (
        <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/30 z-20'>
          <p className='text-[2vw] text-white text-shadow-lg'>Loading layers...</p>
        </div>
      )}

      <Map
        ref={mapRef}
        onLoad={handleMapLoad}
        style={BASE.MAP_STYLE}
        mapboxAccessToken={BASE.MAPBOX_ACCESS_TOKEN}
        mapStyle={BASE.BASEMAP_VECTOR_STYLE_URL}
        initialViewState={BASE.INITIAL_VIEW_STATE}
      >
        <GeolocateControl
          {...BASE.MAP_VIEW_CONTROLS_PROPS}
          ref={geolocateControlRef}
          onGeolocate={handleGeolocate}
        />

        <FullscreenControl {...BASE.MAP_VIEW_CONTROLS_PROPS} />
        <NavigationControl {...BASE.MAP_VIEW_CONTROLS_PROPS} />

        <ScaleControl
          unit='nautical'
          style={{ borderRadius: '4px' }}
        />

        {isWindLayer && (
          <TooltipControl
            mapInstance={mapRef}
            ref={tooltipControlRef}
            unitFormat={{ unit: 'knots' }}
            directionFormat={WeatherLayers.DirectionFormat.CARDINAL3}
          />
        )}

        {isWindLayer
          ? (
            /* Will be added different settings for WNI layers in future */
            <LegendControl
              title='Wind speed'
              unitFormat={{ unit: 'knots' }}
              palette={BASE.WIND_SPEED_PALETTE as Palette}
            />
          )
          : (<WniLogo />)
        }

        <DeckGLOverlay
          interleaved
          views={BASE.MAP_VIEW}
          controller={true}
          onHover={handleHover}
          layers={visibleLayers}
        />
      </Map>
    </>
  )
}

export default Mapbox
