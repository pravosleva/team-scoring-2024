import { memo, useEffect, useState } from 'react'
// import clsx from 'clsx'
import baseClasses from '~/App.module.scss'
import { CollapsibleBox, SingleTextManager } from '~/shared/components'
import CircularProgress from '@mui/material/CircularProgress'
import { Alert } from '@mui/material'
import { TaskTreePredictor, TaskNode, HybridPredictor, CorrectedPredictor } from './utils'

/*
const predictor = new TaskTreePredictor();
const hybridPredictor = new HybridPredictor(predictor);

// Обучаем обычную модель
await predictor.trainOnTaskTree(yourTaskTree);

// Используем гибридный подход для прогноза
const rootTask = yourTaskTree;
const realisticPrediction = hybridPredictor.predictTaskDuration(rootTask);

console.log('🎯 РЕАЛИСТИЧНЫЙ ПРОГНОЗ:');
console.log(`Задача: ${realisticPrediction.task}`);
console.log(`Сложность: ${rootTask.model.forecast.complexity}/5`);

if ('combined' in realisticPrediction && realisticPrediction.combined) {
  console.log(`├─ ML прогноз: ${realisticPrediction.mlPrediction} дней`);
  console.log(`├─ Эвристика: ${realisticPrediction.heuristicPrediction} дней`);
  console.log(`├─ Вес ML: ${realisticPrediction.mlWeight}`);
  console.log(`├─ Вес эвристики: ${realisticPrediction.heuristicWeight}`);
  console.log(`└─ ФИНАЛЬНЫЙ прогноз: ${realisticPrediction.predictedDays} дней`);
} else {
  console.log(`Прогноз: ${realisticPrediction.predictedDays} дней`);
}
*/

