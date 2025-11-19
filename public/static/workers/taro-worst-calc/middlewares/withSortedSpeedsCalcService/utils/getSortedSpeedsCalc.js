importScripts('./middlewares/withSortedSpeedsCalcService/utils/getMedian.js')

/**
 * Класс для расчетов вероятностей
 *
 * @class Probability
 * @typedef {Probability}
 */
/**
 * @typedef {Object} TJobRelations Описание связей
 * @property {number|null} parent - Задача-родитель
 * @property {number[]} children - Задачи-дети
 */
/**
 * @typedef {Object} TForecast Описание параметров для расчета прогнозов (только полная конфигурация данных может дать возможность прогнозировать задачи, основываясь на этих данных)
 * @property {number|undefined} assignedTo - ID исполнителя на которого назначено
 * @property {number|null|undefined} estimate - Дата прогноза исполнителем
 * @property {number|null|undefined} start - Дата фактического старта
 * @property {number|null|undefined} finish - Дата фактического завершения задачи
 * @property {number} complexity - Оценка сложности от исполнителя (от 1 до 5); Либо 0 (для неоцененных); Либо 6 (для непредсказуемых)
 * @property {string|undefined} comment - Комментарий
 */
/**
 * @typedef {Object} TLogChecklistItem Описание микрозадачи внутри лога
 * @property {string} title Текст микрозадачи
 * @property {string} descr Описание микрозадачи
 * @property {boolean} isDone
 * @property {boolean} isDisabled Возможность скрыть из списков текущих микрозадач в текстовом отчете
 * @property {*} links Не используется
 * @property {number} id ID микрозадачи
 * @property {Object} ts
 * @property {number} ts.createdAt Создание микрозадачи
 * @property {number} ts.updatedAt Обновление микрозадачи
 */
/**
 * @typedef {Object} TLogLink Описание ссылки
 * @property {number} id ID лога
 * @property {string} url URL ссылки
 * @property {string} title Заголовок ссылки
 * @property {string} descr Описание ссылки
 */
/**
 * @typedef {Object} TLogsItem Описание лога
 * @property {number} ts Дата лога
 * @property {string} text Текст лога
 * @property {number|undefined} progress Прогресс задачи на момент создания лога
 * @property {TLogLink[]} links Массив ссылок
 * @property {boolean} useTextAsTitle Пока не используется (wtf?)
 * @property {TLogChecklistItem[]} checklist Чек-лист в рамках текущего лога (микрозадачи)
 */
/**
 * @typedef {Object} TLogsObject Объект для хранения истории о ходе выполнения задачи
 * @property {number} limit Лимит сообщений для хранения (при превышении ранние будут удаляться)
 * @property {boolean} isEnabled Настройка подробных логов (если активна - будет запрашиваться комментарий при каждом обновлении задачи)
 * @property {TLogsItem[]} items Массив логов для данной задачи
 */

/**
 * @typedef {Object} TJob Задача
 * @property {number} id ID задачи
 * @property {string} title Заголовок
 * @property {string} descr Описание
 * @property {boolean} completed Индикатор завершенности
 * @property {TForecast} forecast Объект для расчетов вероятностей
 * @property {Object} ts Объект для временных точек
 * @property {number} ts.create Дата создания задачи
 * @property {number} ts.update Дата обновления задачи
 * @property {TLogsObject} logs Объект для логов (и для ведения истории)
 * @property {number|undefined} v Скорость, расчитанная последний раз
 * @property {TJobRelations} relations Объект для описания связей с другими задачами
 */
