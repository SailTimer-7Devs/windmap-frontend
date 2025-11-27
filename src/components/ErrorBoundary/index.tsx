import { ErrorBoundary } from 'react-error-boundary'
import { Link } from 'react-router'
import Button from 'components/Button'

import * as routes from 'constants/routes'

import { isDevMode } from 'bootstrap'

function FallbackComponent(props: FallbackComponentPropTypes) {
  const { error, resetErrorBoundary } = props

  return (
    <div className='flex flex-col items-center justify-center flex-1'>
      <div className='flex flex-col items-center justify-center'>
        <h2 className='text-2xl font-normal mb-4'>
          Oops, something went wrong...
        </h2>

        {isDevMode && (
          <h3 className='mb-4'>
            {error.message}
          </h3>
        )}

        <div className='flex gap-6'>
          <Button onClick={resetErrorBoundary}>
            Update Page
          </Button>

          <Link to={routes.HOME_ROUTE}>
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}

function ErrorBound(props: { children: React.ReactNode }): React.ReactElement {
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      {props.children}
    </ErrorBoundary>
  )
}

type FallbackComponentPropTypes = {
  error: Error
  resetErrorBoundary: ErrorBoundary['resetErrorBoundary']
}

export default ErrorBound
