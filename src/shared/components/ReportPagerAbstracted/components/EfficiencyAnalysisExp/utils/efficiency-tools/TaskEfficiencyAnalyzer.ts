import clsx from 'clsx';
import { TaskModel, TaskNode } from '~/shared/components/ReportPagerAbstracted/components/types'

interface CompletedTask {
  id: number;
  title: string;
  completionDays: number;
  complexity: number;
  completionDate: Date;
}

interface PeriodStats {
  period: string;
  totalTasks: number;
  avgCompletionDays: number;
  medianCompletionDays: number;
  minCompletionDays: number;
  maxCompletionDays: number;
  completionByComplexity: Record<number, {
    count: number;
    avgDays: number;
    medianDays: number;
  }>;
  tasksPerMonth: number;
}

interface TrendAnalysis {
  speedChangePercent: number;
  productivityChangePercent: number;
  trend: 'improvement' | 'decline' | 'stable';
  message: string;
}

export type TAnalysisInfo = {
  header: string;
  msgs: string[];
}

export interface EfficiencyAnalysis {
  recentPeriod: PeriodStats;
  previousPeriod: PeriodStats;
  trendAnalysis: TrendAnalysis;
  recentTasksDetails: CompletedTask[];
  olderTasksDetails: CompletedTask[];
}

export class TaskEfficiencyAnalyzer {
  private tasks: TaskModel[] = [];
  private now: Date = new Date();

  constructor(private data: TaskNode) {
    this.flattenTasks(data);
  }

  private flattenTasks(node: TaskNode): void {
    this.tasks.push(node.model);

    for (const child of node.children) {
      this.flattenTasks(child);
    }
  }

  private timestampToDate(ts: number): Date {
    return new Date(ts);
  }

  private getTaskCompletionTime(task: TaskModel): number | null {
    if (!task.completed) {
      return null;
    }

    const createTs = task.ts.create;
    const finishTs = task.forecast.finish || task.ts.update;

    const createDate = this.timestampToDate(createTs);
    const finishDate = this.timestampToDate(finishTs);

    const completionTimeMs = finishDate.getTime() - createDate.getTime();
    return Math.ceil(completionTimeMs / (1000 * 60 * 60 * 24)); // Convert to days
  }

  private getPeriodTasks(monthsBack: number): CompletedTask[] {
    const cutoffDate = new Date(this.now);
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack);

    const completedTasks: CompletedTask[] = [];

    for (const task of this.tasks) {
      if (task.completed) {
        const finishTs = task.forecast.finish || task.ts.update;
        const finishDate = this.timestampToDate(finishTs);

        if (finishDate >= cutoffDate) {
          const completionTime = this.getTaskCompletionTime(task);
          if (completionTime !== null) {
            const complexity = task.forecast.complexity || 1;
            completedTasks.push({
              id: task.id,
              title: task.title,
              completionDays: completionTime,
              complexity: complexity,
              completionDate: finishDate
            });
          }
        }
      }
    }

