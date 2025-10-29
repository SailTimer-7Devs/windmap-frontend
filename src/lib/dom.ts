function scrollTo(el: HTMLElement | null | undefined, opts: ScrollIntoViewOptions = { block: 'center' }) {
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', ...opts })
  }
}

export function scrollToErrorField(): number {
  return window.setTimeout(() => {
    const el = document.getElementsByClassName('field-error')[0] as HTMLElement | undefined
    scrollTo(el)
  }, 0)
}
