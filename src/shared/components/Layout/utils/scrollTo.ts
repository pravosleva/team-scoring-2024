const scrollToRef = (ref: React.RefObject<HTMLElement>, headerPx: number = 0, additionalPx: number = 0, noAnimation?: boolean) => {
  if (!!ref?.current && !!window) {
    // ref.current.scrollIntoView()
    window.requestAnimationFrame(() =>
      window.scrollTo({
        left: 0,
        behavior: noAnimation ? 'auto' : 'smooth',
        top: (ref.current?.offsetTop || 0) - headerPx - additionalPx,
      })
    )
  }
}
export const scrollTo = (ref: React.RefObject<HTMLElement>, noAnimation?: boolean) => {
  scrollToRef(ref, 37, 65, noAnimation)
}
export const scrollTop = () => {
  window.requestAnimationFrame(() =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  )
}
export const scrollTopExtra = () => {
  window.requestAnimationFrame(() =>
    window.scrollTo({ top: 0, behavior: 'auto' })
  )
}
export const scrollToElm = (elm: HTMLElement) => {
  window.requestAnimationFrame(() =>
    elm.scrollTo({ top: 0, behavior: 'smooth' })
  )
}
