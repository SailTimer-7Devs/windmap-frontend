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
      <span className='text-sm text-[var(--text-secondary)] flex flex-wrap items-center justify-center gap-x-2'>
        Don’t have a SailTimer account?

        <Link
          to={routes.SIGN_UP_ROUTE}
          className='font-medium text-[var(--primary-dark)] underline underline-offset-2 hover:text-blue-300'
        >
          Create an account
        </Link>
      </span>

      <SignInForm />
    </LoginTemplate>
  )
}

export default LoginPage
