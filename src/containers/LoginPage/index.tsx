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
      <Link
        to={routes.SAILTIMER_APP_ROUTE}
        className='text-sm text-[var(--text-secondary)]'
      >
        You can use your subscription from the

        <span className='hover:text-blue-300 text-[var(--primary-dark)] text-sm ml-1'>
          SailTimer app
        </span>

        <span className='ml-1'>in this app.</span>
      </Link>

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
