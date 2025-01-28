import { useMemo } from 'react'
import dayjs from 'dayjs'
import { Chart } from 'react-google-charts'
import { TJob, TLogsItem } from '~/shared/xstate'
import { getTruncated } from '~/shared/utils/string-ops'
import { getWorstCalc } from '~/shared/utils/team-scoring'
import { getCurrentPercentage } from '~/shared/utils'

type TProps = {
  targetJob: TJob;
  jobsForAnalysis: TJob[];
}

export const JobLogProgressGraph = ({
  targetJob,
  jobsForAnalysis,
}: TProps) => {
  const targetLogs = useMemo(() => {
    const logs: TLogsItem[] = []
    for (const log of targetJob.logs.items) if (!!log.progress) logs.unshift(log)
    return logs
  }, [targetJob.logs])
  
  const chartData = useMemo(() => {
    // const logsForChart = targetLogs.map((log, _i, _a) => [
    //   [`Log: ${getTruncated(log.text, 20)}`, dayjs(log.ts).format('YYYY-MM-DD HH:mm')].join('\n'),
    //   log.progress?.estimate,
    //   log.progress?.worst,
    // ])
    const logsForChart: (string | number | undefined)[][] = []
    for (const log of targetLogs) {
      const modifiedLog = [
        [`Log: ${getTruncated(log.text, 20)}`, dayjs(log.ts).format('YYYY-MM-DD HH:mm')].join('\n'),
        log.progress?.estimate,
        log.progress?.worst,
      ]
      logsForChart.push(modifiedLog)
    }

    if (
      !targetJob.forecast.finish
      && !!targetJob.forecast.start
      && !!targetJob.forecast.estimate
    ) {
      const startDate = targetJob.forecast.start
      const nowDate = new Date().getTime()
      const estimateDate = targetJob.forecast.estimate
      const worstDate = getWorstCalc({
        theJobList: jobsForAnalysis,
        ts: {
          testStart: targetJob.forecast.start,
          testDiff: targetJob.forecast.estimate - targetJob.forecast.start,
        },
      }).date100
      const estimatePercentage = getCurrentPercentage({
        targetDateTs: estimateDate,
        startDateTs: startDate,
      })
      const worstPercentage = getCurrentPercentage({
        targetDateTs: worstDate,
        startDateTs: startDate,
      })

      logsForChart.push([
        ['Now', dayjs(nowDate).format('YYYY-MM-DD HH:mm')].join('\n'),
        estimatePercentage,
        worstPercentage,
      ])
    }

    return [
      ['Time', 'Estimate', 'Worst'],
      ...logsForChart,
    ]
  }, [targetLogs, jobsForAnalysis, targetJob.forecast.estimate, targetJob.forecast.finish, targetJob.forecast.start])

  return (
    <div
      style={{
        width: '100%',
        border: '1px solid lightgray',
        minHeight: '320px',
      }}
    >
      <Chart
        chartType='LineChart'
        data={chartData}
        options={{
          title: 'Possible scenario variants logs',
          curveType: 'function',
          hAxis: {
            title: 'When job could be done (logs)',
          },
          vAxis: {
            title: '%',
          },
          legend: { position: 'bottom' },
          series: [
            { color: "#02c39a" },
            { color: "#e63946" },
          ],
          // fontName: 'Montserrat',
          tooltip: {
            showColorCode: true,
            trigger: 'selection',
          },
        }}
        width='100%'
        height='320px'
        legendToggle
      />
    </div>
  )
}
