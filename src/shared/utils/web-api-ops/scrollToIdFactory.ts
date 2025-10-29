export const scrollToIdFactory = ({ timeout, offsetTop, elementHeightCritery }: {
  timeout: number;
  offsetTop: number;
  elementHeightCritery: number;
}) => {
  let _timeout: NodeJS.Timeout | undefined = undefined

  return ({ id, _cfg, cb }: {
    id: string;
    _cfg?: {
      getOffsetTop?: ({ targetElm }: { targetElm: HTMLElement }) => number | undefined;
    };
    cb?: {
      onErr: (ps: { reason: string }) => void;
      onSuccess?: (ps: { reason?: string }) => void;
    };
  }) => {
    try {
      const nodeId = id
      const targetElm = document.getElementById(nodeId)
      if (!!targetElm) {
        // console.log(targetElm)
        if (!!_timeout) clearTimeout(_timeout)
        _timeout = setTimeout(() => {
          const defaultLogic = () => {
            const curHeight = targetElm.getBoundingClientRect().height
            if (curHeight <= elementHeightCritery) {
              // NOTE: v1 Скроллить до середины контента
              targetElm?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
            } else {
              // NOTE: Скроллить в начало контента
              const elementPosition = targetElm.getBoundingClientRect().top
              const offsetPosition = elementPosition + window.pageYOffset - offsetTop

              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
              })
            }
          }
          switch (true) {
            case !!_cfg: {
              if (typeof _cfg.getOffsetTop === 'function') {
                const elementPosition = targetElm.getBoundingClientRect().top
                const specialOffsetTop = _cfg.getOffsetTop({ targetElm })
                if (typeof specialOffsetTop === 'number') {
                  console.log(`specialOffsetTop -> ${specialOffsetTop} (${typeof specialOffsetTop})`)
                  const offsetPosition = elementPosition + window.pageYOffset - specialOffsetTop
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                  })
                } else defaultLogic()
              }
              break
            }
            default:
              defaultLogic()
              break
          }
          cb?.onSuccess?.({})
        }, timeout)

      }
      else {
        cb?.onErr({ reason: `- node not found nodeId=${id}` });
      }
    } catch (err) {
      console.warn(err)
    }
  }
}
