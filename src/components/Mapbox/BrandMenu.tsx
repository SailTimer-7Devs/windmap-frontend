import type { ReactElement } from 'react'

import DropdownMenu from 'components/DropdownMenu'

import BRAND_MENU_LIST from 'constants/brandMenu'

import { useAuthStore } from 'store/auth'

const BrandMenu = (): ReactElement => {
  const { signOut } = useAuthStore()
  const logoutItem = {
    label: 'Log out',
    onClick: signOut
  }

  return (
    <DropdownMenu
      caption='SailTimer ™'
      options={[...BRAND_MENU_LIST, logoutItem]}
    />
  )
}

export default BrandMenu
