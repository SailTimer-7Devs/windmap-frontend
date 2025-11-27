import type { ReactElement } from 'react'
import { Navigate } from 'react-router'

import Spinner from 'components/Spinner'

import NotFoundPage from 'containers/NotFoundPage'

import ExternalLayout from 'layouts/External'
import MainLayout from 'layouts/Main'

import * as routes from 'constants/routes'

import { lazyLoadPage } from 'lib/page'

import AccessWrapper from './AccessWrapper'

const LoginPage = lazyLoadPage('Login')
const PasswordResetPage = lazyLoadPage('PasswordReset')
const SignUpPage = lazyLoadPage('SignUp')

const MapPage = lazyLoadPage('Map')

function HydrateSpinner(): ReactElement {
  return (
    <div className='w-full h-dvh flex items-center justify-center'>
      <Spinner show={true} />
    </div>
  )
}

export default [
  {
    path: '/',
    element: <ExternalLayout />,
    HydrateFallback: HydrateSpinner,
    children: [
      {
        path: routes.LOGIN_ROUTE,
        element: (
          <AccessWrapper
            access='guest'
            page={LoginPage}
          />
        )
      },
      {
        path: routes.PASSWORD_RESET_ROUTE,
        element: (
          <AccessWrapper
            access='guest'
            page={PasswordResetPage}
          />
        )
      },
      {
        path: routes.SIGN_UP_ROUTE,
        element: (
          <AccessWrapper
            access='guest'
            page={SignUpPage}
          />
        )
      },
      {
        path: '*',
        element: (
          <AccessWrapper
            access='all'
            page={NotFoundPage}
          />
        )
      }
    ]
  },
  {
    path: '/',
    element: <MainLayout />,
    HydrateFallback: HydrateSpinner,
    children: [
      {
        index: true,
        element: <Navigate to={routes.HOME_ROUTE} replace />
      },
      {
        path: routes.HOME_ROUTE,
        element: <AccessWrapper page={MapPage} />
      }
    ]
  }
]
