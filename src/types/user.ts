export type SignInPayload = {
  email: string
  password: string
}

export type ResetPasswordPayload = {
  email: string
}

export type SignUpPayload = {
  email: string
  password: string
  confirmPassword: string
}

export type ConfirmSignUpPayload = {
  email: string
  confirmationCode: string
}

export type CurrentUser = {
  isAuthorized: boolean
  // The SailTimer app handed over a login, but the weather session could not
  // be established yet: 'activation' = subscription not recorded on the server
  // (403), 'unavailable' = server or network error. Shown instead of the web
  // login page, which cannot fix either case.
  appSessionIssue?: 'activation' | 'unavailable'
  // In-memory copy of the app's login so the page can retry without the app.
  appSessionToken?: string
}
