import type { ReactElement, SVGProps } from 'react'

const OceanIcon = (props: SVGProps<SVGSVGElement>): ReactElement => {
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
        stroke='#fff'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.7'
        d='M1 17.132c.696 1.178 3.842 2.2 5.512 0 1.643 1.642 3.815 1.92 5.569 0 .806 1 3.419 2.5 5.419 0 .694 1.5 3.694 2.4 5.694 0M1 5.338c.696 1.178 3.842 2.2 5.512 0 1.643 1.642 3.815 1.92 5.569 0 .806 1 3.419 2.5 5.419 0 .694 1.5 3.694 2.4 5.694 0M2.757 11.313c1.642 1.642 3.814 1.92 5.568 0M8.325 11.313c1.643 1.642 3.814 1.92 5.568 0 .806 1 3.42 2.5 5.42 0'
      />
      
      <path
        stroke='#fff'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.4'
        d='m19.718 13.553.546-2.873-2.857-.392'
      />
    </svg>
  )
}

export default OceanIcon
