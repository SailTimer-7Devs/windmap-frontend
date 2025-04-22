const WIND = 'wind'
const PSWH = 'pswh'
const PWH = 'pwh'
const WSH = 'wsh'

const GROUP_NAMES = [
  WIND,
  PSWH,
  PWH,
  WSH
]

export const LAYERS_GROUP_MENU_LIST = GROUP_NAMES.map((name) => ({
  name,
  onClick: (): void => history.pushState(
    {}, '', location.pathname + `?layer=${name}`
  )
}))