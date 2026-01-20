import type { ReactElement } from 'react'

export default function PointsBadge({ count }: { count: number }): ReactElement {
  return (
    <div className='bg-white/95 text-[#111] px-2 py-1 rounded-md text-[13px] font-medium shadow-[0_1px_4px_rgba(0,0,0,0.2)]'>
      Crowdsourced weather cells in view: <b>{count}</b>
    </div>
  )
}
