import type { ReactElement, SVGProps } from 'react'

const DotIcon = (props: SVGProps<SVGSVGElement>): ReactElement => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      fill='none'
      viewBox='0 0 24 24'
      {...props}
    >
       <circle cx='12' cy='12' r='3' fill='#fff' />
    </svg>
  )
}

export default DotIcon
