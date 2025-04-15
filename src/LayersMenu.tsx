import type { ReactElement } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { State } from 'src/constants/layers'

import DropdownMenu from 'src/components/DropdownMenu'

import { EyeIcon } from 'src/icons/Eye'
import { EyeSlashIcon } from 'src/icons/EyeSlash'

import { LAYERS, LayerKey } from 'src/constants/layers'

const layers = [
  {
    id: LAYERS.WIND,
    name: 'Particles'
  },
  {
    id: LAYERS.WIND_HEATMAP,
    name: 'Speed heatmap'
  },
  {
    id: LAYERS.WIND_BARBS,
    name: 'Barbs'
  },
  {
    id: LAYERS.WIND_DIRECTION_HEATMAP,
    name: 'Contours'
  }
]

type LayersMenuProps = {
  state: State,
  setState: Dispatch<SetStateAction<State>>
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

  const options = layers.map(({ id, name }) => ({
    label: name,
    icon: state[id as LayerKey].visible ? <EyeIcon /> : <EyeSlashIcon />,
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
