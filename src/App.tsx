import { type ReactElement } from 'react'

// import FPSStats from 'react-fps-stats'

import Mapbox from './Mapbox'

export default function App(): ReactElement {
  return (
    <div className='relative w-full h-full'>
      <Mapbox />
    </div>
  )
}
