import React from 'react'
import { Navigate } from 'react-router'

import Spinner from 'components/Spinner'
import ErrorBoundary from 'components/ErrorBoundary'

import {
  ACCESS_TYPES,
  ACCESS_TYPE_USER,
  ACCESS_TYPE_GUEST,
  GUEST_DEFAULT_REDIRECT_LOCATION,
  USER_DEFAULT_REDIRECT_LOCATION
} from 'constants/layout'

import { useAuthStore } from 'store/auth'

function AccessWrapper(props: AccessWrapperPropTypes): React.ReactNode {
  const {
    access = ACCESS_TYPE_USER,
    page: Page
  } = props
  
  let shouldRedirect = false
  let redirectTo = GUEST_DEFAULT_REDIRECT_LOCATION
  
  const { currentUser } = useAuthStore()
  const isAuthorized = currentUser?.isAuthorized

  if (access === ACCESS_TYPE_GUEST && isAuthorized) {
    shouldRedirect = true
    redirectTo = USER_DEFAULT_REDIRECT_LOCATION
  }

  if (access === ACCESS_TYPE_USER && !isAuthorized) {
    shouldRedirect = true
  }

  if (shouldRedirect) {
    return <Navigate to={redirectTo} />
  }
  return (
    <ErrorBoundary>
      <React.Suspense fallback={<Spinner show={true} />}>
        <Page />
      </React.Suspense>
    </ErrorBoundary>
  )
}

type AccessWrapperPropTypes = {
  access?: typeof ACCESS_TYPES[number] | (() => boolean)
  page: React.ElementType
}

export default AccessWrapper
