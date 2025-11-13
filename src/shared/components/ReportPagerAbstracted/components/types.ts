// import { TreeNode } from 'ts-tree-lib'
// import { TJob } from '~/shared/xstate';

export interface Timestamp {
  create: number;
  update: number;
}

export interface TaskRelations {
  parent?: number;
  children: number[];
}

export interface TaskForecast {
  complexity: number;
  assignedTo?: number;
  start?: number;
  estimate?: number;
  finish?: number;
}

export interface TaskModel {
  id: number;
  title: string;
  ts: Timestamp;
  descr?: string;
  completed: boolean;
  relations: TaskRelations;
  forecast: TaskForecast;
}

export interface TaskNode {
  model: TaskModel;
  children: TaskNode[];
}

// export interface TaskNode extends TreeNode<TJob>

export interface TrainingSample {
  input: number[];
  output: number[];
}

export interface PredictionResult {
  task: string;
  taskId: number;
  predictedDays: number;
  complexity: number;
  features: TaskFeatures;
  confidence: number;
  normalizedPrediction: number;
}

export interface ComparisonResult {
  task: string;
  taskId: number;
  complexity: number;
  yourEstimate: number | string;
  mlPrediction: number;
  confidence: string;
  difference?: {
    daysDiff: number;
    relativeDiff: number;
  };
}

export interface TaskFeatures {
  // daysSinceCreation: number;
  // daysSinceUpdate: number;
  daysSinceStartToComplete: number;
  complexity: number;
  childrenCount: number;
  // completionRatio: number;
  // progress: number;
  // titleLength: number;
  // descrLength: number;
  isCompleted: number;
}

// Типы для Brain.js
export type NetworkInput = number[];
export type NetworkOutput = number[];
