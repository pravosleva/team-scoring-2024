// TaskAnalyzer.ts
import { TaskTreePredictor } from './TaskTreePredictor';
import { TaskNode, ComparisonResult } from '../../../types';

export interface AnalysisResults {
  analysis: (ComparisonResult | { task: string; status: string; reason?: string })[];
  skippedTasks: { task: string; complexity?: number; completed: boolean }[];
}

export class TaskAnalyzer {
  private predictor: TaskTreePredictor;

  constructor(predictor: TaskTreePredictor) {
    this.predictor = predictor;
  }

  public analyzeValidTasks(taskTree: TaskNode): AnalysisResults {
    const analysis: (ComparisonResult | { task: string; status: string; reason?: string })[] = [];
    const skippedTasks: { task: string; complexity?: number; completed: boolean }[] = [];

    const analyzeNode = (node: TaskNode): void => {
      // Используем публичный метод isValidTaskForAnalysis если он есть, 
      // или вызываем приватный через predictTaskDuration для проверки
      const prediction = this.predictor.predictTaskDuration(node);

      if (!('error' in prediction)) {
        const comparison = this.predictor.compareWithProbabilisticModel(node);
        analysis.push(comparison);
      } else if (!node.model.completed) {
        skippedTasks.push({
          task: node.model.title,
          complexity: node.model.forecast?.complexity,
          completed: node.model.completed
        });
      }

      if (node.children) {
        node.children.forEach(child => analyzeNode(child));
      }
    };

    analyzeNode(taskTree);

    return { analysis, skippedTasks };
  }

  public printAnalysis(results: AnalysisResults): void {
    console.log('\n📊 АНАЛИЗ ВАЛИДНЫХ ЗАДАЧ:');

    results.analysis.forEach(item => {
      if ('status' in item && item.status === 'ошибка прогноза') {
        console.log(`\n❌ ${item.task}`);
        console.log(`   Ошибка: ${item.reason}`);
        return;
      }

      if ('status' in item) {
        console.log(`\n🚫 ${item.task} - ${item.status}`);
        return;
      }

      const comparison = item as ComparisonResult;
      console.log(`\n${comparison.task} [сложность: ${comparison.complexity}/5]`);
      console.log(`├─ Ваша оценка: ${comparison.yourEstimate} дней`);
      console.log(`├─ Brain.js: ${comparison.mlPrediction} дней (${comparison.confidence})`);

      if (comparison.difference) {
        console.log(`└─ Разница: ${comparison.difference.daysDiff.toFixed(1)} дней (${comparison.difference.relativeDiff.toFixed(1)}%)`);
      }
    });

    if (results.skippedTasks.length > 0) {
      console.log('\n🚫 ПРОПУЩЕННЫЕ ЗАДАЧИ (complexity = 0 или завершены):');
      results.skippedTasks.forEach(task => {
        console.log(`- ${task.task} (complexity: ${task.complexity || 'нет'})`);
      });
    }
  }
}
