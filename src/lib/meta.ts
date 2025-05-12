import { META } from 'constants/meta'

export const setMetaData = ({ isWindLayer }: { isWindLayer: boolean }): void => {
  document.title = isWindLayer
    ? META.wind.title
    : META.wni.title

  const description = isWindLayer ? META.wind.description : META.wni.description

  const metaDescription = document.querySelector('meta[name=\'description\']')

  if (metaDescription) {
    metaDescription.setAttribute('content', description)
  } else {

    const meta = document.createElement('meta')
    meta.name = 'description'
    meta.setAttribute('content', description)

    document.head.appendChild(meta)
  }
} 