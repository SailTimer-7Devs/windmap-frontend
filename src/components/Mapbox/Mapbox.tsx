import type { ReactElement } from 'react'
import type {
  GeolocateControlInstance,
  GeolocateResultEvent,
  MapCallbacks,
  MapRef
} from 'react-map-gl/mapbox'
import type { DeckProps, PickingInfo } from 'deck.gl'
import type { MapboxOverlay } from '@deck.gl/mapbox'
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
import { WEATHER_WNI_LAYER_KEYS, HIDE_TIMELINE_CONTROL_FOR_LAYERS } from 'constants/layer/weather_wni'
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
import { convertMetersPerSecondsToKnots } from 'lib/units'
import {
  formatRasterPoint,
  getCircularDirectionDifference,
  getSpeedDifference
} from 'lib/wind'
import type { WindPointReading } from 'lib/wind'
import { getDateTimeByLayerName } from 'lib/timeline'
import { setMetaData } from 'lib/meta'
import { isMobile } from 'lib/device'

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

type WindPopoverInfo = {
  kind: 'wind'
  source: 'center' | 'tap'
  x: number
  y: number
  grib: WindPointReading
  crowdsourced?: WindPointReading
}

type SimplePopoverInfo = {
  kind: 'simple'
  source: 'tap'
  x: number
  y: number
  reading: WindPointReading
}

