/* eslint-disable @typescript-eslint/no-explicit-any */
export function blinkNodeIdFactory<T>({ timeout, cb }: {
  timeout: number;
  cb: {
    // NOTE: Do something with target elm
    onStart: (ps: {
      targetElm: HTMLElement;
    }) => T;

    // NOTE: Do something with your data and element
    onEnd: (ps: {
      specialData: T;
      targetElm: HTMLElement;
    }) => void;

    onError: (ps: { message: string }) => void;
  },
}) {
  // let _timeout: NodeJS.Timeout | undefined = undefined
  // let _currentNodeId

  return ({ id }: { id: string }) => {
    try {
      const nodeId = id
      const targetElm = document.getElementById(nodeId)
      if (!!targetElm) {
        // let _timeout: NodeJS.Timeout | undefined = undefined
        const specialData = cb.onStart({ targetElm })
        setTimeout(() => {
          cb.onEnd({ targetElm, specialData })
        }, timeout)

        // if (!!_timeout) clearTimeout(_timeout)
        // setTimeout(() => {
        //   const curHeight = targetElm.
        //   if (curHeight <= elementHeightCritery) {
        //     // NOTE: Скроллить до середины контента
        //     targetElm?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
        //   } else {
        //     // NOTE: Скроллить в начало контента
        //     const elementPosition = targetElm.getBoundingClientRect().top
        //     const offsetPosition = elementPosition + window.pageYOffset - offsetTop
        //     window.scrollTo({
        //       top: offsetPosition,
        //       behavior: 'smooth',
        //     });
        //   }
        // }, timeout)

      }
      else
        throw new Error(`Node not found for nodeId=${id}`)
    } catch (err: any) {
      console.warn(err)
      cb.onError({ message: err?.message || 'No message' })
    }
  }
}
