import type { DeckProps } from 'deck.gl'
import type { MapboxOverlayProps } from '@deck.gl/mapbox'
import type { View } from '@deck.gl/core'
import { MapboxOverlay } from '@deck.gl/mapbox'

import { useControl } from 'react-map-gl/mapbox'

export default function DeckGLOverlay<T extends View | View[]>(
  props: DeckProps<T>
): null {
  const overlay = useControl<MapboxOverlay>(
    () => new MapboxOverlay(props as MapboxOverlayProps)
  )

  overlay.setProps(props as MapboxOverlayProps)

  return null
}
