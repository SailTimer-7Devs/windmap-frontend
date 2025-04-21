import type { ReactElement } from 'react'

import DropdownMenu from 'components/DropdownMenu'

import { CheckIcon } from 'icons/Check'

import { LAYERS_GROUP_MENU_LIST } from 'constants/layersGroup'

const ICON_STYLES = {
  className: 'shrink-0'
}

const LayerGroupMenu = ({ checked }: { checked: string }): ReactElement => {
  const options = LAYERS_GROUP_MENU_LIST.map(({ name, onClick }) => ({
    label: name,
    icon: checked === name
      ? <CheckIcon {...ICON_STYLES} />
      : <></>,
    onClick
  }))

  return (
    <DropdownMenu
      caption='Groups'
      options={options}
    />
  )
}

export default LayerGroupMenu
