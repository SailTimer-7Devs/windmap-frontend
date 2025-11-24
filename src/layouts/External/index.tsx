import React from 'react'

import { Outlet } from 'react-router'

import logo from 'assets/images/logo.png'

function ExternalLayout(): React.ReactNode {
  return (
    <div className='relative w-full h-dvh flex items-center justify-center flex-col p-4'>
      <img
        className='h-[108px] mx-auto'
        src={logo}
        alt='Logo'
      />

      <div className='w-full h-full'>
        <Outlet />
      </div>
    </div>
  )
}

export default ExternalLayout
