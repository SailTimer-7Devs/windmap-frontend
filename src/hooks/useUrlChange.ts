import React from 'react'

export default function useUrlChange(callback: (url: string) => void): void {
  React.useEffect(() => {
    const handleUrlChange = () => {
      callback(window.location.href)
    }

    window.addEventListener('popstate', handleUrlChange)

    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args)
      handleUrlChange()
    }

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args)
      handleUrlChange()
    }

    return () => {
      window.removeEventListener('popstate', handleUrlChange)
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [callback])
}