type PopoverInfo = WindPopoverInfo | SimplePopoverInfo | null

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
  const [popoverInfo, setPopoverInfo] = React.useState<PopoverInfo>(null)
  const [zoom, setZoom] = React.useState(BASE.INITIAL_VIEW_STATE.zoom)

  const storageLayerValue = { name: layerName, list: visibleList }

  const {
    value: storageLayer,
    reset,
    toggle
  } = useLocalStorageLayer(STORAGE_LAYER_KEY, storageLayerValue)

  const { layerList, layerMenu } = useLayerData(storageLayer.name, timeline.index, zoom)
  const { getTimelinePreload } = useTimelinePreload(storageLayer.name, datetimes)

  const isWniWindLayer = storageLayer.list.includes(WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_WIND_UV)
  const isOceanCurrentLayer = storageLayer.list.includes(WEATHER_WNI_LAYER_KEYS.WEATHER_WNI_OCEAN_CURRENT_UV)
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
  const overlayRef = React.useRef<MapboxOverlay | null>(null)
  const popoverRef = React.useRef<HTMLDivElement>(null)
  const [popoverPos, setPopoverPos] = React.useState<{ left: number, top: number } | null>(null)

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
    setIsMapReady(true)

    if (geolocateControlRef.current) {
      geolocateControlRef.current.trigger()
    }
  }

  const handlePick: DeckProps['onHover'] & DeckProps['onClick'] = (e: DeckGLOverlayHoverEventProps) => {
    const raster = e.raster
    if (!tooltipControlRef.current || !raster) return

    let convertedValue = raster.value

    if (isWindLayer || isWniWindLayer || isOceanCurrentLayer) {
      convertedValue = convertMetersPerSecondsToKnots(raster.value)
    }

    setUnit(UNIT_FORMAT[e.layer?.id as LayerKey] || '')
    tooltipControlRef.current.updatePickingInfo({
      ...e,
      raster: {
        ...raster,
        value: convertedValue
      }
    })
  }

  const pickWindDataAt = React.useCallback((x: number, y: number): {
    grib: WindPointReading
    crowdsourced?: WindPointReading
  } | null => {
    if (!overlayRef.current) return null

    const convertToKnots = isWindLayer || isWniWindLayer || isOceanCurrentLayer

    const gribInfo = overlayRef.current.pickObject({
      x,
      y,
      layerIds: [WIND_LAYER_KEYS.WIND_TOOLTIP]
    }) as DeckGLOverlayHoverEventProps | null

    if (!gribInfo?.raster) return null

    const crowdInfo = overlayRef.current.pickObject({
      x,
      y,
      layerIds: [WIND_LAYER_KEYS.WIND_CROWDSOURCED_TOOLTIP]
    }) as DeckGLOverlayHoverEventProps | null

    return {
      grib: formatRasterPoint(
        gribInfo.raster,
        UNIT_FORMAT[WIND_LAYER_KEYS.WIND_TOOLTIP as LayerKey] || '',
        convertToKnots
      ),
      crowdsourced: crowdInfo?.raster
        ? formatRasterPoint(
          crowdInfo.raster,
          UNIT_FORMAT[WIND_LAYER_KEYS.WIND_CROWDSOURCED_TOOLTIP as LayerKey] || '',
          convertToKnots
        )
        : undefined
    }
  }, [isWindLayer, isWniWindLayer, isOceanCurrentLayer])

  const handleMobileClick = (e: DeckGLOverlayHoverEventProps) => {
    const x = e.x || 0
    const y = e.y || 0

    if (isWindLayer) {
      const reading = pickWindDataAt(x, y)
      if (!reading) return

      setPopoverInfo({ kind: 'wind', source: 'tap', x, y, ...reading })
      return
    }

    if (!e.raster) return

    setPopoverInfo({
      kind: 'simple',
      source: 'tap',
      x,
      y,
      reading: formatRasterPoint(
        e.raster,
        UNIT_FORMAT[e.layer?.id as LayerKey] || '',
        isWindLayer || isWniWindLayer || isOceanCurrentLayer
      )
    })
  }

  const updateCenterPopover = React.useCallback(() => {
    if (!isWindLayer || !isMobile || !mapRef.current) return

    setPopoverInfo(prev => {
      if (prev?.source === 'tap') return prev

      const container = mapRef.current!.getContainer()
      const x = container.clientWidth / 2
      const y = container.clientHeight / 2
      const reading = pickWindDataAt(x, y)

      return reading ? { kind: 'wind', source: 'center', x, y, ...reading } : null
    })
  }, [isWindLayer, pickWindDataAt])

  React.useEffect(() => {
    if (isMapReady) updateCenterPopover()
  }, [isMapReady, updateCenterPopover])

  /* Keep a tapped popover fully inside the map bounds so no line is clipped
     off an edge. Center-anchored popovers are already safely positioned. */
  React.useLayoutEffect(() => {
    if (popoverInfo?.source !== 'tap') {
      setPopoverPos(null)
      return
    }

    const element = popoverRef.current
    const container = mapRef.current?.getContainer()
    if (!element || !container) return

    const margin = 8
    const { width, height } = element.getBoundingClientRect()
    const maxLeft = container.clientWidth - width - margin
    const maxTop = container.clientHeight - height - margin

    let top = popoverInfo.y - height - 12
    if (top < margin) top = popoverInfo.y + 12

    setPopoverPos({
      left: Math.max(margin, Math.min(popoverInfo.x - width / 2, maxLeft)),
      top: Math.max(margin, Math.min(top, maxTop))
    })
  }, [popoverInfo])

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

  const isWindHeatMapLayer = React.useMemo(() => {
    return storageLayer.list.includes(WIND_LAYER_KEYS.WIND_HEATMAP)
  }, [storageLayer.list])

  const visibilityTimelineControl = React.useMemo(() => {
    return HIDE_TIMELINE_CONTROL_FOR_LAYERS.every(layer => !storageLayer.list.includes(layer))
  }, [storageLayer.list])

  React.useEffect(() => {
    setMetaData({ isWindLayer })
  }, [isWindLayer])

  const renderWindRow = (reading: WindPointReading, colorClassName: string): ReactElement => (
    <div className={`flex items-center gap-1 whitespace-nowrap ${colorClassName}`}>
      <span>{reading.directionLabel}</span>

      {typeof reading.direction === 'number' && (
        <svg
          width='14'
          height='14'
          viewBox='0 0 24 24'
          style={{
            transform: `rotate(${(reading.direction + 180) % 360}deg)`
          }} //OUTWARD
        >
          <path
            d='M12 2 L12 22 M12 2 L8 6 M12 2 L16 6'
            stroke='currentColor'
            strokeWidth='2'
            fill='none'
          />
        </svg>
      )}

      <span>{Math.round(reading.value)} {reading.unit}</span>
    </div>
  )

  return (
    <>
      <div className='absolute top-[10px] right-[10px] z-10 flex gap-2'>
        <BrandMenu isWindLayer={isWindLayer} />

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
        renderWorldCopies={false}
        onMove={(evt) => setZoom(evt.viewState.zoom)}
        onMoveEnd={isMobile ? updateCenterPopover : undefined}
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
        />

        {visibilityTimelineControl && (
          <TimelineControl
            datetimes={datetimes}
            datetime={timeline.datetime}
            onUpdate={handleTimelineUpdate}
            onPreload={getTimelinePreload}
            fps={2}
          />
        )}

        {hasTooltip && (
          isMobile && popoverInfo
            ? popoverInfo.kind === 'wind'
              ? (
                <div
                  ref={popoverRef}
                  className='absolute z-50 max-w-[90vw] pointer-events-none select-none bg-gray-800 shadow-lg p-2 rounded flex flex-col gap-0.5'
                  style={
                    popoverInfo.source === 'tap'
                      ? popoverPos
                        ? { left: popoverPos.left, top: popoverPos.top }
                        : {
                          left: popoverInfo.x,
                          top: popoverInfo.y,
                          transform: 'translate(-50%, -100%)'
                        }
                      : {
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }
                  }
                >
                  <span className='text-white'>
                    GRIB Forecast - cell 15 x 15 = 225 square nautical miles
                  </span>

                  {renderWindRow(popoverInfo.grib, 'text-white')}

                  {popoverInfo.crowdsourced && (
                    <>
                      <span className='text-purple-400'>
                        Crowdsourced Measurements - cell 20 x 20 meters = 400 square meters/440 square yards
                      </span>

                      {renderWindRow(popoverInfo.crowdsourced, 'text-purple-400')}

                      <span className='text-red-500'>
                        Forecast Error: Wind Direction{' '}
                        {typeof popoverInfo.grib.direction === 'number' && typeof popoverInfo.crowdsourced.direction === 'number'
                          ? Math.round(getCircularDirectionDifference(popoverInfo.grib.direction, popoverInfo.crowdsourced.direction))
                          : '—'
                        } degrees, Wind Speed {Math.round(getSpeedDifference(popoverInfo.grib.value, popoverInfo.crowdsourced.value))} knots.
                      </span>
                    </>
                  )}
                </div>
              )
              : (
                <div
                  className='absolute z-50 bg-white shadow-lg p-1 rounded flex items-center gap-1'
                  style={{
                    left: popoverInfo.x,
                    top: popoverInfo.y,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <span>
                    {popoverInfo.reading.directionLabel}
                  </span>

                  {typeof popoverInfo.reading.direction === 'number' && (
                    <svg
                      width='14'
                      height='14'
                      viewBox='0 0 24 24'
                      style={{
                        transform: `rotate(${(popoverInfo.reading.direction + 180) % 360}deg)`
                      }} //OUTWARD
                    >
                      <path
                        d='M12 2 L12 22 M12 2 L8 6 M12 2 L16 6'
                        stroke='black'
                        strokeWidth='2'
                        fill='none'
                      />
                    </svg>
                  )}

                  <span>
                    {isOceanCurrentLayer
                      ? popoverInfo.reading.value.toFixed(1)
                      : Math.round(popoverInfo.reading.value)
                    } {popoverInfo.reading.unit}
                  </span>
                </div>
              )
            : (
              <TooltipControl
                mapInstance={mapRef}
                ref={tooltipControlRef}
                unitFormat={{
                  unit,
                  ...(isOceanCurrentLayer
                    ? { decimals: 1 }
                    : {}
                  )
                }}
                directionFormat={WeatherLayers.DirectionFormat.CARDINAL3}
              />
            )
        )}

        {isWindHeatMapLayer && (
          <LegendControl
            title='Wind speed'
            unitFormat={{ unit: 'knots' }}
            palette={BASE.WIND_SPEED_PALETTE_1_40 as Palette}
          />
        )}

        {!isWindLayer && <WniLogo />}

        <DeckGLOverlay
          ref={overlayRef}
          interleaved
          views={BASE.MAP_VIEW}
          controller={true}
          onHover={isMobile ? undefined : handlePick}
          onClick={isMobile ? handleMobileClick : handlePick}
          layers={visibleLayers}
        />
      </Map>
    </>
  )
}

export default Mapbox
