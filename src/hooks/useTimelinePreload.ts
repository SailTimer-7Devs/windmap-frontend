import type { LayersState } from 'types'

import React from 'react'

import { preloadLayersData } from 'lib/layers'

interface UseTimelinePreloadReturn {
  getTimelinePreload: (requestedDatetimes: string[]) => Promise<void>
}

export default function useTimelinePreload(
  layerName: string,
  datetimes: string[]
): UseTimelinePreloadReturn {
  const [cache, setCache] = React.useState<Map<number, LayersState>>(
    () => new globalThis.Map()
  )

  const getTimelinePreload = async (requestedDatetimes: string[]) => {
    const newCache = new globalThis.Map(cache)

    await Promise.all(requestedDatetimes.map(
      async (datetime) => {
        const timelineIndex = datetimes.findIndex(dt => dt === datetime)

        if (newCache.has(timelineIndex)) return

        const data = await preloadLayersData(layerName, timelineIndex)

        newCache.set(timelineIndex, data)
      }))

    setCache(newCache)
  }

  return { getTimelinePreload } as const
} 