type TAbstractedObject = null | { [key: string]: TAbstractedObject } | { [key: string]: TAbstractedObject }[] | string | string[] | boolean | boolean[] | number | number[] | TAbstractedObject[]

/**
 * Мутации объекта
 *
 * @param {Object} arg 
 * @param {*} arg.target 
 * @param {*} arg.source 
 * @param {boolean} arg.removeIfUndefined 
 * @returns {Object} 
 */
export const mutateObject = ({ target, source, removeIfUndefined }: {
  target: { [key: string]: TAbstractedObject };
  source: { [key: string]: TAbstractedObject };
  removeIfUndefined?: boolean;
}) => {
  if (typeof source === 'object') {
    for (const key in source) {
      switch (true) {
        case Array.isArray(source[key]):
          if (!!target[key] && Array.isArray(target[key])) target[key] = [...new Set([...target[key], ...source[key]])]
          else target[key] = source[key]
          break
        case typeof source[key] === 'object' && !!source[key] && source[key] !== null:
          if (target[key]) mutateObject({ target: target[key] as { [key: string]: TAbstractedObject }, source: source[key], removeIfUndefined })
          else target[key] = source[key]
          break
        case source[key] === null:
          target[key] = source[key]
          break
        case typeof source[key] === 'string':
        case typeof source[key] === 'boolean':
        case typeof source[key] === 'number':
          target[key] = source[key]
          break
        default:
          break
      }
    }
  }
  if (removeIfUndefined) {
    for (const key in target)
      if (typeof source[key] === 'undefined' && !!target[key]) delete target[key]
  }
  return target
}
