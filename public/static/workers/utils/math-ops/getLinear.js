console.log('[LOADED] workers/utils/getLinear')

/**
 * Линейная интерполяция
 *
 * @param {Object} arg For example: { x: number; x1: number; y1: number; x2: number; y2: number; }
 * @param {number} arg.x Целевое значение
 * @returns {number} Результат интерполяции
 */
const getLinear = ({ x, x1, y1, x2, y2 }) => {
  if (x1 === x2) {
    return (y1 + y2) / 2
  }
  return ((x - x1) * (y2 - y1)) / (x2 - x1) + y1
}
