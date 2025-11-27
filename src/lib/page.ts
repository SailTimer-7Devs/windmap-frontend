import React from 'react'

const { localStorage } = window
const PAGE_REFRESH_KEY = 'page-has-been-force-refreshed'

export function lazyLoadPage(page: string): React.LazyExoticComponent<React.ComponentType<any>> {
  return React.lazy(async () => {
    try {
      const Page = await import(`../pages/${page}.ts`)

      localStorage.setItem(PAGE_REFRESH_KEY, 'false')

      return Page
    } catch (error) {
      const key: string | null = localStorage.getItem(PAGE_REFRESH_KEY)
      const pageHasAlreadyBeenForceRefreshed = key
        ? JSON.parse(key)
        : false

      if (!pageHasAlreadyBeenForceRefreshed) {
        localStorage.setItem(PAGE_REFRESH_KEY, 'true')

        return window.location.reload()
      }

      throw error
    }
  })
}
