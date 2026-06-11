console.log('[LOADED] pointset-tree-calc/middlewares/utils/calc.v2')

importScripts('./middlewares/utils/math-ops/getPercentage.js')
// importScripts('./middlewares/utils/math-ops/getCondited@5.0.1.js')
importScripts('./middlewares/utils/math-ops/getCondited/utils/wrapText.js')
importScripts('./middlewares/utils/math-ops/getCondited/utils/generateMobileAscii.js')
importScripts('./middlewares/utils/math-ops/getCondited/utils/generateRecommendations.js')
importScripts('./middlewares/utils/math-ops/getCondited/utils/getTrendAndForecast.js')
importScripts('./middlewares/utils/math-ops/getCondited/getCondited@5.0.2.js')

const withTsTreeLibCalcService = async ({ eventData, cb }) => {
  const { __eType, input } = eventData

  if (__eType !== NES.Common.WorkerService.CLIENT_TO_WORKER_MESSAGE) return
  const opsEventType = eventData?.input?.opsEventType
  if (opsEventType !== NES.Common.ClientService.PointsetTreeCalc.EClientToWorkerEvent.GET_POINTSET_TREE_CALC) return

  const output = { ok: false, message: 'Output data not modified' }

  try {
    // 1. Быстрый индекс для поиска точек за O(1)
    const __pointsMap = new Map()
    for (const point of input.pointset) {
      __pointsMap.set(point.id, point)
    }

    // Кэш для мемоизации уже построенных узлов дерева (чтобы не строить дважды)
    const nodeCache = new Map()
    let _c = 0

    // Вспомогательная функция для сборки объекта узла
    const buildNode = (point) => {
      if (nodeCache.has(point.id)) {
        return nodeCache.get(point.id)
      }

      _c++ // Инкремент счетчика создания уникальных узлов
      const childrenIds = point.relations?.children || []

      // Оптимизированное создание структуры о детях (без лишних проверок)
      const nodesInfo = []
      const validChildrenNodes = []

      for (const id of childrenIds) {
        const childPoint = __pointsMap.get(id)
        if (childPoint) {
          nodesInfo.push({
            originalPoint: {
              id: childPoint.id,
              title: childPoint.title,
              descr: childPoint.descr,
              isDone: childPoint.isDone,
              isDisabled: childPoint.isDisabled,
              statusCode: childPoint.statusCode,
            },
            nodeId: `point_node_${id}`
          })
          // Рекурсивно собираем дочерний узел
          validChildrenNodes.push(buildNode(childPoint))
        }
      }

      // Сортировка детей по убыванию ts.update
      validChildrenNodes.sort((a, b) => b.model.ts.update - a.model.ts.update)

      const nodeData = {
        model: {
          id: point.id,
          title: point.title,
          ts: point.ts,
          descr: point.descr,
          isDone: point.isDone,
          isDisabled: point.isDisabled,
          statusCode: point.statusCode,
          relations: point.relations,
          _service: {
            aboutPoint: {
              existingChildrenNodes: { nodesInfo }
            },
            recursionCounter: _c, // Уникальный порядковый номер создания узла
            logs: ['Node created'],
          },
        },
        children: validChildrenNodes
      }

      nodeCache.set(point.id, nodeData)
      return nodeData
    }

    // 2. Поиск истинного корня дерева (поднимаемся вверх до упора)
    let rootPoint = input.rootPoint
    const visitedParents = new Set() // Защита от зацикливания

    while (rootPoint?.relations?.parent) {
      const pId = rootPoint.relations.parent
      if (visitedParents.has(pId)) break // Найдено зацикливание в данных
      visitedParents.add(pId)

      const parentPoint = __pointsMap.get(pId)
      if (!parentPoint) {
        throw new Error(`parentPoint with id=${pId} не существует`)
      }
      rootPoint = parentPoint
    }

    // 3. Построение дерева (Выполняется ровно ОДИН раз благодаря кэшу)
    const calc = buildNode(rootPoint)

    output.ok = true
    output.message = `Calculated; getNodeDataStandart called ${_c} times`

    // 4. Оптимизированная генерация строкового отчета (Псевдографика)
    const counters = { total: 0 }
    const percentage = { done: [] }
    const reportLines = []

    const generateReport = (node, level, isLast, parentPrefix) => {
      counters.total += 1
      const { model, children } = node

      // Формирование заголовка (вынесено из callback для скорости)
      const status = input.statusPack[model.statusCode]
      const label = clsx(
        status?.emoji,
        model.title,
        status?.label ? `[${status.label}]` : undefined
      )

      // Сборка текущей строки дерева
      const branchChar = level === 0 ? '' : (isLast ? '└─ ' : '├─ ')
      reportLines.push(`${parentPrefix}${branchChar}${label}`)

      // Добавление описания, если есть
      if (model.descr) {
        const indent = '   '.repeat(level)
        reportLines.push(`${indent}   ${model.descr}`)
      }

      // Вычисление префикса для следующих поколений (исправлен баг с Map.set)
      let nextPrefix = parentPrefix
      if (level > 0) {
        nextPrefix += isLast ? '   ' : '│  '
      }

      const len = children.length
      for (let i = 0; i < len; i++) {
        generateReport(children[i], level + 1, i === len - 1, nextPrefix)
      }
    }

    // Запуск генератора отчета
    generateReport(calc, 0, true, '')

    // 5. Формирование финального ответа
    const readyStuffAnalysis = getCondited({
      fragments: [{ valueFragment: 'ready*', path: 'statusCode' }],
      pointset: input.pointset,
      allowedEmojies: ['✅', '☑️', '🟢'],
      cfg: input.statusPack,
      _sensedSpeed: input._sensedSpeed,
    }).analyse
    output.originalResponse = {
      calc,
      report: { targetTree: reportLines.join('\n') },
      etc: {
        counters: {
          ...counters,
          ready: readyStuffAnalysis,
          wip: getCondited({
            fragments: [{ valueFragment: 'wip*', path: 'statusCode' }],
            pointset: input.pointset,
            allowedEmojies: ['🟡', '🔥'],
            cfg: input.statusPack,
          }).analyse,
          wait: getCondited({
            fragments: [
              { valueFragment: 'wait*', path: 'statusCode' },
              { valueFragment: 'blocker*', path: 'statusCode' },
            ],
            pointset: input.pointset,
            allowedEmojies: ['🟡', '🔴'],
            cfg: input.statusPack,
          }).analyse,
          paused: getCondited({
            fragments: [
              { valueFragment: 'paused*', path: 'statusCode' },
            ],
            pointset: input.pointset,
            allowedEmojies: ['⏸️'],
            cfg: input.statusPack,
          }).analyse,
        },
        percentage,
      },
    }

  } catch (err) {
    output.ok = false
    output.message = `Worker error: ${err?.message || 'No message'}; pointset-tree-calc/middlewares/utils/math-ops/calc.v2`
  } finally {
    cb[input?.opsEventType || eventData?.input?.opsEventType]({ output, input })
  }
}
