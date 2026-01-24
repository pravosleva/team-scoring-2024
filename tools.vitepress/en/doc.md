---
title: Probability Theory in action
description: Instruction
lang: en-EN
layout: home
hero:
  name: Estimate Corrector 2024
  actions:
    - theme: brand
      text: Get started
      link: https://pravosleva.pro/dist.estimate-corrector-2024
---

::: info
Mechanism that allows obtaining an adjusted forecast for the completion of a particular task based on an analysis of deviations in forecasting similar tasks.
See also:
- [Evidence Based Scheduling ↗️](https://www.joelonsoftware.com/2007/10/26/evidence-based-scheduling/) by [Joel Spolsky ↗️](https://en.wikipedia.org/wiki/Joel_Spolsky)
:::

[[toc]]

## About this app
Team Scoring 2024 is a web-based task forecasting and estimation system that applies probability theory to predict task completion times based on historical employee performance data. The application implements Evidence-Based Scheduling principles to provide adjusted forecasts by analyzing deviations in past task estimates, enabling more predictable project delivery timelines.

This tool should give us a complete understanding of when the release is most likely to happen. [See also ↗️](https://pravosleva.pro/p/estimate-corrector-2024)

## Core Problem & Solution
The system addresses the challenge of unreliable task estimation by tracking actual completion times against initial estimates. For each employee, it builds a statistical model of their estimation accuracy across tasks of varying complexity, producing three forecast scenarios:

### 🤌 Estimated
Original employee estimate

### ⚖️ Sensed
Probability-adjusted based on historical accuracy

### 👎 Worst
Pessimistic scenario based on historical maximums

::: info
The forecasting algorithm analyzes similar completed tasks (filtered by complexity rating 1-5) and calculates probability distributions of estimate-to-actual ratios. This produces a confidence curve showing likelihood of completion at various future dates.
:::

## Core concepts
### Jobs & Forecasting
The `TJob` type represents the fundamental unit of work in the system. It combines task metadata, forecasting information, activity logs, roadmap milestones, and hierarchical relationships.

### Logs & Activity History
The system provides a chronological record of work performed on jobs through structured log entries that can contain text, progress metrics, checklists, and external links. The activity timeline aggregates logs across jobs to provide a unified view of recent work.

### Checklists & Task Items
Checklists provide structured task tracking, allowing users to break down log entries into discrete, actionable items with completion tracking and ordering capabilities.

### Job Relations & Hierarchies
Jobs can be linked together to form hierarchical structures where parent jobs represent projects containing child jobs as sub-tasks.

### Users & Employees
Jobs are assigned to employees through the `TForecast` structure embedded in each job.

## Instructions
1. Create new ticket
2. Check with the employee how much time it will take him to complete it
3. Set the actual start date for the execution whet its will be started
4. Specify the forecast date from the performer's words (if necessary, take a timeout and return to this question later)
5. Ask the performer what their rating of the task's difficulty is from 1 to 5 (or take a timeout and return to this question later)
6. If any revision is required, please add additional time

### How to use Business Time settings
The Business Time Configuration system provides a user interface for defining and managing custom weekly work schedules stored in browser localStorage. These configurations define which hours are considered "business time" for each day of the week, enabling time-based analytics and forecasting calculations. The system supports multiple named configurations with full CRUD operations, validation, and edit controls.

The Business Time Configuration page allows users to create, edit, and manage multiple weekly schedule templates. Each configuration specifies working hours for each day of the week in HH:MM:SS format, supporting multiple time ranges per day (e.g., split shifts). The system validates all time inputs and persists configurations to localStorage for use across sessions.

#### Key Features:
- Multiple named configurations with tab-based navigation
- JSON-based editor with real-time validation
- Default "5/2 by Default" configuration (read-only)
- Create, rename, and delete operations
- Timestamps tracking creation and modification
- Experimental diagram storage per configuration

## DeepWiki analysis
::: details Is the project scalable?
Based on the codebase analysis, the project demonstrates several scalability-focused architectural patterns and optimizations.

### Summary
The project implements client-side scalability through Web Workers for parallel processing, pagination systems for large datasets, and optimized build configurations with chunk splitting. It's designed as a single-user application with performance optimizations for handling complex forecasting calculations and large job datasets.

### Scalability Features
Parallel Processing with Web Workers
The application uses multiple dedicated Web Workers to offload heavy computations from the main thread:
- Search Worker: Handles search and filtering operations with pagination `withRootMW.js:129-160`
- Jobs Pager: Manages job list pagination and sorting `types.js:99-107`
- Logs Pager: Processes activity logs `types.js:117-125`
- Pointset Tree Calculator: Performs complex forecasting calculations `types.js:72-80`

### Data Processing Optimizations
- Binary Search: Efficient lookup algorithms for finding items in sorted datasets `withRootMW.js:143-150`
- Pagination: 10-item page limits to prevent memory overload with large datasets `withRootMW.js:151-160`
- Tree Operations: Optimized hierarchical data processing for project structures `calc.v4.js:73-89`

### Build and Bundle Optimizations
The Vite configuration implements several performance optimizations:
- Chunk Splitting: Large dependencies (MUI, dayjs, recharts, brain.js) split into separate chunks for better caching
- Bundle Analysis: Visualizer plugin for performance monitoring
- PWA Features: Service worker with 10MB cache limit for offline functionality

### State Management Architecture
- XState Machine: Centralized state management with predictable state transitions `useSearchBasicWorker.ts:1-35`
- Context Stores: Derived state management for URL parameters and search state

### Limitations
The architecture is optimized for single-user client-side performance rather than multi-user server scalability. The system handles scalability through:
- Client-side data processing limits
- Browser memory constraints
- No explicit server-side scaling patterns

### Notes
The project appears designed as a desktop/web application for individual team leads or project managers rather than a multi-tenant SaaS platform. The scalability focus is on handling large datasets and complex calculations within browser constraints rather than concurrent user scaling.
:::

## This project history
In progress...
