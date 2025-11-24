import { Navigate } from 'react-router'

import Spinner from 'components/Spinner'

import NotFoundPage from 'containers/NotFoundPage'

import ExternalLayout from 'layouts/External'
import MainLayout from 'layouts/Main'

import * as routes from 'constants/routes'

import { lazyLoadPage } from 'lib/page'

import AccessWrapper from './AccessWrapper'

// const LoginConfirmPage = lazyLoadPage('LoginConfirm')
const LoginPage = lazyLoadPage('Login')
// const PasswordSetupPage = lazyLoadPage('PasswordSetup')
// const PasswordResetPage = lazyLoadPage('PasswordReset')

const MapPage = lazyLoadPage('Map')

export default [
  {
    path: '/',
    element: <ExternalLayout />,
    HydrateFallback: Spinner,
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
      // {
      //   path: routes.LOGIN_CONFIRM_ROUTE,
      //   element: (
      //     <AccessWrapper
      //       access='guest'
      //       page={LoginConfirmPage}
      //     />
      //   )
      // },
      // {
      //   path: routes.PASSWORD_SETUP_ROUTE,
      //   element: (
      //     <AccessWrapper
      //       access='guest'
      //       page={PasswordSetupPage}
      //     />
      //   )
      // },
      // {
      //   path: routes.PASSWORD_RESET_ROUTE,
      //   element: (
      //     <AccessWrapper
      //       access='guest'
      //       page={PasswordResetPage}
      //     />
      //   )
      // },
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
    HydrateFallback: Spinner,
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
