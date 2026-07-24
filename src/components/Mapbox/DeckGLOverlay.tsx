import type { DeckProps } from 'deck.gl'
import type { MapboxOverlayProps } from '@deck.gl/mapbox'
import type { View } from '@deck.gl/core'

import React from 'react'
import { MapboxOverlay } from '@deck.gl/mapbox'

import { useControl } from 'react-map-gl/mapbox'

type DeckGLOverlayProps<T extends View | View[]> = DeckProps<T> & {
  interleaved?: boolean
  ref?: React.RefObject<MapboxOverlay | null>
}

export default function DeckGLOverlay<T extends View | View[]>({
  ref,
  ...props
}: DeckGLOverlayProps<T>): null {
  const overlay = useControl<MapboxOverlay>(
    () => new MapboxOverlay(props as MapboxOverlayProps)
  )

  overlay.setProps(props as MapboxOverlayProps)

  React.useEffect(() => {
    if (!ref) return

    ref.current = overlay

    return () => {
      ref.current = null
    }
  }, [overlay, ref])

  return null
}
