import { linear } from 'math-interpolate'

/**
 * Get percentage
 * 
 * @source Has external dep {@link https://npmjs.com/package/math-interpolate math-interpolate}
 *
 * @param {Object} arg 
 * @param {number} arg.x Target value
 * @param {number} arg.sum Total value
 * @returns {number} 
 */
export const getPercentage = ({ x, sum }: { x: number, sum: number }) => {
  const result = linear({
    x1: 0,
    y1: 0,
    x2: sum,
    y2: 100,
    x: x,
  })
  return result
}
