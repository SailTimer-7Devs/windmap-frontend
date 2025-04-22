const WIND = 'wind'
const PSWD = 'pswd'

const GROUP_NAMES = [
  PSWD,
  WIND
]

export const LAYERS_GROUP_MENU_LIST = GROUP_NAMES.map((name) => ({
  name,
  onClick: (): void => history.pushState(
    {}, '', location.pathname + `?layer=${name}`
  )
}))