const WIND = 'wind'
const WH = 'wh'

const GROUP_NAMES = [
  WH,
  WIND
]

export const LAYERS_GROUP_MENU_LIST = GROUP_NAMES.map((name) => ({
  name,
  onClick: (): void => history.pushState(
    {}, '', location.pathname + `?layer=${name}`
  )
}))