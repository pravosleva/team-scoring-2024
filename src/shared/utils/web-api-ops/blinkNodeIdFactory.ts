/**
 * Подсветка узла DOM-дерева по id элемента (конструктор)
 *
 * @export
 * @template T Специальные данные
 * @param {Object} arg 
 * @param {number} arg.timeout Задержка перед вызовом (мс)
 * @param {Object} arg.cb Коллбэки
 * @param {Object} arg.cb.onStart Целевой вызов ({ targetElm: HTMLElement }) => T
 * @param {Object} arg.cb.onEnd Конечный вызов после задержки ({ targetElm: HTMLElement, specialData: T }) => void
 * @param {Object} arg.cb.onError Коллбэк для ошибки ({ message: string }) => void
 * @returns {Function} Экземпляр для взовов: ({ id }) => void
 */
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
  return ({ id }: { id: string; }) => {
    try {
      const nodeId = id
      const targetElm = document.getElementById(nodeId)
      if (!!targetElm) {
        const specialData = cb.onStart({ targetElm })
        setTimeout(() => {
          cb.onEnd({ targetElm, specialData })
        }, timeout)
      }
      else
        throw new Error(`Node not found for nodeId=${id}`)
    } catch (err) {
      console.warn(err)
      cb.onError({ message: (err as Error)?.message || 'No message' })
    }
  }
}
