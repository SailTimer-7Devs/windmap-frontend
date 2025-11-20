import type { ReactElement, SVGProps } from 'react'

const WshSpeedIcon = (props: SVGProps<SVGSVGElement>): ReactElement => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      fill='none'
      viewBox='0 0 24 24'
      {...props}
    >
      <g
        stroke='#fff'
        strokeLinecap='round'
        strokeLinejoin='round'
        clipPath='url(#a)'
      >
        <path
          strokeWidth='1.7'
          d='M1 21.452c.696 1.179 3.842 2.2 5.512 0 1.643 1.643 3.815 1.921 5.569 0 .806 1 3.419 2.5 5.419 0 .694 1.5 3.694 2.4 5.694 0M1 15.97c.696 1.18 3.842 2.2 5.512 0 1.643 1.643 3.815 1.922 5.569 0 .806 1 3.419 2.5 5.419 0 .694 1.5 3.694 2.4 5.694 0'
        />

        <path
          strokeWidth='1.5'
          d='m5 11.97 3-3.043L5 5.97M11 11.97l3-3.043-3-2.956M17 11.97l3-3.043-3-2.956'
        />
      </g>

      <defs>
        <clipPath id='a'>
          <path fill='#fff' d='M0 0h24v24H0z' />
        </clipPath>
      </defs>
    </svg>
  )
}

export default WshSpeedIcon
