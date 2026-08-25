import type { MapRef } from 'react-map-gl/maplibre'
import type { Layer } from 'deck.gl'

import React from 'react'
import Map from 'react-map-gl/maplibre'

import 'maplibre-gl/dist/maplibre-gl.css'

import { getWindLayers, getWindLayersData } from 'constants/layer/wind'

import DeckGLOverlay from './DeckGLOverlay'

export interface SailTimerViewport {
  west: number
  south: number
  east: number
  north: number
  bearing?: number
  pitch?: number
  animated?: boolean
}

export interface SailTimerOverlayApi {
  version: '1.0'
  setViewport: (viewport: SailTimerViewport) => void
  setVisible: (visible: boolean) => void
  pause: () => void
  resume: () => void
  resize: () => void
  getState: () => { ready: boolean, visible: boolean, paused: boolean }
}

declare global {
  interface Window {
    SailTimerOverlay?: SailTimerOverlayApi
    webkit?: {
      messageHandlers?: {
        sailTimerOverlay?: { postMessage: (message: unknown) => void }
      }
    }
  }
}

const TRANSPARENT_STYLE = {
  version: 8 as const,
  sources: {},
  layers: []
}

const INITIAL_VIEWPORT: SailTimerViewport = {
  west: -123.45,
  south: 37.45,
  east: -121.65,
  north: 38.55,
  bearing: 0,
  pitch: 0
}

function emit(name: string, detail: Record<string, unknown> = {}): void {
  const message = { source: 'sailtimer-overlay', version: '1.0', name, ...detail }
  window.dispatchEvent(new CustomEvent('sailtimer-overlay', { detail: message }))
  window.parent?.postMessage(message, window.location.origin)
  window.webkit?.messageHandlers?.sailTimerOverlay?.postMessage(message)
}

function isValidViewport(value: SailTimerViewport): boolean {
  const coordinates = [value.west, value.south, value.east, value.north]
  return coordinates.every(Number.isFinite) &&
    value.south >= -90 && value.north <= 90 && value.south < value.north &&
    value.west >= -180 && value.east <= 180 && value.west < value.east
}

/**
 * Transparent, host-controlled renderer for native charts and partner SDKs.
 * It intentionally owns no basemap, controls, logo, gestures, or attribution.
 */
export default function WeatherOverlay(): React.ReactElement {
  const mapRef = React.useRef<MapRef>(null)
  const [layers, setLayers] = React.useState<Layer[]>([])
  const [ready, setReady] = React.useState(false)
  const [visible, setVisible] = React.useState(true)
  const [paused, setPaused] = React.useState(false)
  const stateRef = React.useRef({ ready: false, visible: true, paused: false })
  const pendingViewport = React.useRef<SailTimerViewport>(INITIAL_VIEWPORT)
  const frame = React.useRef<number | null>(null)

  const applyViewport = React.useCallback((viewport: SailTimerViewport) => {
    if (!isValidViewport(viewport)) {
      emit('error', { code: 'INVALID_VIEWPORT', recoverable: true })
      return
    }

    pendingViewport.current = viewport
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const map = mapRef.current
      if (!map) return
      map.fitBounds(
        [[viewport.west, viewport.south], [viewport.east, viewport.north]],
        {
          bearing: viewport.bearing ?? 0,
          pitch: viewport.pitch ?? 0,
          duration: viewport.animated ? 150 : 0,
          padding: 0
        }
      )
      frame.current = null
    })
  }, [])

  React.useEffect(() => {
    let cancelled = false
    emit('loading')

    getWindLayersData(0)
      .then(data => {
        if (!cancelled) setLayers(getWindLayers(data, 6))
      })
      .catch(error => emit('error', {
        code: 'WEATHER_DATA_UNAVAILABLE',
        message: error instanceof Error ? error.message : String(error),
        recoverable: true
      }))

    return () => { cancelled = true }
  }, [])

  React.useEffect(() => {
    stateRef.current = { ready, visible, paused }
  }, [paused, ready, visible])

  React.useEffect(() => {
    const api: SailTimerOverlayApi = {
      version: '1.0',
      setViewport: applyViewport,
      setVisible,
      pause: () => setPaused(true),
      resume: () => setPaused(false),
      resize: () => mapRef.current?.resize(),
      getState: () => ({ ...stateRef.current })
    }
    window.SailTimerOverlay = api
    emit('bridgeReady', { apiVersion: api.version })

    return () => {
      if (window.SailTimerOverlay === api) delete window.SailTimerOverlay
    }
  }, [applyViewport])

  React.useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
  }, [])

  const renderedLayers = React.useMemo(
    () => visible && !paused ? layers : [],
    [layers, paused, visible]
  )

  return (
    <main className='sailtimer-weather-overlay' aria-label='SailTimer transparent weather overlay'>
      <Map
        ref={mapRef}
        initialViewState={{ longitude: -122.55, latitude: 38, zoom: 6 }}
        mapStyle={TRANSPARENT_STYLE}
        interactive={false}
        attributionControl={false}
        onLoad={() => {
          applyViewport(pendingViewport.current)
          setReady(true)
          emit('ready', { product: 'crowdsourced-wind' })
        }}
        onError={event => emit('error', {
          code: 'RENDERER_ERROR',
          message: String(event.error),
          recoverable: true
        })}
      >
        <DeckGLOverlay interleaved={false} layers={renderedLayers} />
      </Map>
    </main>
  )
}
