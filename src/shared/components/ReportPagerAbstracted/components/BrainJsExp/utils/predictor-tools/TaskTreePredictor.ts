// TaskTreePredictor.ts
import * as brain from 'brain.js';
import {
  TaskNode,
  TrainingSample,
  PredictionResult,
  ComparisonResult,
  TaskFeatures,
  NetworkInput,
  NetworkOutput
} from '../../../types';
import { INeuralNetworkState } from 'brain.js/dist/neural-network-types';

export class TaskTreePredictor {
  private net: brain.NeuralNetwork<NetworkInput, NetworkOutput>;
  private trainingHistory: { timestamp: Date; tasksCount: number; error: number }[] = [];

  constructor() {
    this.net = new brain.NeuralNetwork<NetworkInput, NetworkOutput>({
      hiddenLayers: [8, 6, 4],
      activation: 'relu', // 'sigmoid'
    });
  }

  // Проверка валидности задачи для анализа
  private isValidTaskForAnalysis(taskNode: TaskNode): boolean {
    const task = taskNode.model;
    switch (true) {
      case task.forecast?.complexity === 0:
      case task.forecast?.complexity === 6:
      case typeof task.forecast?.complexity === 'undefined':
        // Исключаем задачи без оценки сложности (complexity = 0)
        return false;
      case task.completed:
        // Для обучения нужны завершенные задачи с временными метками
        return !!task.forecast?.start && !!task.forecast?.finish;
      default:
        // Для прогноза - незавершенные задачи
        return !task.completed
    }
  }

  // Извлекаем фичи из структуры задачи
  private getExtractedFeatures(taskNode: TaskNode): TaskFeatures {
    const task = taskNode.model;
    // const now = Date.now();

    // Временные метрики
    // const daysSinceCreation = (now - task.ts.create) / (1000 * 60 * 60 * 24);
    // const daysSinceUpdate = (now - task.ts.update) / (1000 * 60 * 60 * 24);
    const daysSinceStartToComplete = (!!task.forecast?.finish && !!task.forecast?.start)
      ? (task.forecast.finish - task.forecast.start) / (1000 * 60 * 60 * 24)
      : 0

    // Метрики сложности и структуры
    const childrenCount = taskNode.children ? taskNode.children.length : 0;
    // const completedChildren = taskNode.children ?
    //   taskNode.children.filter(child => this.isValidTaskForAnalysis(child) && child.model.completed).length : 0;
    // const completionRatio = childrenCount > 0 ? completedChildren / childrenCount : 0;

    // Прогресс задачи
    // const progress = this.calculateTaskProgress(taskNode);

    return {
      // daysSinceCreation: Math.min(daysSinceCreation / 365, 1),
      // daysSinceUpdate: Math.min(daysSinceUpdate / 30, 1),
      daysSinceStartToComplete: Math.min(daysSinceStartToComplete / 365, 1),
      complexity: task.forecast.complexity,
      childrenCount: Math.min(childrenCount / 10, 1),
      // completionRatio,
      // progress,
      // titleLength: Math.min(task.title.length / 100, 1),
      // descrLength: Math.min((task.descr?.length || 0) / 500, 1),
      isCompleted: task.completed ? 1 : 0
    };
  }

  // private calculateTaskProgress(taskNode: TaskNode): number {
  //   if (!taskNode.children || taskNode.children.length === 0) {
  //     return taskNode.model.completed ? 1 : 0;
  //   }

  //   // Учитываем только валидные дочерние задачи
  //   const validChildren = taskNode.children.filter(child =>
  //     this.isValidTaskForAnalysis(child)
  //   );

  //   if (validChildren.length === 0) return 0;

  //   const completedValidChildren = validChildren.filter(child =>
  //     child.model.completed
  //   ).length;

  //   return completedValidChildren / validChildren.length;
  // }

  // Подготовка данных обучения
  private getTrainingTrainingData(taskTree: TaskNode): TrainingSample[] {
    const trainingSamples: TrainingSample[] = [];

    const extractValidCompletedTasks = (node: TaskNode): void => {
      if (this.isValidTaskForAnalysis(node) && node.model.completed) {
        const features = this.getExtractedFeatures(node);

        // Рассчитываем фактическую продолжительность
        const actualDuration = (node.model.forecast.finish! - node.model.forecast.start!) / (1000 * 60 * 60 * 24);
        const normalizedDuration = Math.min(actualDuration / 30, 1);

        trainingSamples.push({
          input: Object.values(features),
          output: [normalizedDuration]
        });
      }

      // Рекурсивно обрабатываем детей
      if (node.children) {
        node.children.forEach(child => extractValidCompletedTasks(child));
      }
    };

    extractValidCompletedTasks(taskTree);
    return trainingSamples;
  }

