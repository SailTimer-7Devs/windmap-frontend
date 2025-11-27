import * as routes from 'constants/routes'

export const ACCESS_TYPE_ALL = 'all' as const
export const ACCESS_TYPE_GUEST = 'guest' as const
export const ACCESS_TYPE_USER = 'user' as const
export const ACCESS_TYPES = [
  ACCESS_TYPE_ALL,
  ACCESS_TYPE_GUEST,
  ACCESS_TYPE_USER
] as const

export const LAYOUT_TYPE_MAIN = 'main' as const
export const LAYOUT_TYPE_EXTERNAL = 'external' as const
export const LAYOUT_TYPES = [
  LAYOUT_TYPE_MAIN,
  LAYOUT_TYPE_EXTERNAL
] as const

export const GUEST_DEFAULT_REDIRECT_LOCATION = {
  pathname: routes.LOGIN_ROUTE
}

export const USER_DEFAULT_REDIRECT_LOCATION = {
  pathname: routes.HOME_ROUTE
}
