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
import { WIND_LAYER_KEYS } from 'constants/layer/wind'
import { WEATHER_WNI_LAYER_KEYS } from 'constants/layer/weather_wni'
import { UNIT_FORMAT } from 'constants/layer/units'

import useLayerData from 'hooks/useLayerData'
import useLocalStorageLayer from 'hooks/useLocalStorageLayer'
import useTimelinePreload from 'hooks/useTimelinePreload'
import useUrlChange from 'hooks/useUrlChange'

import type { LayerKey } from 'types'

import { getUrlParams } from 'lib/url'
import {
  getVisibleLayerList,
  isWind,
  isWeatherWni
} from 'lib/layer'
import {
  convertMetersPerSecondsToKnots,
  convertKelvinToCelsius
} from 'lib/units'
import { getDateTimeByLayerName } from 'lib/timeline'
import { setMetaData } from 'lib/meta'

import BrandMenu from 'components/Mapbox/BrandMenu'
import DeckGLOverlay from './DeckGLOverlay'
import LayerListMenu from './LayerListMenu'
import LegendControl from './LegendControl'
import TimelineControl from './TimelineControl'
import TooltipControl from './TooltipControl'
import WniLogo from './WniLogo'

interface DeckGLOverlayHoverEventProps extends PickingInfo {
  raster?: RasterPointProperties
}

function Mapbox(): ReactElement {
  const layerName = getUrlParams()
  const visibleList = getVisibleLayerList(layerName)
  const isWindLayer = isWind(layerName)
  const isWeatherWniLayer = isWeatherWni(layerName)

  const datetimes = getDateTimeByLayerName(layerName)

  const [isMapReady, setIsMapReady] = React.useState(false)
  const [timeline, setTimeline] = React.useState({
    index: 0,
    datetime: datetimes[0]
  })
  const [unit, setUnit] = React.useState<string>('')
  const storageLayerValue = { name: layerName, list: visibleList }

  const {
    value: storageLayer,
    reset,
    toggle
  } = useLocalStorageLayer(STORAGE_LAYER_KEY, storageLayerValue)

  console.log({ unit, storageLayer })
  const { layerList, layerMenu } = useLayerData(storageLayer.name, timeline.index)
  const { getTimelinePreload } = useTimelinePreload(storageLayer.name, datetimes)
  console.log({ layerList })
  const isWindSpeadLayer = storageLayer.list.includes(WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WIND_UV)
  const isTemperatureLayer = storageLayer.list.includes(WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_TMP1000HPA)
  const hasTooltip = isWindLayer || isWeatherWniLayer

  const handleTimelineUpdate = React.useCallback((datetime: string) => {
    const timelineIndex = datetimes.findIndex(dt => dt === datetime)

    setTimeline({
      index: timelineIndex,
      datetime
    })
  }, [datetimes])

  const mapRef = React.useRef<MapRef>(null)
  const geolocateControlRef = React.useRef<GeolocateControlInstance>(null)
  const tooltipControlRef = React.useRef<WeatherLayers.TooltipControl | null>(null)

  useUrlChange((url) => {
    const urlParams = new URL(url)
    const currentLayerName = urlParams.searchParams.get(STORAGE_LAYER_KEY) || layerName

    const visibleList = getVisibleLayerList(currentLayerName)
    console.log({ currentLayerName, visibleList })
    if (currentLayerName !== storageLayer.name) {
      reset({
        name: currentLayerName,
        list: visibleList
      })
    }
  })

  const handleMapLoad: MapCallbacks['onLoad'] = () => {
    setIsMapReady(true)

    if (geolocateControlRef.current) {
      geolocateControlRef.current.trigger()
    }
  }

  const handleHover: DeckProps['onHover'] = (e: DeckGLOverlayHoverEventProps) => {
    const raster = e.raster
    console.log({ e })
    if (!tooltipControlRef.current || !raster) return

    let convertedValue = raster.value

    if (isWindLayer || isWindSpeadLayer) {
      convertedValue = convertMetersPerSecondsToKnots(raster.value)
    } else if (isTemperatureLayer) {
      convertedValue = convertKelvinToCelsius(raster.value)
    }
    console.log({ layer: e.layer?.id, unit: UNIT_FORMAT[e.layer?.id as LayerKey] })
    setUnit(UNIT_FORMAT[e.layer?.id as LayerKey])
    tooltipControlRef.current.updatePickingInfo({
      ...e,
      raster: {
        ...raster,
        value: convertedValue
      }
    })
  }

  const handleGeolocate = (position: GeolocateResultEvent) => {
    if (mapRef.current && position?.coords) {
      const { longitude, latitude } = position.coords

      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        speed: 1.2
      })
    }
  }

  /* prevent issue with WebGL context is having problems 
     with buffer reinitialization on show\hide layers */
  const visibleLayers = React.useMemo(() => {
    return layerList
      .filter(({ id }) => storageLayer.list.some(layer => id.includes(layer)))
      .map(layerItem => {
        const props = { ...layerItem.props, visible: true }
        return layerItem.clone(props)
      })
  }, [layerList, storageLayer.list])

  console.log({ visibleLayers })

  const isWindHeatMapLayer = React.useMemo(() => {
    return storageLayer.list.includes(WIND_LAYER_KEYS.WIND_HEATMAP)
  }, [storageLayer.list])

  React.useEffect(() => {
    setMetaData({ isWindLayer })
  }, [isWindLayer])

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

      {!isMapReady && (
        <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/30 z-20'>
          <p className='text-[2vw] text-white text-shadow-lg'>Map is loading...</p>
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
          position='bottom-right'
          style={{ borderRadius: '4px' }}
        />

        <TimelineControl
          datetimes={datetimes}
          datetime={timeline.datetime}
          onUpdate={handleTimelineUpdate}
          onPreload={getTimelinePreload}
          fps={2}
        />

        {hasTooltip && (
          <TooltipControl
            mapInstance={mapRef}
            ref={tooltipControlRef}
            unitFormat={{ unit }}
            directionFormat={WeatherLayers.DirectionFormat.CARDINAL3}
          />
        )}

        {isWindHeatMapLayer && (
          <LegendControl
            title='Wind speed'
            unitFormat={{ unit: 'knots' }}
            palette={BASE.WIND_SPEED_PALETTE as Palette}
          />
        )}

        {!isWindLayer && <WniLogo />}

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
