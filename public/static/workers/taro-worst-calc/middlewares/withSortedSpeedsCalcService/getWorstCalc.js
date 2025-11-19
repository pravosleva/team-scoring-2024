importScripts('./middlewares/withSortedSpeedsCalcService/utils/getSortedSpeedsCalc.js')

/**
 * @typedef {Object} TWorstCalcResult Результат расчета
 * @property {number} averageSpeed Медианная скорость
 * @property {*} averageValue (wip)
 * @property {number} date0 Дата лучшего сценария
 * @property {number} date50 Дата с вероятностью 50% (целевое зачение)
 * @property {number} date100 Дата худшего сценария
 * @property {number} dateSensed Дата "ощущаемого" сценария
 * @property {TSortedSpeedsCalcResult} sortedSpeedsCalcOutput Результат расчета внутренней функции
 */
/**
 * Функция для расчета всех сценариев
 *
 * @param {Object} arg 
 * @param {TJob[]} arg.theJobList Массив задач для расчета
 * @param {Object} arg.ts Объект с временными точками
 * @param {number} arg.ts.testStart Дата Старта
 * @param {number} arg.ts.testDiff Разница между датой Анонса и датой Старта
 * @returns {TWorstCalcResult} 
 */
const getWorstCalc = ({ theJobList, ts }) => {
  const result = {
    averageSpeed: 0,
    averageValue: 0,
    date0: 0,
    date50: 0,
    date100: 0,
    dateSensed: 0,
    sortedSpeedsCalcOutput: null,
  }
  // NOTE: testDiff = testFinish - testStart;

  if (theJobList.length === 0 || ts.testDiff === 0) {
    result.averageSpeed = 1
    result.averageValue = ts.testStart
  } else {
    const speedsCalc = getSortedSpeedsCalc({
      theJobList,
      sensibility: 4,
      ts,
    })

    result.averageSpeed = getMedian(speedsCalc.sortedSpeeds.map(({ v }) => v))
    // result.averageValue = averageValue
    result.date0 = (speedsCalc.dates?.best)
    result.date50 = (speedsCalc.dates?.average)
    result.date100 = (speedsCalc.dates?.worst)
    result.dateSensed = (speedsCalc.dates?.sensedAverage)
    result.sortedSpeedsCalcOutput = speedsCalc
  }
  return result
}
