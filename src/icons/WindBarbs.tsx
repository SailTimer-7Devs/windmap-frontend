import type { ReactElement, SVGProps } from 'react'

const WindBarbsIcon = (props: SVGProps<SVGSVGElement>): ReactElement => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      fill='none'
      viewBox='0 0 24 24'
      {...props}
    >
      <path
        fill='#fff'
        d='M1.501 6.892a1 1 0 0 1 1.367.366l3.458 6.984h1.92L5.25 8.274a.999.999 0 1 1 1.714-1.032l3.618 7h1.79l-1.658-3.87a1 1 0 1 1 1.733-1l2.237 4.87h4.58a2 2 0 1 1 0 2H5.749c-.357 0-.688-.191-.867-.5L1.134 8.258a1 1 0 0 1 .367-1.366'
      />
    </svg>
  )
}

export default WindBarbsIcon
