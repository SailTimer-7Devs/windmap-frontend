import type { ReactElement } from 'react'

import DropdownMenu from 'components/DropdownMenu'

import BRAND_MENU_LIST from 'constants/brandMenu'

const BrandMenu = (): ReactElement => {
  return (
    <DropdownMenu
      caption='SailTimer ™'
      options={BRAND_MENU_LIST}
    />
  )
}

export default BrandMenu