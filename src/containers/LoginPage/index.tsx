import type { ReactElement } from 'react'
// import { Link } from 'react-router'

import LoginTemplate from 'templates/Login'

import SignInForm from 'forms/SignIn'

// import * as routes from 'constants/routes'

function LoginPage(): ReactElement {
  return (
    <LoginTemplate
      title='Welcome'
      description='In case you decide to use crowdsourced weather maps, please log in. You only need to log in once.'
    >
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
