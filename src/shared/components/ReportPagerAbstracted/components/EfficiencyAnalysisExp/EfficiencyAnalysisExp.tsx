import { memo, useEffect, useState } from 'react'
// import clsx from 'clsx'
import baseClasses from '~/App.module.scss'
import {
  // CollapsibleBox,
  SingleTextManager,
} from '~/shared/components'
import CircularProgress from '@mui/material/CircularProgress'
// import { Alert } from '@mui/material'
import { TaskNode } from '~/shared/components/ReportPagerAbstracted/components/types'
import {
  TaskEfficiencyAnalyzer,
  // EfficiencyAnalysis,
  TAnalysisInfo,
} from './utils'

type TProps = {
  tree: TaskNode;
}

// Вспомогательная функция для быстрого анализа
// function analyzeTaskEfficiency(data: TaskNode): EfficiencyAnalysis {
//   const analyzer = new TaskEfficiencyAnalyzer(data);
//   return analyzer.analyzeEfficiency();
// }

// Функция для вывода красивого отчета
// function printEfficiencyReport(data: TaskNode): void {
//   const analyzer = new TaskEfficiencyAnalyzer(data);
//   analyzer.printAnalysis();
// }

export const EfficiencyAnalysisExp = memo(({ tree }: TProps) => {
  // const [report, setReport] = useState<EfficiencyAnalysis | null>(null)
  const [report, setReport] = useState<TAnalysisInfo | null>(null)

  useEffect(() => {
    // main(tree)
    //   .then((r) => setReport(r))
    //   .catch((e) => setReport(e))
    // Ваши данные
    // const yourData: TaskNode = { ... }; // ваши JSON данные

    const analyzer = new TaskEfficiencyAnalyzer(tree);
    // const results = analyzer.analyzeEfficiency();
    const results = analyzer.getAnalysisInfo();

    setReport(results)

    // Или просто:
    // printEfficiencyReport(yourData);
  }, [tree])

  return (
    <div className={baseClasses.stack2}>
      {
        !report && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <CircularProgress />
          </div>
        )
      }
      {
        !!report && (
          <SingleTextManager
            infoLabel='Тренд'
            initialState={{
              // text: JSON.stringify(report, null, 2),
              text: report.msgs.join('\n'),
            }}
            isEditable={false}
            isDeletable={false}
          />
        )
      }
    </div>
  )
})