    return completedTasks;
  }

  public analyzeEfficiency(): EfficiencyAnalysis {
    // Tasks from last 3 months
    const recentTasks = this.getPeriodTasks(3);

    // Tasks from previous 3 months (4-6 months ago)
    const olderStart = new Date(this.now);
    olderStart.setMonth(olderStart.getMonth() - 6);

    const olderEnd = new Date(this.now);
    olderEnd.setMonth(olderEnd.getMonth() - 3);

    const olderTasks = this.getPeriodTasks(6).filter(task =>
      task.completionDate >= olderStart && task.completionDate < olderEnd
    );

    const recentStats = this.calculatePeriodStats(recentTasks, "Последние 3 месяца");
    const olderStats = this.calculatePeriodStats(olderTasks, "Предыдущие 3 месяца");
    const trendAnalysis = this.analyzeTrends(recentStats, olderStats);

    return {
      recentPeriod: recentStats,
      previousPeriod: olderStats,
      trendAnalysis: trendAnalysis,
      recentTasksDetails: recentTasks,
      olderTasksDetails: olderTasks
    };
  }

  private calculatePeriodStats(tasks: CompletedTask[], periodName: string): PeriodStats {
    if (tasks.length === 0) {
      return {
        period: periodName,
        totalTasks: 0,
        avgCompletionDays: 0,
        medianCompletionDays: 0,
        minCompletionDays: 0,
        maxCompletionDays: 0,
        completionByComplexity: {},
        tasksPerMonth: 0
      };
    }

    const completionTimes = tasks.map(task => task.completionDays);
    const sortedTimes = [...completionTimes].sort((a, b) => a - b);

    // Statistics by complexity
    const complexityStats: Record<number, { count: number; avgDays: number; medianDays: number }> = {};

    const complexities = [...new Set(tasks.map(task => task.complexity))];

    for (const complexity of complexities) {
      const complexTasks = tasks.filter(task => task.complexity === complexity);
      const times = complexTasks.map(task => task.completionDays);
      const sortedComplexTimes = [...times].sort((a, b) => a - b);

      complexityStats[complexity] = {
        count: complexTasks.length,
        avgDays: times.reduce((sum, time) => sum + time, 0) / times.length,
        medianDays: sortedComplexTimes[Math.floor(sortedComplexTimes.length / 2)]
      };
    }

    return {
      period: periodName,
      totalTasks: tasks.length,
      avgCompletionDays: completionTimes.reduce((sum, time) => sum + time, 0) / tasks.length,
      medianCompletionDays: sortedTimes[Math.floor(sortedTimes.length / 2)],
      minCompletionDays: Math.min(...completionTimes),
      maxCompletionDays: Math.max(...completionTimes),
      completionByComplexity: complexityStats,
      tasksPerMonth: tasks.length / 3
    };
  }

  private analyzeTrends(recent: PeriodStats, older: PeriodStats): TrendAnalysis {
    if (older.totalTasks === 0 || recent.totalTasks === 0) {
      return {
        speedChangePercent: 0,
        productivityChangePercent: 0,
        trend: 'stable',
        message: 'Недостаточно данных для анализа тенденций'
      };
    }

    // Speed change (lower completion time = better)
    const speedChangePercent = ((older.avgCompletionDays - recent.avgCompletionDays) / older.avgCompletionDays) * 100;

    // Productivity change (more tasks per month = better)
    const productivityChangePercent = ((recent.tasksPerMonth - older.tasksPerMonth) / older.tasksPerMonth) * 100;

    let trend: 'improvement' | 'decline' | 'stable';
    let message = '';

    if (speedChangePercent > 10 && productivityChangePercent > 10) {
      trend = 'improvement';
      message = `Значительное улучшение: скорость выполнения увеличилась на ${speedChangePercent.toFixed(1)}%, продуктивность выросла на ${productivityChangePercent.toFixed(1)}%`;
    } else if (speedChangePercent > 5 || productivityChangePercent > 5) {
      trend = 'improvement';
      message = `Умеренное улучшение: скорость выполнения ${speedChangePercent > 0 ? `увеличилась на ${speedChangePercent.toFixed(1)}%` : 'осталась стабильной'}, продуктивность ${productivityChangePercent > 0 ? `выросла на ${productivityChangePercent.toFixed(1)}%` : 'осталась стабильной'}`;
    } else if (speedChangePercent < -10 && productivityChangePercent < -10) {
      trend = 'decline';
      message = `Значительное ухудшение: скорость выполнения уменьшилась на ${Math.abs(speedChangePercent).toFixed(1)}%, продуктивность снизилась на ${Math.abs(productivityChangePercent).toFixed(1)}%`;
    } else if (speedChangePercent < -5 || productivityChangePercent < -5) {
      trend = 'decline';
      message = `Умеренное ухудшение: скорость выполнения ${speedChangePercent < 0 ? `уменьшилась на ${Math.abs(speedChangePercent).toFixed(1)}%` : 'осталась стабильной'}, продуктивность ${productivityChangePercent < 0 ? `снизилась на ${Math.abs(productivityChangePercent).toFixed(1)}%` : 'осталась стабильной'}`;
    } else {
      trend = 'stable';
      message = 'Стабильные показатели: скорость выполнения и продуктивность остались на прежнем уровне';
    }

    return {
      speedChangePercent,
      productivityChangePercent,
      trend,
      message
    };
  }

  public getAnalysisInfo(): TAnalysisInfo {
    const result: TAnalysisInfo = {
      header: '📊 Анализ эффективности',
      msgs: [],
    }
    const analysis = this.analyzeEfficiency();
    switch (analysis.trendAnalysis.trend) {
      case 'improvement':
        result.msgs.push('📈 Тренд: Рост')
        break
      case 'decline':
        result.msgs.push('📉 Тренд: Падение')
        break
      case 'stable':
      default:
        result.msgs.push('➡️ Тренд: Стабильность')
        break
    }
    result.msgs.push(analysis.trendAnalysis.message)
    result.msgs.push('📋 Статистика по периодам:')
    result.msgs.push('  · Недавний период:')
    result.msgs.push(
      this.getPeriodStats(analysis.recentPeriod, 2).join('\n')
    )
    result.msgs.push('  · Предыдущий период:')
    result.msgs.push(
      this.getPeriodStats(analysis.previousPeriod, 2).join('\n')
    )
    result.msgs.push('🔍 Детали по сложности задач')
    result.msgs.push(
      this.getPeriodStats(analysis.previousPeriod, 2).join('\n')
    )
    result.msgs.push(
      this.getComplexityStats(analysis, 1).join('\n')
    )
    return result
  }

  private getPeriodStats(stats: PeriodStats, level: 0 | 1 | 2): string[] {
    const msgs: string[] = []
    const getMsg = (msg: string, lvl: number) => [
      lvl > 0 ? '  '.repeat(lvl) : '',
      msg,
    ].join('')
    msgs.push(getMsg(clsx('Всего задач:', stats.totalTasks), level))
    msgs.push(getMsg(clsx('Задач в месяц:', stats.tasksPerMonth.toFixed(1)), level))
    msgs.push(getMsg(clsx('Среднее время выполнения:', `${stats.avgCompletionDays.toFixed(1)} дней`), level))
    msgs.push(getMsg(clsx('Медианное время выполнения:', `${stats.medianCompletionDays} дней`), level))
    msgs.push(getMsg(clsx('Минимальное время:', `${stats.minCompletionDays} дней`), level))
    msgs.push(getMsg(clsx('Максимальное время:', `${stats.maxCompletionDays} дней`), level))
    return msgs
  }

  private getComplexityStats(analysis: EfficiencyAnalysis, level: 0 | 1 | 2): string[] {
    const msgs: string[] = []
    const getMsg = (msg: string, lvl: number) => [
      lvl > 0 ? '  '.repeat(lvl) : '',
      msg,
    ].join('')
    const getComplexityForPeriod = (stats: PeriodStats, periodName: string, level: number): string[] => {
      const msgs: string[] = []
      msgs.push(getMsg(periodName, level))
      // console.log(`\n${periodName}:`);
      Object.entries(stats.completionByComplexity).forEach(([complexity, data]) => {
        // console.log(`  Сложность ${complexity}: ${data.count} задач, среднее ${data.avgDays.toFixed(1)} дней`);
        msgs.push(getMsg(`Сложность ${complexity}: ${data.count} задач, среднее ${data.avgDays.toFixed(1)} дней`, level + 1))
      });
      return msgs
    };
    msgs.push(getComplexityForPeriod(analysis.recentPeriod, 'Последние 3 месяца', level + 1).join('\n'))
    msgs.push(getComplexityForPeriod(analysis.previousPeriod, 'Предыдущие 3 месяца', level + 1).join('\n'))
    return msgs
  }
}

// Пример использования:
// const analyzer = new TaskEfficiencyAnalyzer(yourData);
// const results = analyzer.analyzeEfficiency();
// analyzer.printAnalysis();

// Или для получения сырых данных:
// const analysis = analyzer.analyzeEfficiency();
// console.log(analysis);