type TResult = {
  common: {
    header: string;
  };
  correctedWay: {
    header: string;
    descr: string;
    msgs: string[];
  };
  hybridWay: {
    header: string;
    descr: string;
    msgs: string[];
  };
}
async function main(yourTaskTree: TaskNode): Promise<TResult> {
  const __resultTemplate: TResult = {
    common: {
      header: 'Not modified',
    },
    correctedWay: {
      header: 'Not modified',
      descr: '',
      msgs: [],
    },
    hybridWay: {
      header: 'Not modified',
      descr: '',
      msgs: [],
    },
  }
  const predictor = new TaskTreePredictor();

  const correctedPredictor = new CorrectedPredictor();

  // Обучаем обычную модель
  let isErrored = false
  await predictor.trainOnTaskTree(yourTaskTree)
    .catch((err) => {
      __resultTemplate.hybridWay.header = '🎯 Гибридный прогноз'
      __resultTemplate.hybridWay.msgs = [err?.message || 'No err?.message']
      isErrored = true
    });
  if (isErrored)
    return Promise.reject(__resultTemplate)

  const hybridPredictor = new HybridPredictor(predictor);
  // const analyzer = new TaskAnalyzer(predictor);

  // Используем гибридный подход для прогноза
  const rootTask = yourTaskTree;
  const hybridPrediction = hybridPredictor.predictTaskDuration(rootTask);
  __resultTemplate.hybridWay.header = '🎯 Гибридный прогноз'

  const correctedPrediction = correctedPredictor.predictTaskDuration(rootTask);
  __resultTemplate.common.header = `Задача: ${correctedPrediction.task} (сложность ${rootTask.model.forecast.complexity}/5)`
  __resultTemplate.correctedWay.header = '📊 Скорректированный прогноз'

  __resultTemplate.correctedWay.msgs.push(`Общая длительность: ${correctedPrediction.totalDuration} дней`)
  __resultTemplate.correctedWay.msgs.push(`Прошло с начала: ${correctedPrediction.elapsedDays} дней`)
  __resultTemplate.correctedWay.msgs.push(`Осталось работать: ${correctedPrediction.remainingDays} дней`)
  __resultTemplate.correctedWay.msgs.push(`Предполагаемое завершение: ${correctedPrediction.predictedCompletion.toLocaleDateString()}`)

  if (correctedPrediction.remainingDays === 0) {
    const fuckupDaysLen = correctedPrediction.elapsedDays - correctedPrediction.totalDuration
    __resultTemplate.correctedWay.msgs.push('')
    __resultTemplate.correctedWay.msgs.push('🚨 Критическая проблема!')
    __resultTemplate.correctedWay.msgs.push(`Ваша задача должна была быть завершена ${fuckupDaysLen} дней назад!`)
    __resultTemplate.correctedWay.msgs.push('Это означает, что либо:')
    __resultTemplate.correctedWay.msgs.push('1. ML-модель сильно недооценивает сложность')
    __resultTemplate.correctedWay.msgs.push('2. Задача заблокирована внешними факторами')
    __resultTemplate.correctedWay.msgs.push('3. Первоначальная оценка была нереалистичной')

    // -- NOTE: Exp
    // __resultTemplate.correctedWay.msgs.push('Что предлагается сделать в коде:')
    // __resultTemplate.correctedWay.msgs.push('Вариант 1: Переоценить задачу')
    // __resultTemplate.correctedWay.msgs.push('Вариант 2: Учесть блокеры (Добавить время на непредвиденные обстоятельства)')
    // --
  }

  // if (stats) {
  //   // Анализ
  //   const results = analyzer.analyzeValidTasks(yourTaskTree);
  //   analyzer.printAnalysis(results);

  //   // Индивидуальный прогноз
  //   const prediction = predictor.predictTaskDuration(yourTaskTree);

  //   if ('error' in prediction) {
  //     msgs.push(`❌ ${prediction.error}: ${prediction.reason}`);
  //   } else {
  //     msgs.push('🎯 Индивидуальный прогноз:');
  //     msgs.push(`Задача: ${prediction.task}`);
  //     msgs.push(`Сложность: ${prediction.complexity}/5`);
  //     msgs.push(`Предсказанная длительность: ${prediction.predictedDays} дней`);
  //     msgs.push(`Уверенность: ${prediction.confidence}%`);
  //   }
  //   return Promise.resolve(msgs.join('\n'))
  // }
  // return Promise.reject('No stats')

  if (!!hybridPrediction.__message) {
    __resultTemplate.hybridWay.msgs.push(hybridPrediction.__message)
  }

  if ('combined' in hybridPrediction && hybridPrediction.combined) {
    // __resultTemplate.hybridWay.msgs.push('Тестируем новый подход: Расчет без привязки к конкретному сотруднику, для текущей незавершенной задачи ML-инструмент в целом изучил тренды по всем решеным задачам (имеющим оценку от 1 до 5), в результате чего интуитивный анализ для текущей задачи выглядит примерно так:')
    __resultTemplate.hybridWay.msgs.push(`ML прогноз: ${hybridPrediction.mlPrediction} дней`);
    __resultTemplate.hybridWay.msgs.push(`Эвристика: ${hybridPrediction.heuristicPrediction} дней`);
    __resultTemplate.hybridWay.msgs.push(`Вес ML: ${hybridPrediction.mlWeight}`);
    __resultTemplate.hybridWay.msgs.push(`Вес эвристики: ${hybridPrediction.heuristicWeight}`);
    __resultTemplate.hybridWay.msgs.push(`👉 Финальный прогноз: ${hybridPrediction.predictedDays} дней`);
    __resultTemplate.hybridWay.msgs.push(`Прошло с начала: ${hybridPrediction.elapsedDays} дней`)
    __resultTemplate.hybridWay.msgs.push(`Осталось работать: ${hybridPrediction.remainingDays} дней`)
    if (!!hybridPrediction.targetDateTs) {
      __resultTemplate.hybridWay.msgs.push(`Ориентировочная дата релиза: ${new Date(hybridPrediction.targetDateTs).toLocaleDateString()}`)
    }
    if (!rootTask.model.completed && hybridPrediction.remainingDays === 0) {
      const fuckupDaysLen = Math.round(hybridPrediction.elapsedDays - hybridPrediction.totalDays)
      __resultTemplate.hybridWay.msgs.push('')
      __resultTemplate.hybridWay.msgs.push('🚨 Критическая проблема!')
      __resultTemplate.hybridWay.msgs.push(`Ваша задача должна была быть завершена ${fuckupDaysLen} дней назад!`)
      __resultTemplate.hybridWay.msgs.push('Это означает, что либо:')
      __resultTemplate.hybridWay.msgs.push('1. ML-модель сильно недооценивает сложность')
      __resultTemplate.hybridWay.msgs.push('2. Задача заблокирована внешними факторами')
      __resultTemplate.hybridWay.msgs.push('3. Первоначальная оценка была нереалистичной')
    }
    return Promise.resolve(__resultTemplate)
  } else {
    __resultTemplate.hybridWay.msgs.push(`👉 Прогноз: ${hybridPrediction.predictedDays} дней`)
    if (!!hybridPrediction.targetDateTs) {
      __resultTemplate.hybridWay.msgs.push(`Ориентировочная дата релиза: ${new Date(hybridPrediction.targetDateTs).toLocaleDateString()}`)
    }
    if (!rootTask.model.completed && hybridPrediction.remainingDays === 0) {
      const fuckupDaysLen = Math.round(hybridPrediction.elapsedDays - hybridPrediction.totalDays)
      __resultTemplate.hybridWay.msgs.push('')
      __resultTemplate.hybridWay.msgs.push('🚨 Критическая проблема!')
      __resultTemplate.hybridWay.msgs.push(`Ваша задача должна была быть завершена ${fuckupDaysLen} дней назад!`)
      __resultTemplate.hybridWay.msgs.push('Это означает, что либо:')
      __resultTemplate.hybridWay.msgs.push('1. Эвристика сильно недооценивает сложность (необходимо донастроить)')
      __resultTemplate.hybridWay.msgs.push('2. Задача заблокирована внешними факторами')
      __resultTemplate.hybridWay.msgs.push('3. Первоначальная оценка была нереалистичной')
    }
  }
  return Promise.reject(__resultTemplate)
}

