// Альтернатива: Используем эвристики + ML
import {
  TaskNode,
} from '../../../types';
import { TaskTreePredictor } from './TaskTreePredictor';
import clsx from 'clsx';

export class HybridPredictor {
  private predictor: TaskTreePredictor;

  constructor(predictor: TaskTreePredictor) {
    this.predictor = predictor;
  }

  predictTaskDuration(taskNode: TaskNode) {
    const mlPrediction = this.predictor.predictTaskDuration(taskNode);
    const serviceMsgs = []

    // Если ML prediction ошибка, используем только эвристику
    if ('error' in mlPrediction) {
      const heuristicPrediction = this.getHeuristicPrediction(taskNode);
      const normalizedPredictionTs = heuristicPrediction * (1000 * 60 * 60 * 24);

      serviceMsgs.push('⚠️ ML prediction Errored:')
      if (!!mlPrediction.reason) serviceMsgs.push(mlPrediction.reason)

      serviceMsgs.push('Используем только эвристику')

      const finalPrediction = heuristicPrediction;
      // -- NOTE: Exp
      const task = taskNode.model;
      const nowTs = Date.now();
      // 1. Получаем общую длительность (от начала до конца)
      const totalDuration = finalPrediction
      // 2. Вычисляем оставшееся время
      let __remainingDays: number;
      let __elapsedDays: number = 0;
      if (!!task.forecast?.start) {
        // Задача УЖЕ начата
        const startTs = task.forecast?.start;
        const elapsedDays = (nowTs - startTs) / (1000 * 60 * 60 * 24);
        __elapsedDays = elapsedDays
        if (elapsedDays >= totalDuration) {
          // Уже должны были закончить
          __remainingDays = 0;
        } else {
          // Вычисляем оставшееся время
          __remainingDays = totalDuration - elapsedDays;
        }
      } else {
        // Задача ЕЩЁ НЕ начата
        __remainingDays = totalDuration;
      }
      // --

      return {
        task: taskNode.model.title,
        taskId: taskNode.model.id,
        predictedDays: Math.round(heuristicPrediction),
        confidence: 50,
        method: 'heuristic-only',
        heuristicPrediction,
        __message: clsx(...serviceMsgs),
        totalDays: heuristicPrediction,

        elapsedDays: __elapsedDays,
        remainingDays: __remainingDays,
        targetDateTs: !!taskNode.model.forecast?.start ? taskNode.model.forecast.start + normalizedPredictionTs : null,
      };
    }

    const heuristicPrediction = this.getHeuristicPrediction(taskNode);

    // NOTE: Комбинируем подходы с весами (больше доверия эвристике для сложных задач)
    const complexity = taskNode.model.forecast.complexity;
    // NOTE: Для сложных задач меньше доверия ML
    const mlWeight = complexity <= 3 ? 0.7 : 0.3;

    serviceMsgs.push('✅ ML prediction is Ok: Комбинируем подходы с "весами";')
    if (complexity <= 3) {
      serviceMsgs.push(`Для простых задач (complexity: ${complexity}) больше доверия к ML, меньше доверия к эвристике`)
    } else {
      serviceMsgs.push(`Для сложных задач (complexity: ${complexity}) меньше доверия к ML, больше доверия к эвристике`)
    }

    const heuristicWeight = 1 - mlWeight;

    const finalPrediction =
      mlPrediction.predictedDays * mlWeight +
      heuristicPrediction * heuristicWeight;

    // -- NOTE: Exp
    const task = taskNode.model;
    const nowTs = Date.now();

    // 1. Получаем общую длительность (от начала до конца)
    const totalDuration = finalPrediction

    // 2. Вычисляем оставшееся время
    let remainingDays: number;
    let __elapsedDays: number = 0;
    if (task.forecast?.start) {
      // Задача УЖЕ начата
      const startTs = task.forecast?.start;
      const elapsedDays = (nowTs - startTs) / (1000 * 60 * 60 * 24);
      __elapsedDays = elapsedDays
      if (elapsedDays >= totalDuration) {
        // Уже должны были закончить
        remainingDays = 0;
      } else {
        // Вычисляем оставшееся время
        remainingDays = totalDuration - elapsedDays;
      }
    } else {
      // Задача ЕЩЁ НЕ начата
      remainingDays = totalDuration;
    }
    // --

    const finalServiceMsgs = []
    if (!taskNode.model.completed) {
      finalServiceMsgs.push([
        'Тестируем новый подход:',
        'Расчет без привязки к конкретному сотруднику и субъективному прогнозу от разработчика,',
        'для текущей незавершенной задачи ML-инструмент в целом изучил тренды по всем решеным задачам (имеющим оценку от 1 до 5) ->',
        'в результате чего интуитивный анализ для текущей задачи выглядит примерно так:'
      ].join(' '))
    }
    finalServiceMsgs.push(clsx(...serviceMsgs))

    return {
      ...mlPrediction,
      predictedDays: Math.round(finalPrediction),
      heuristicPrediction: Math.round(heuristicPrediction),
      mlPrediction: mlPrediction.predictedDays,
      combined: true,
      mlWeight,
      heuristicWeight,

      totalDays: totalDuration,
      elapsedDays: Math.round(__elapsedDays),
      remainingDays: Math.round(remainingDays),
      targetDateTs: !!task.forecast?.start ? task.forecast.start + totalDuration * (1000 * 60 * 60 * 24) : null,
      __message: finalServiceMsgs.join('\n'),
    };
  }