class Probability {
  /**
   * Создает инстанс класса Probability.
   *
   * @constructor
   * @param {Object} arg 
   * @param {TJob[]} arg.theJobList Список задач
   * @param {number} arg.sensibility Специальный коэффициент для большего охвата задач {@link https://habr.com/ru/articles/874226/ Описано на хабре}
   * @param {Object} arg.ts 
   * @param {number} arg.ts.testStart Дата Старта
   * @param {number} arg.ts.testDiff Разница между датой Анонса и датой Старта
   */
  constructor({ theJobList, sensibility, ts }) {
    this.jobs = theJobList
    this.sensibility = sensibility
    if (!!ts) this.ts = ts
    this.speeds = this.jobs.map(
      (e) => ({
        v: ((e.forecast.estimate) / 1000 - (e.forecast.start) / 1000) / ((e.forecast.finish) / 1000 - (e.forecast.start) / 1000),
        id: e.id,
      })
    )
    this.sortedSpeeds = this.speeds.sort((e1, e2) => e1.v - e2.v)
  }
  get sensedInfo() {
    const deltas = []
    let minDelta = 1000000
    let maxDelta = 0

    for (let i = 0, max = this.sortedSpeeds.length; i < max; i++) {
      const prevValue = !!this.sortedSpeeds[i - 1]
        ? this.sortedSpeeds[i - 1]
        : null
      const nextValue = !!this.sortedSpeeds[i + 1]
        ? this.sortedSpeeds[i + 1]
        : null
      const currentValue = this.sortedSpeeds[i]
      const delta = typeof prevValue?.v === 'number'
        ? currentValue.v - (prevValue.v)
        : null
      deltas.push({
        id: this.sortedSpeeds[i].id,
        speed: this.sortedSpeeds[i].v,
        delta,
        next: nextValue?.v || null,
        prev: prevValue?.v || null,
        isSensed: false,
      })
      if (typeof delta === 'number') {
        if (minDelta >= delta) minDelta = delta
        if (maxDelta <= delta) maxDelta = delta
      }
    }
    const deltasInfo = {
      all: deltas,
      min: minDelta,
      max: maxDelta,
    }
    const result = {
      counter: 0,
      speedValues: [],
      averageSpeed: 0,
      deltasInfo,
    }
    for (let i = 0, max = deltasInfo.all.length; i < max; i++) {
      if ((deltasInfo.all[i].delta) <= this.sensibility * deltasInfo.min) {
        deltasInfo.all[i].isSensed = true

        // NOTE: Предыдущий кейс тоже надо учесть,
        // т.к. он также соответствует комфортной работе
        if (i >= 1) deltasInfo.all[i - 1].isSensed = true

        if (typeof deltasInfo.all[i].speed === 'number') {
          result.counter += 1
          result.speedValues.push((deltasInfo.all[i].speed))
        }
      }
      else
        deltasInfo.all[i].isSensed = false
    }
    result.averageSpeed = getMedian(result.speedValues)

    return result
  }
  get dates() {
    if (!this.ts) return null
    else {
      const testPredSorted = this.sortedSpeeds
        .map(({ v }) => (this.ts?.testDiff) / v)
        .sort((e1, e2) => e1 - e2)

      const bestValue = testPredSorted[0]
      const worstValue = testPredSorted[testPredSorted.length - 1]
      const averageValue =
        testPredSorted.length % 2 === 0
          ? Math.floor(
            getMedian([
              testPredSorted[Math.floor(testPredSorted.length / 2) - 1],
              testPredSorted[Math.floor(testPredSorted.length / 2)],
            ])
          )
          : Math.floor(testPredSorted[Math.floor(testPredSorted.length / 2)])

      return {
        best: bestValue + this.ts.testStart,
        worst: worstValue + this.ts.testStart,
        average: averageValue + this.ts.testStart,
        sensedAverage: (this.ts.testDiff / this.sensedInfo.averageSpeed) + this.ts.testStart,
      }
    }
  }
}

/**
 * @typedef {Object} TSortedSpeedsDeltaItem Результат основного расчета сценариев
 * @property {number} id ID задачи
 * @property {number} speed Значение скорости
 * @property {number|null} delta Отклонение от предыдущей скорости
 * @property {number|null} next Следующая скорость
 * @property {number|null} prev Предыдущая скорость
 * @property {boolean} isSensed Индикатор показывает, имеет ли смысл эта скорость для расчета сценариев
 */
/**
 * @typedef {Object} TSortedSpeedsCalcResult Результат основного расчета сценариев
 * @property {number[]} sortedSpeeds Отсортированные скорости выполнения задач
 * @property {Object} delta Информация об относительных отклонениях скоростей друг от друга
 * @property {TSortedSpeedsDeltaItem[]} delta.items Массив отклонений
 * @property {number} delta.min Минимальное отклонение
 * @property {number} delta.max Максимальное отклонение
 * @property {Object} sensed
 * @property {number} sensed.averageSpeed Медианная скорость
 * @property {number} sensed.counter
 * @property {number[]} sensed.speedValues Значения скоростей
 * @property {Object} dates Результат в виде дат
 * @property {number} dates.best Лучший сценарий
 * @property {number} dates.worst Худший сценарий
 * @property {number} dates.average Среднее медианное
 * @property {number} dates.sensedAverage Среднее медианное (ощущаемое); Расчитано как: (тестируемая_разница / медианная_скорость) + тестируемый_старт
 * @property {number} sensibility Дополнительны коэффициент охвата задач
 */
/**
 * Функция для финального расчета вероятностной даты скорректированного прогноза
 *
 * @param {Object} arg 
 * @param {TJob[]} arg.theJobList Список задач
 * @param {number} arg.sensibility Специальный коэффициент для большего охвата задач {@link https://habr.com/ru/articles/874226/ Описано на хабре}
 * @param {Object} arg.ts
 * @param {number} arg.ts.testStart Дата Старта
 * @param {number} arg.ts.testDiff Разница между датой Анонса и датой Старта
 * @returns {TSortedSpeedsCalcResult}
 */
const getSortedSpeedsCalc = ({ theJobList, sensibility, ts }) => {
  const probExp = new Probability({ sensibility, theJobList, ts })
  const {
    sortedSpeeds,
    sensedInfo: {
      deltasInfo,
      averageSpeed,
      counter,
      speedValues,
    },
    dates,
  } = probExp

  return {
    sortedSpeeds,
    delta: {
      items: deltasInfo.all,
      min: deltasInfo.min,
      max: deltasInfo.max,
    },
    sensed: {
      averageSpeed,
      counter,
      speedValues,
    },
    dates,
    sensibility,
  }
}
