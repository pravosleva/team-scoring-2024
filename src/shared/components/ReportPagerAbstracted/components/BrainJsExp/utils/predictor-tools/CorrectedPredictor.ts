import {
  TaskNode,
} from '~/shared/components/ReportPagerAbstracted/components/types';

export class CorrectedPredictor {
  predictTaskDuration(taskNode: TaskNode) {
    const task = taskNode.model;
    const now = Date.now();

    // 1. Получаем общую длительность (от начала до конца)
    const totalDuration = this.calculateTotalDuration(taskNode);

    // 2. Вычисляем оставшееся время
    let remainingDays: number;

    if (task.forecast?.start) {
      // Задача УЖЕ начата
      const startTime = task.forecast.start;
      const elapsedDays = (now - startTime) / (1000 * 60 * 60 * 24);

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

    return {
      task: task.title,
      totalDuration: Math.round(totalDuration),
      elapsedDays: task.forecast?.start ? Math.round((now - task.forecast.start) / (1000 * 60 * 60 * 24)) : 0,
      remainingDays: Math.round(remainingDays),
      predictedCompletion: new Date(now + remainingDays * 24 * 60 * 60 * 1000),
      status: task.forecast?.start ? 'in-progress' : 'not-started'
    };
  }

  private calculateTotalDuration(taskNode: TaskNode): number {
    // Ваш гибридный расчет общей длительности
    // const mlPrediction = 170; // из ML + эвристики
    // return mlPrediction;

    if (!taskNode.children || taskNode.children.length === 0) {
      return taskNode.model.completed ? 1 : 0;
    }

    const validChildren = taskNode.children.filter(child =>
      child.model.forecast?.complexity > 0
    );

    if (validChildren.length === 0) return 0;

    const completedValidChildren = validChildren.filter(child =>
      child.model.completed
    ).length;

    return (completedValidChildren / validChildren.length);
  }
}