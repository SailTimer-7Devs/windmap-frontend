import type { ReactElement } from 'react'
import type { LayersMenuProps } from 'types'

import React from 'react'

import DropdownMenu from 'components/DropdownMenu'

import EyeIcon from 'icons/Eye'

const ICON_STYLES = {
  className: 'shrink-0'
}

const LayerListMenu = ({
  menuList,
  layersId,
  toggle
}: LayersMenuProps): ReactElement => {
  const options = React.useMemo(
    () => menuList.map(({ id, name, icon: Icon = EyeIcon }) => ({
      label: name,
      icon: React.isValidElement(Icon) ? Icon : <Icon {...ICON_STYLES} />,
      onClick: () => toggle(id),
      checked: layersId.includes(id)
    })), [menuList, layersId, toggle]
  )

  return (
    <DropdownMenu
      caption='Layers'
      options={options}
    />
  )
}

export default LayerListMenu
