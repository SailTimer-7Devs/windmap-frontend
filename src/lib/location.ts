import type { Dispatch, SetStateAction } from 'react'

import type { MapViewState } from 'types'

export const handleRequestUserLocation = (
  setViewState: Dispatch<SetStateAction<MapViewState>>
): void => {
  if (!navigator.geolocation) {
    console.error('geolocation not supported')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setViewState(prevState => ({
        ...prevState,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        zoom: 10
      }))
    },
    (err) => {
      console.error('error getting location', err)
    }
  )
}