  // Обучение на дереве задач
  public async trainOnTaskTree(taskTree: TaskNode): Promise<INeuralNetworkState | null> {
    const trainingData = this.getTrainingTrainingData(taskTree);

    console.log(`📊 Найдено ${trainingData.length} валидных завершенных задач для обучения`);

    if (trainingData.length === 0) {
      console.log('❌ Нет подходящих задач для обучения.');
      throw new Error('❌ Нет подходящих задач для обучения.');
    }

    if (trainingData.length < 3) {
      console.log('⚠️ Мало данных для обучения. Рекомендуется минимум 3 завершенные задачи с complexity > 0');
    }

    const stats = await this.net.trainAsync(trainingData, {
      iterations: 3000,
      errorThresh: 0.008,
      learningRate: 0.3,
      log: true,
      logPeriod: 200
    });

    this.trainingHistory.push({
      timestamp: new Date(),
      tasksCount: trainingData.length,
      error: stats.error
    });

    console.log(`✅ Обучение завершено. Ошибка: ${stats.error.toFixed(6)}`);
    return stats;
  }

  // Прогноз для задачи
  public predictTaskDuration(taskNode: TaskNode): PredictionResult | { error: string; reason: string } {
    if (!this.isValidTaskForAnalysis(taskNode) || taskNode.model.completed) {
      return {
        error: 'Задача не подходит для прогноза',
        reason: taskNode.model.completed ? 'Задача уже завершена' : `complexity: ${taskNode.model.forecast.complexity} (такие кейсы не подходят для ML)`
      };
    }

    const features = this.getExtractedFeatures(taskNode);
    const input: NetworkInput = Object.values(features);
    const normalizedPrediction = this.net.run(input)[0];
    // const realisticPrediction = (normalizedPrediction * 90) + 14; // минимум 2 недели

    const predictedDays = normalizedPrediction * 30;

    return {
      task: taskNode.model.title,
      taskId: taskNode.model.id,
      predictedDays: Math.round(predictedDays * 10) / 10,
      complexity: taskNode.model.forecast.complexity,
      features,
      confidence: this.calculateConfidence(normalizedPrediction),
      normalizedPrediction
    };
  }

  private calculateConfidence(prediction: number): number {
    const distanceFromExtreme = 1 - Math.abs(prediction - 0.5) * 2;
    return Math.round(distanceFromExtreme * 100);
  }

  // Сравнение с вероятностной моделью
  public compareWithProbabilisticModel(
    taskNode: TaskNode,
    probabilisticEstimate?: number
  ): ComparisonResult | { task: string; status: string; reason?: string; error?: string } {

    if (!this.isValidTaskForAnalysis(taskNode) || taskNode.model.completed) {
      return {
        task: taskNode.model.title,
        status: 'не подходит для сравнения',
        reason: taskNode.model.completed ? 'уже завершена' : 'complexity = 0'
      };
    }

    const mlPrediction = this.predictTaskDuration(taskNode);

    if ('error' in mlPrediction) {
      return {
        task: taskNode.model.title,
        status: 'ошибка прогноза',
        error: mlPrediction.error
      };
    }

    const yourEstimateDays = probabilisticEstimate ??
      (taskNode.model.forecast?.estimate ?
        (taskNode.model.forecast.estimate - Date.now()) / (1000 * 60 * 60 * 24) :
        null
      );

    const result: ComparisonResult = {
      task: taskNode.model.title,
      taskId: taskNode.model.id,
      complexity: taskNode.model.forecast.complexity,
      yourEstimate: yourEstimateDays ? Math.round(yourEstimateDays * 10) / 10 : 'Нет оценки',
      mlPrediction: mlPrediction.predictedDays,
      confidence: `${mlPrediction.confidence}%`
    };

    if (yourEstimateDays !== null && typeof yourEstimateDays === 'number') {
      result.difference = {
        daysDiff: Math.abs(yourEstimateDays - mlPrediction.predictedDays),
        relativeDiff: Math.abs((yourEstimateDays - mlPrediction.predictedDays) / yourEstimateDays * 100)
      };
    }

    return result;
  }

  // Получение истории обучения
  public getTrainingHistory(): { timestamp: Date; tasksCount: number; error: number }[] {
    return this.trainingHistory;
  }

  // Сохранение и загрузка модели
  public saveModel(): object {
    return this.net.toJSON();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public loadModel(modelData: any): void {
    this.net.fromJSON(modelData);
  }
}