  private getHeuristicPrediction(taskNode: TaskNode): number {
    const task = taskNode.model;

    // Базовый расчет на основе сложности
    let baseDays = task.forecast.complexity * 3; // 1 сложность = 3 дней

    // Умножаем на количество и сложность детей
    const childrenWeight = this.calculateChildrenWeight(taskNode);
    baseDays *= childrenWeight;

    // Учитываем прогресс: если есть прогресс, уменьшаем оценку
    // const progress = this.calculateTaskProgress(taskNode);
    // baseDays *= (1 - progress * 0.3);

    return Math.max(7, baseDays); // минимум 1 неделя
  }

  private calculateChildrenWeight(taskNode: TaskNode): number {
    if (!taskNode.children || taskNode.children.length === 0) return 1;

    let weight = 1;
    let validChildrenCount = 0;

    taskNode.children.forEach(child => {
      switch (child.model.forecast?.complexity) {
        case 1:
        case 2:
        case 3:
          weight += child.model.forecast.complexity * 0.2;
          weight += this.calculateChildrenWeight(child);
          validChildrenCount++;
          break
        case 4:
          weight += child.model.forecast.complexity * 0.25;
          weight += this.calculateChildrenWeight(child);
          validChildrenCount++;
          break
        case 5:
          weight += child.model.forecast.complexity * 0.3;
          weight += this.calculateChildrenWeight(child);
          validChildrenCount++;
          break
        case 6:
          weight += child.model.forecast.complexity * 0.6;
          weight += this.calculateChildrenWeight(child);
          break
        default:
          break
      }
    });

    // Добавляем вес за количество детей
    weight += validChildrenCount * 0.1;

    // return Math.min(weight, 4) // максимум учетверяем "вес детей"
    return weight
  }

  // private calculateTaskProgress(taskNode: TaskNode): number {
  //   if (!taskNode.children || taskNode.children.length === 0) {
  //     return taskNode.model.completed ? 1 : 0;
  //   }

  //   const validChildren = taskNode.children.filter(child =>
  //     child.model.forecast?.complexity > 0
  //   );

  //   if (validChildren.length === 0) return 0;

  //   const completedValidChildren = validChildren.filter(child =>
  //     child.model.completed
  //   ).length;

  //   return completedValidChildren / validChildren.length;
  // }
}