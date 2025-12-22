import type { ReactElement } from 'react'
import { Link } from 'react-router'

import LoginTemplate from 'templates/Login'

import SignInForm from 'forms/SignIn'

import * as routes from 'constants/routes'

function LoginPage(): ReactElement {
  return (
    <LoginTemplate
      title='Welcome'
      description='In case you decide to use crowdsourced weather maps, please log in. You only need to log in once.'
    >
      <p className='text-sm text-[var(--text-secondary)]'>
        You can use your subscription from the SailTimer app. The app is available for

        <Link
          to={routes.SAILTIMER_IOS_ROUTE}
          className='ml-1 text-sm text-[var(--primary-dark)] hover:text-blue-300'
        >
          IOS
        </Link>

        <span className='ml-1'>and</span>

        <Link
          to={routes.SAILTIMER_ANDROID_ROUTE}
          className='ml-1 text-sm text-[var(--primary-dark)] hover:text-blue-300'
        >
          Android.
        </Link>
      </p>

      {/* <span className='text-sm text-[var(--text-secondary)] flex gap-2'>
        Don’t have an account?

        <Link to={routes.SIGN_UP_ROUTE} className='hover:text-blue-300 text-[var(--primary-dark)] text-sm'>
          Create an account
        </Link>
      </span> */}

      <SignInForm />
    </LoginTemplate>
  )
}

export default LoginPage
