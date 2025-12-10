import type { ReactElement, ReactNode } from 'react'

function TemplateLogin(props: TemplateLoginProps): ReactElement {
  const {
    children,
    description,
    title
  } = props

  return (
    <div className='max-w-[390px] flex flex-col justify-center gap-8 p-4 mx-auto mt-10'>
      <div className='text-white'>
        <h1 className='text-[32px] leading-[48px] font-normal text-[var(--text-primary)]'>
          {title}
        </h1>

        {description && (
          <p className='text-sm text-[var(--text-secondary)] mt-4'>
            {description}
          </p>
        )}
      </div>

      {children}
    </div>
  )
}

type TemplateLoginProps = {
  children: ReactNode
  description?: string
  title: string
}

export default TemplateLogin
