import type { ReactElement, SVGProps } from 'react'

const WindDirectionIcon = (props: SVGProps<SVGSVGElement>): ReactElement => {
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
        d='M2.5 10.97h16.468l-.257-.24a1 1 0 0 1 1.366-1.46l2.106 1.97.07.075a1 1 0 0 1-.059 1.375l-2.106 2.03a1 1 0 1 1-1.388-1.44l.321-.31H2.5a1 1 0 0 1 0-2M4.287 4.87h7.927l-.257-.24a1 1 0 0 1 1.366-1.462L15.43 5.14l.07.074a1 1 0 0 1-.06 1.376l-2.106 2.03a1 1 0 1 1-1.388-1.44l.322-.31H4.287a1 1 0 0 1 0-2M8.27 17.072h4.927l-.257-.24a1 1 0 0 1 1.366-1.461l2.107 1.97.07.075a1 1 0 0 1-.06 1.375l-2.106 2.03a1 1 0 1 1-1.388-1.44l.321-.31H8.27a1 1 0 0 1 0-2'
      />
    </svg>
  )
}

export default WindDirectionIcon
