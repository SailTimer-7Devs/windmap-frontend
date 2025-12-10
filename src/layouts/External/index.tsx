import React from 'react'

import { Outlet } from 'react-router'

import logo from 'assets/images/logo.png'

function ExternalLayout(): React.ReactNode {
  return (
    <div className='relative w-full h-dvh overflow-auto p-4'>
      <div className='flex flex-col items-center justify-center'>
        <img
          className='h-[124px] mx-auto shrink-0 mt-12'
          src={logo}
          alt='Logo'
        />

        <Outlet />
      </div>
    </div>
  )
}

export default ExternalLayout
