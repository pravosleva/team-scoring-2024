export const scrollToIdFactory = ({ timeout, offsetTop, elementHeightCritery }: {
  timeout: number;
  offsetTop: number;
  elementHeightCritery: number;
}) => {
  let _timeout: NodeJS.Timeout | undefined = undefined

  return ({ id }: { id: string }) => {
    try {
      const nodeId = id
      const targetElm = document.getElementById(nodeId)
      if (!!targetElm) {
        if (!!_timeout) clearTimeout(_timeout)
        _timeout = setTimeout(() => {
          const curHeight = targetElm.getBoundingClientRect().height
          if (curHeight <= elementHeightCritery) {
            // NOTE: Скроллить до середины контента
            targetElm?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
          } else {
            // NOTE: Скроллить в начало контента
            const elementPosition = targetElm.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - offsetTop
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            });
          }
        }, timeout)

      }
      else
        console.log(`- node not found nodeId=${id}`)
    } catch (err) {
      console.warn(err)
    }
  }
}
