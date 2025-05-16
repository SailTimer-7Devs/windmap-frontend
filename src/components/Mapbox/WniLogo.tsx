import type { ReactElement } from 'react'

import logo from 'assets/images/wni_logo.jpg'

const PATH = 'https://sea.weathernews.com'

const WniLogo = (): ReactElement => {
  return (
    <a
      className='absolute bottom-[20px] right-[10px]'
      href={PATH}
      rel='nofollow noopener noreferrer'
      target='_blank'
    >
      <img
        className='h-[60px]'
        src={logo}
        alt='WNI Logo'
      />

      <p className='text-sm bg-white text-center pt-[4px]'>
        {PATH}
      </p>
    </a>
  )
}

export default WniLogo
