import type { ReactElement } from 'react'
import { Link } from 'react-router'

import * as routes from 'constants/routes'

import { useAuthStore } from 'store/auth'

function NotFoundPage(): ReactElement {
  const { currentUser } = useAuthStore()
  const route = currentUser
    ? routes.HOME_ROUTE
    : routes.LOGIN_ROUTE

  return (
    <div className='flex flex-col grow items-center justify-center'>
      <h2 className='mb-1.2'>
        404
      </h2>

      <h3 className='mb-4'>
        Page not found
      </h3>

      <Link to={route}>Go to Homepage</Link>
    </div>
  )
}

export default NotFoundPage
