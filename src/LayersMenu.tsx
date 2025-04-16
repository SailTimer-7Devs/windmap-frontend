import type { ReactElement } from 'react'
import type { LayerKey, LayersMenuProps } from 'types'

import DropdownMenu from 'components/DropdownMenu'

import { EyeIcon } from 'icons/Eye'
import { EyeSlashIcon } from 'icons/EyeSlash'

import { ACTIONS_MENU_LIST } from 'constants/layers'

const ICON_STYLES = {
  className: 'shrink-0'
}

const LayersMenu = ({ state, setState }: LayersMenuProps): ReactElement => {
  const toggleLayer = (layerName: LayerKey) => {
    setState(prevState => ({
      ...prevState,
      [layerName]: {
        ...prevState[layerName],
        visible: !prevState[layerName].visible
      }
    }))
  }

  const options = ACTIONS_MENU_LIST.map(({ id, name }) => ({
    label: name,
    icon: state[id as LayerKey].visible
      ? <EyeIcon {...ICON_STYLES} />
      : <EyeSlashIcon {...ICON_STYLES} />,
    onClick: () => toggleLayer(id as LayerKey)
  }))

  return (
    <DropdownMenu
      caption='Layers'
      options={options}
    />
  )
}

export default LayersMenu
