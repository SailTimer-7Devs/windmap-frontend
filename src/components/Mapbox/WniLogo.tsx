import type { ReactElement } from 'react'

import logo from 'assets/images/wni_logo.jpg'

const WniLogo = (): ReactElement => {
  return (
    <a
      className='absolute bottom-[20px] right-[10px]'
      href='https://sea.weathernews.com/'
      rel='nofollow noopener noreferrer'
      target='_blank'
    >
      <img
        className='h-[60px]'
        src={logo}
        alt='WNI Logo'
      />
    </a>
  )
}

export default WniLogo
