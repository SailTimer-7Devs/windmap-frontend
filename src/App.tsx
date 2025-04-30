import { type ReactElement } from 'react'

import Mapbox from 'components/Mapbox'

export default function App(): ReactElement {
  return (
    <div className='relative w-full h-dvh'>
      <Mapbox />
    </div>
  )
}