type TProps = {
  tree: TaskNode;
}

export const BrainJsExp = memo(({ tree }: TProps) => {
  const [report, setReport] = useState<TResult | null>(null)
  useEffect(() => {
    main(tree)
      .then((r) => setReport(r))
      .catch((e) => setReport(e))
  }, [tree])
  return (
    <div className={baseClasses.stack2}>
      <CollapsibleBox
        header={<span>About Machine Learning & Heuristic</span>}
        text={(
          <div className={baseClasses.stack1}>
            <div>
              <b>Machine Learning (Машинное обучение)</b> — это когда компьютер не просто выполняет команды, написанные программистом, а учится сам на примерах и данным.
              Представьте, что вы учите ребенка отличать кошку от собаки. Вы не объясняете ему теорию (размер ушей, форму хвоста), а просто показываете много картинок и говорите: «Это кошка», «Это собака». Со временем ребенок сам начинает видеть закономерности и правильно определять животных.
              Машинное обучение — это то же самое, но для компьютера.
            </div>
            <em>
              Как это работает? Простая аналогия:
            </em>
            <pre className={baseClasses.preNormalized}>
              {
                [
                  '1. Данные (Учебники). Вы даете компьютеру кучу примеров. Например, тысячи помеченных фотографий: «кошка», «собака», «кошка», «собака».',
                  '2. Обучение (Учеба). Компьютер ищет в этих фотографиях закономерности. Сам по себе. Например, он может заметить, что у кошек часто более острые уши, а у собак — более вытянутые морды. Он создает свою внутреннюю «модель» (правила для распознавания).',
                  '3. Прогноз (Экзамен). После обучения вы показываете компьютеру новую, незнакомую фотографию и спрашиваете: «Кто это?». Компьютер применяет свою созданную модель и говорит: «Я на 95% уверен, что это кошка».',
                ].join('\n')
              }
            </pre>
            <em>
              Где вы с этим сталкиваетесь каждый день:
            </em>
            <pre className={baseClasses.preNormalized}>
              {
                [
                  '· Рекомендации: Когда Netflix или YouTube предлагают вам фильм или видео — это ML анализировал, что вы смотрели раньше, и подобрал похожее.',
                  '· Голосовые помощники: Siri, Алиса или Алекса понимают вашу речь, потому что были обучены на миллионах голосовых записей.',
                  '· Беспилотные автомобили: Они учатся распознавать дорогу, знаки, пешеходов и другие машины, просматривая миллионы часов видео.',
                  '· Поиск в Google: Система не просто ищет слова, а пытается понять смысл вашего запроса и выдать самый релевантный результат.',
                  '· Банки: ML анализирует ваши транзакции и может заметить подозрительную активность, которая похожа на мошенническую.',
                  '· Фотокамеры в смартфоне: Когда камера автоматически определяет, что в кадре человек или ночной пейзаж, и настраивается — это тоже ML.',
                ].join('\n')
              }
            </pre>
            <em>
              Чем ML отличается от обычной программы?
            </em>
            <pre className={baseClasses.preNormalized}>
              {
                [
                  '· Обычная программа: Программист пишет точные правила.',
                  '· Пример: ЕСЛИ введенный символ "@", ТО это email.',
                  '· Машинное обучение: Программист создает алгоритм, который сам находит правила в данных.',
                  '· Пример: Алгоритму показывают миллионы писем (спам и не спам). Он сам учится отличать спам по тысячам признаков (определенные слова, отправитель, тема и т.д.).',
                ].join('\n')
              }
            </pre>
            <Alert variant='filled' severity='info'>
              <div className={baseClasses.stack1}>
                <b>Итог простыми словами</b>
                <span>Machine Learning — это наука о том, как заставить компьютеры учиться на опыте и находить скрытые закономерности в данных, чтобы принимать решения или делать прогнозы</span>
              </div>
            </Alert>
            <div>
              <b>Эвристика</b> — это практический метод решения задачи, который не гарантирует оптимальности, но работает достаточно хорошо в большинстве практических ситуаций. Это "правило большого пальца" или упрощенный алгоритм, основанный на опыте и интуиции.
            </div>
            <em>🎯 Простая аналогия</em>
            <pre className={baseClasses.preNormalized}>
              Эвристика — как опытный повар, который "на глаз" определяет количество специй.
              Точный алгоритм — как точные кулинарные весы, отмеряющие до грамма.
            </pre>
            <em>🎯 Преимущества эвристик:</em>
            <pre className={baseClasses.preNormalized}>
              {
                [
                  '· Быстрые — не требуют обучения',
                  '· Понятные — правила ясны человеку',
                  '· Надежные — работают даже при плохих данных',
                  '· Гибкие — легко добавлять новые правила',
                ].join('\n')
              }
            </pre>
            <em>⚠️ Ограничения эвристик:</em>
            <pre className={baseClasses.preNormalized}>
              {
                [
                  '· Субъективны — зависят от опыта человека',
                  '· Не оптимальны — могут не найти лучшего решения',
                  '· Требуют обновления — правила устаревают',
                ].join('\n')
              }
            </pre>
            <Alert variant='filled' severity='info'>
              Эвристика в вашем случае — это набор разумных правил, основанных на опыте разработки, которые помогают исправить явно нереалистичные прогнозы ML-модели, обученной на ограниченных данных.
            </Alert>
          </div>
        )}
      />
      {
        !report?.hybridWay && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <CircularProgress />
          </div>
        )
      }
      {
        !!report?.hybridWay && (
          <>
            <SingleTextManager
              infoLabel={report.hybridWay?.header || 'No header'}
              initialState={{
                text: report.hybridWay?.msgs.join('\n'),
              }}
              isEditable={false}
              isDeletable={false}
            />
            {/* <SingleTextManager
              infoLabel={report.correctedWay.header}
              initialState={{ text: report.correctedWay.msgs.join('\n') }}
              isEditable={false}
              // buttonText=''
              isDeletable={false}
            // onDelete={({ cleanup }) => {}}
            // onSuccess={({ state }) => {}}
            /> */}
          </>
        )
      }
      {/* <pre
        className={clsx(
          baseClasses.preNormalized,
        )}
      >
        {report || 'Wait...'}
      </pre> */}
    </div>
  )
})
