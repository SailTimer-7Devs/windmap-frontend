import type { ReactElement, ReactNode } from 'react'

function TemplateLogin(props: TemplateLoginProps): ReactElement {
  const {
    children,
    description,
    title
  } = props

  return (
    <div className='max-w-[375px] flex flex-col items-center justify-center gap-10 p-4'>
      <div className='text-white'>
        <h1 className='text-4xl font-normal mb-4'>
          {title}
        </h1>

        <p className='text-sm'>
          {description}
        </p>
      </div>

      {children}
    </div>
  )
}

type TemplateLoginProps = {
  children: ReactNode
  description: string
  title: string
}

export default TemplateLogin
