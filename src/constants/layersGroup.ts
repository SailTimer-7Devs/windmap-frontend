const WIND = 'wind'
const PSWD = 'pswd'
const PWH = 'pwh'

const GROUP_NAMES = [
  WIND,
  PSWD,
  PWH
]

export const LAYERS_GROUP_MENU_LIST = GROUP_NAMES.map((name) => ({
  name,
  onClick: (): void => history.pushState(
    {}, '', location.pathname + `?layer=${name}`
  )
}))