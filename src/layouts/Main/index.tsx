import type { ReactElement } from 'react'

import { Outlet } from 'react-router'

function MainLayout(): ReactElement {
  return (
    <div className='relative w-full h-dvh flex items-center justify-center'>
      <Outlet />
    </div>
  )
}

export default MainLayout
