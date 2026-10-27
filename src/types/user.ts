export type SignInPayload = {
  email: string
  password: string
}

export type ResetPasswordPayload = {
  email: string
}

export type ConfirmResetPasswordPayload = {
  email: string
  confirmationCode: string
  password: string
  confirmPassword: string
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
  // Authentication succeeded, but the weather session could not be established.
  // 'activation' is a native-app purchase still being recorded (403), while
  // 'subscription' is a web login without an active entitlement (403).
  // 'unavailable' means the service or network failed.
  appSessionIssue?: 'activation' | 'subscription' | 'unavailable'
  // In-memory copy of the app's login so the page can retry without the app.
  appSessionToken?: string
}
