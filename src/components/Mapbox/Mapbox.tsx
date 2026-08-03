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
import useHourlyWindForecast from 'hooks/useHourlyWindForecast'
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
  getSpeedDifference,
  isCrowdsourcedNoData
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
import HourlyWindForecast from './HourlyWindForecast'

interface DeckGLOverlayHoverEventProps extends PickingInfo {
  raster?: RasterPointProperties
}

type WindPopoverInfo = {
  kind: 'wind'
  source: 'center' | 'tap'
  x: number
  y: number
  longitude?: number
  latitude?: number
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
  const [userCoordinates, setUserCoordinates] = React.useState<{
    longitude: number
    latitude: number
  } | null>(null)
  const [locationError, setLocationError] = React.useState<string | null>(
    isWindLayer && isMobile
      ? 'Allow location access to see the hourly wind forecast.'
      : null
  )
  const [showLocationHelp, setShowLocationHelp] = React.useState(false)
  const [isHourlyForecastOpen, setIsHourlyForecastOpen] = React.useState(
    isWindLayer && isMobile
  )

  const storageLayerValue = { name: layerName, list: visibleList }

  const {
    value: storageLayer,
    reset,
    toggle
  } = useLocalStorageLayer(STORAGE_LAYER_KEY, storageLayerValue)

  const { layerList, layerMenu } = useLayerData(storageLayer.name, timeline.index, zoom)
  const { getTimelinePreload } = useTimelinePreload(storageLayer.name, datetimes)
  const hourlyWindForecast = useHourlyWindForecast(
    userCoordinates,
    datetimes,
    isWindLayer && isMobile && isHourlyForecastOpen
  )

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
  const popoverInfoRef = React.useRef<PopoverInfo>(null)

  /* Anchor point (top-center of the fixed lower-right wind popover box,
     relative to the map container) that the pointer line is drawn to. Recomputed
     whenever the box's content/size changes since a 2-line vs 5-line popover
     shifts where that corner sits. */
  const [popoverAnchor, setPopoverAnchor] = React.useState<{ x: number, y: number } | null>(null)

  /* Layout for the fixed wind popover box, computed against the lower-left
     mapbox controls stack (timeline + legend) so the two never collide and
     line up cleanly. On wide/landscape screens (iPad) there's room to sit
     beside the controls, top edge aligned to theirs. On narrow phone screens
     (iPhone), where the controls stack reflows taller and wider, there's no
     horizontal room, so the box instead sits stacked directly above the
     controls with its left edge aligned to theirs. */
  const [popoverLayout, setPopoverLayout] = React.useState<{
    mode: 'side' | 'stacked'
    top?: number
    left?: number
    bottom?: number
    width: number
  } | null>(null)

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

    const grib = formatRasterPoint(
      gribInfo.raster,
      UNIT_FORMAT[WIND_LAYER_KEYS.WIND_TOOLTIP as LayerKey] || '',
      convertToKnots
    )
    const crowdsourced = crowdInfo?.raster
      ? formatRasterPoint(
        crowdInfo.raster,
        UNIT_FORMAT[WIND_LAYER_KEYS.WIND_CROWDSOURCED_TOOLTIP as LayerKey] || '',
        convertToKnots
      )
      : undefined

    return {
      grib,
      crowdsourced: crowdsourced && !isCrowdsourcedNoData(crowdsourced)
        ? crowdsourced
        : undefined
    }
  }, [isWindLayer, isWniWindLayer, isOceanCurrentLayer])

  const handleMobileClick = (e: DeckGLOverlayHoverEventProps) => {
    const x = e.x || 0
    const y = e.y || 0

    if (isWindLayer) {
      const reading = pickWindDataAt(x, y)
      if (!reading) return

      const lngLat = mapRef.current?.unproject([x, y])

      setPopoverInfo({
        kind: 'wind',
        source: 'tap',
        x,
        y,
        longitude: lngLat?.lng,
        latitude: lngLat?.lat,
        ...reading
      })
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

  React.useEffect(() => {
    popoverInfoRef.current = popoverInfo
  }, [popoverInfo])

  /* Hourly forecast strip uses the user's location rather than a tapped point
     (client preference), so request it independently of the GeolocateControl
     button - this must not touch popoverInfo/popoverAnchor in any way. */
  const requestUserLocation = React.useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Location is not available in this browser.')
      setShowLocationHelp(true)
      return
    }

    // Keep the browser permission request inside this explicit user action.
    // Mobile Safari may suppress prompts initiated automatically during load.
    setLocationError(null)
    setShowLocationHelp(false)

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserCoordinates({
          longitude: coords.longitude,
          latitude: coords.latitude
        })
        setLocationError(null)
        setShowLocationHelp(false)
      },
      (error) => {
        const permissionDenied = error.code === error.PERMISSION_DENIED
        setLocationError(permissionDenied
          ? 'Location access is blocked for this website.'
          : 'Your location could not be retrieved. Please try again.')
        setShowLocationHelp(permissionDenied)
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }, [])

  const updateCenterPopover = React.useCallback((): boolean => {
    if (!isWindLayer || !isMobile || !mapRef.current) return false

    /* Once either the initial or tapped target has a geographic anchor,
       preserve it instead of resetting the target to the screen center. */
    if (
      popoverInfoRef.current?.kind === 'wind'
      && typeof popoverInfoRef.current.longitude === 'number'
      && typeof popoverInfoRef.current.latitude === 'number'
    ) return true

    const container = mapRef.current.getContainer()
    const x = container.clientWidth / 2
    const y = container.clientHeight / 2
    const reading = pickWindDataAt(x, y)
    const lngLat = mapRef.current.unproject([x, y])

    setPopoverInfo(prev => {
      if (
        prev?.kind === 'wind'
        && typeof prev.longitude === 'number'
        && typeof prev.latitude === 'number'
      ) return prev

      return reading
        ? {
            kind: 'wind',
            source: 'center',
            x,
            y,
            longitude: lngLat.lng,
            latitude: lngLat.lat,
            ...reading
          }
        : null
    })

    return Boolean(reading)
  }, [isWindLayer, pickWindDataAt])

  /* Show the default centered popover as soon as the map is ready. The deck.gl
     overlay and its raster image data may not be available the instant the map
     fires `load`, so a single center pick can come back empty; retry briefly
     until it succeeds (or a tap takes over) so the popover reliably appears on
     first load without needing a pan. */
  React.useEffect(() => {
    if (!isMapReady || !isWindLayer || !isMobile) return

    let timeoutId = 0
    const startedAt = Date.now()
    const RETRY_MS = 150
    const TIMEOUT_MS = 4000

    const attempt = () => {
      if (updateCenterPopover()) return

      if (Date.now() - startedAt < TIMEOUT_MS) {
        timeoutId = window.setTimeout(attempt, RETRY_MS)
      }
    }

    attempt()

    return () => window.clearTimeout(timeoutId)
  }, [isMapReady, isWindLayer, updateCenterPopover])

  /* The wind popover box sits fixed in the lower-right corner; track its
     top-left corner (the point nearest the map) so the pointer line always
     connects cleanly to it, including when its size changes. */
  React.useLayoutEffect(() => {
    const element = popoverRef.current
    const container = mapRef.current?.getContainer()

    if (!element || !container || !popoverInfo || popoverInfo.kind !== 'wind') {
      setPopoverAnchor(null)
      return
    }

    const updateAnchor = () => {
      const containerRect = container.getBoundingClientRect()
      const boxRect = element.getBoundingClientRect()

      setPopoverAnchor({
        x: boxRect.left - containerRect.left + boxRect.width / 2,
        y: boxRect.top - containerRect.top
      })
    }

    updateAnchor()

    const resizeObserver = new ResizeObserver(updateAnchor)
    resizeObserver.observe(element)

    return () => resizeObserver.disconnect()
  }, [popoverInfo, popoverLayout])

  React.useLayoutEffect(() => {
    const container = mapRef.current?.getContainer()
    const controls = document.getElementsByClassName('mapboxgl-ctrl-bottom-left')[0] as HTMLElement | undefined

    if (!isMapReady || !container || !controls) {
      setPopoverLayout(null)
      return
    }

    const MARGIN = 16
    const GAP = 16
    const MAX_WIDTH = 360
    const MIN_SIDE_BY_SIDE_WIDTH = 240

    const updateLayout = () => {
      const containerRect = container.getBoundingClientRect()

      /* The container itself includes an empty helper element (mapbox-gl's
         own `.mapboxgl-ctrl` placeholder) with its own margin, so its own
         bounding box sits a few pixels off from where the visible
         timeline/legend boxes actually start. Measure the union of the
         visible children instead so the alignment matches what's on screen. */
      const visibleRects = [...controls.children]
        .map(el => el.getBoundingClientRect())
        .filter(rect => rect.width > 0 && rect.height > 0)

      if (!visibleRects.length) {
        setPopoverLayout(null)
        return
      }

      const controlsRect = {
        top: Math.min(...visibleRects.map(r => r.top)),
        left: Math.min(...visibleRects.map(r => r.left)),
        right: Math.max(...visibleRects.map(r => r.right))
      }

      const controlsTop = controlsRect.top - containerRect.top
      const controlsLeft = controlsRect.left - containerRect.left
      const controlsRight = controlsRect.right - containerRect.left
      const availableSideWidth = containerRect.width - MARGIN - controlsRight - GAP

      if (availableSideWidth >= MIN_SIDE_BY_SIDE_WIDTH) {
        // iPad/wide: sits beside the controls, top edge aligned to theirs.
        setPopoverLayout({
          mode: 'side',
          top: controlsTop,
          width: Math.min(MAX_WIDTH, availableSideWidth)
        })
      } else {
        // iPhone/narrow: sits above the controls, left edge aligned to theirs.
        setPopoverLayout({
          mode: 'stacked',
          left: controlsLeft,
          bottom: containerRect.height - controlsTop + GAP,
          width: Math.min(MAX_WIDTH, containerRect.width - controlsLeft - MARGIN)
        })
      }
    }

    updateLayout()

    const resizeObserver = new ResizeObserver(updateLayout)
    resizeObserver.observe(controls)
    resizeObserver.observe(container)
    window.addEventListener('resize', updateLayout)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateLayout)
    }
  }, [isMapReady])

  const handleGeolocate = (position: GeolocateResultEvent) => {
    if (mapRef.current && position?.coords) {
      const { longitude, latitude } = position.coords
      setUserCoordinates({ longitude, latitude })
      setLocationError(null)
      setShowLocationHelp(false)

      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        speed: 1.2
      })
    }
  }

  const handleGeolocateError = () => {
    setLocationError('Location access is blocked for this website.')
    setShowLocationHelp(true)
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
    <div className={`flex items-center justify-center gap-1.5 whitespace-nowrap text-[clamp(18px,4.5vw,22px)] leading-none font-bold ${colorClassName}`}>
      <span>{reading.directionLabel}</span>

      {typeof reading.direction === 'number' && (
        <svg
          width='22'
          height='22'
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

  const handleMapMove: MapCallbacks['onMove'] = (evt) => {
    setZoom(evt.viewState.zoom)

    setPopoverInfo(prev => {
      if (
        prev?.kind !== 'wind'
        || typeof prev.longitude !== 'number'
        || typeof prev.latitude !== 'number'
        || !mapRef.current
      ) return prev

      const point = mapRef.current.project([prev.longitude, prev.latitude])

      if (point.x === prev.x && point.y === prev.y) return prev
      return { ...prev, x: point.x, y: point.y }
    })
  }

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
        onMove={handleMapMove}
        onMoveEnd={isMobile ? updateCenterPopover : undefined}
      >
        <GeolocateControl
          {...BASE.MAP_VIEW_CONTROLS_PROPS}
          ref={geolocateControlRef}
          onGeolocate={handleGeolocate}
          onError={handleGeolocateError}
          showAccuracyCircle={false}
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

        {isWindLayer && isMobile && isHourlyForecastOpen && (
          <HourlyWindForecast
            forecasts={hourlyWindForecast.forecasts}
            selectedDatetime={timeline.datetime}
            isLocating={!userCoordinates && !locationError}
            locationError={locationError}
            showLocationHelp={showLocationHelp}
            forecastError={hourlyWindForecast.error}
            onRequestLocation={requestUserLocation}
            onSelect={handleTimelineUpdate}
            onClose={() => setIsHourlyForecastOpen(false)}
          />
        )}

        {hasTooltip && (
          isMobile && popoverInfo
            ? popoverInfo.kind === 'wind'
              ? (
                <>
                  {popoverAnchor && (
                    <svg
                      className='absolute inset-0 z-40 w-full h-full pointer-events-none'
                    >
                      <line
                        x1={popoverInfo.x}
                        y1={popoverInfo.y}
                        x2={popoverAnchor.x}
                        y2={popoverAnchor.y}
                        stroke='rgb(3 7 18 / 0.9)'
                        strokeWidth={5}
                        strokeDasharray='4 4'
                      />
                      <line
                        x1={popoverInfo.x}
                        y1={popoverInfo.y}
                        x2={popoverAnchor.x}
                        y2={popoverAnchor.y}
                        stroke='#7CFF00'
                        strokeWidth={2.5}
                        strokeDasharray='4 4'
                      />
                    </svg>
                  )}

                  <div
                    className='absolute z-40 pointer-events-none drop-shadow-[0_1px_2px_rgb(0_0_0/0.9)]'
                    style={{ left: popoverInfo.x, top: popoverInfo.y, transform: 'translate(-50%, -50%)' }}
                  >
                    <span
                      className='absolute -inset-3 rounded-full border-2 border-[#7CFF00] opacity-70 animate-ping'
                      style={{ animationDuration: '1.6s' }}
                    />
                    <span
                      className='absolute -inset-1.5 rounded-full border-2 border-[#7CFF00] opacity-80 animate-ping'
                      style={{ animationDuration: '1.6s', animationDelay: '0.3s' }}
                    />
                    <span className='relative block w-3 h-3 rounded-full bg-[#7CFF00] ring-2 ring-gray-950' />
                  </div>

                  <div
                    ref={popoverRef}
                    className={`absolute z-50 pointer-events-none select-none shadow-lg p-2 rounded border border-[#7CFF00] flex flex-col gap-1 text-center ${
                      popoverLayout === null ? 'bottom-12 right-4 w-80 max-w-[90vw]' : ''
                    } ${popoverInfo.crowdsourced ? 'bg-gray-800' : 'bg-gray-900'}`}
                    style={popoverLayout ? (
                      popoverLayout.mode === 'side'
                        ? { width: popoverLayout.width, top: popoverLayout.top, right: 16 }
                        : { width: popoverLayout.width, left: popoverLayout.left, bottom: popoverLayout.bottom }
                    ) : undefined}
                  >
                    {popoverInfo.crowdsourced && (
                      <>
                        <span className='text-xs text-[#f501f9] text-balance'>
                          Crowdsourced Measurements - cell .01 x .01 nm
                        </span>

                        {renderWindRow(popoverInfo.crowdsourced, 'text-[#f501f9]')}
                      </>
                    )}

                    <span className='text-xs text-white text-balance'>
                      GRIB Forecast - cell 15 x 15 nm
                    </span>

                    {renderWindRow(popoverInfo.grib, 'text-white')}

                    {popoverInfo.crowdsourced && (
                      <span className='whitespace-nowrap text-[clamp(8px,2.5vw,11px)] leading-tight font-semibold tracking-tight text-[#ff6257]'>
                        Increased Accuracy: Wind Direction{' '}
                        {typeof popoverInfo.grib.direction === 'number' && typeof popoverInfo.crowdsourced.direction === 'number'
                          ? Math.round(getCircularDirectionDifference(popoverInfo.grib.direction, popoverInfo.crowdsourced.direction))
                          : '—'
                        }°, Speed {Math.round(getSpeedDifference(popoverInfo.grib.value, popoverInfo.crowdsourced.value))} knots
                      </span>
                    )}
                  </div>
                </>
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
