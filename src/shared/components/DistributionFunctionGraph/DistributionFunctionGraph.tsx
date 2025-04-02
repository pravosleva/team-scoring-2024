/* eslint-disable @typescript-eslint/ban-ts-comment */
import { memo } from 'react'
import dayjs from 'dayjs';
import { Chart } from 'react-google-charts'
import { TJob } from '~/shared/xstate'
import { getTruncated } from '~/shared/utils/string-ops'

type TProps = {
  targetJob: TJob;
  targetJobs: TJob[];
  ts: {
    testStart: number;
    testDiff: number;
  };
  // title: string;
}

type TShortJob = {
  v: number,
  title: string;
  compl: number;
}

export const DistributionFunctionGraph = memo(({
  targetJobs,
  ts,
  // targetJob,
}: TProps) => {
  if (!targetJobs.every((j) => !!j.forecast.start && !!j.forecast.finish)) {
    return (
      <div>ERR</div>
    )
  }

  const speeds: TShortJob[] = targetJobs
    .map((e) => ({
      // @ts-ignore
      v: (e.forecast.estimate / 1000 - e.forecast.start / 1000) / (e.forecast.finish / 1000 - e.forecast.start / 1000),
      title: e.title,
      compl: e.forecast.complexity,
    }),
  )
  const sortedSpeeds = speeds
    .map(({ v, title, compl }) => ({ _byV: ts.testDiff / v, title, v, compl }))
    .sort((e1: TShortJob & { _byV: number }, e2: TShortJob & { _byV: number }) => e1._byV - e2._byV)
  
  const chartData = [
    ['Time', 'Calculated percentage of completion'],
    ...sortedSpeeds.map((e, i, a) => [
      ['Based on job:', `${getTruncated(e.title, 20)} (compl: ${e.compl})`, dayjs(e._byV + ts.testStart).format('YYYY-MM-DD HH:mm')].join('\n'),
      (i + 1) * (100 / a.length),
    ]),
  ]

  return (
    <div
      style={{
        width: '100%',
        border: '1px solid lightgray',
        minHeight: '320px',
      }}
    >
      <Chart
        // chartType='LineChart'
        chartType='ScatterChart'
        data={chartData}
        options={{
          title: 'Timing distribution according to previous experience',
          curveType: 'function',
          hAxis: {
            title: 'When the job will be done',
          },
          vAxis: {
            title: '%',
          },
          legend: 'none',
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
})
