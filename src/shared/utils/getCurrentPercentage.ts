import { linear } from 'math-interpolate'

type TProps = {
  startDateTs: number
  targetDateTs: number
}

/**
 * Текущий прогресс по времени
 * 
 * @source
 *
 * @param {Object} arg 
 * @param {number} arg.startDateTs Дата старта
 * @param {number} arg.targetDateTs Дата достижения цели
 * @returns {number} Процент достижения целевой даты
 */
export const getCurrentPercentage = ({ startDateTs: t0, targetDateTs: t100 }: TProps): number => {
  const nowDate = new Date().getTime()
  const xDate = t0 + (t100 - t0)

  /*
    t0 --- nowDate --- xDate
    [ ] -> now ------> [v] + delta
  */

  const result = linear({
    x1: t0,
    y1: 0,
    x2: xDate,
    y2: 100,
    x: nowDate,
  })

  return result
}
