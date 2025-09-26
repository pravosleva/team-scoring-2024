import { useMemo } from 'react'
import { Chart } from 'react-google-charts'
import { TJob } from '~/shared/xstate'
import { getSortedSpeedsCalc } from '~/shared/utils/team-scoring/getSortedSpeedsCalc'
import { getRounded } from '~/shared/utils/number-ops'
// import baseClasses from '~/App.module.scss'

type TProps = {
  targetJob?: TJob;
  targetJobs: TJob[];
}

const sensibility = 4

export const SpeedsFunctionGraph = ({
  targetJob,
  targetJobs,
}: TProps) => {
  const jobsForAnalysis = useMemo(() => targetJob?.completed ? [targetJob, ...targetJobs] : [...targetJobs], [targetJob, targetJobs])
  const speedsCalc = useMemo(() => getSortedSpeedsCalc({
    theJobList: jobsForAnalysis,
    sensibility,
  }), [jobsForAnalysis])

  if (!targetJobs.every((j) => !!j.forecast.start && !!j.forecast.finish)) {
    return (
      <div>ERR</div>
    )
  }

  const chartData = [
    [
      'Time',
      'Deviation',
      { role: 'style' },
      'Delta %',
      { role: 'style' },
    ],
    ...speedsCalc.delta.items.map((item) => [
      [
        `v:${getRounded((item.speed || 0), 1)},Δ:+${getRounded((item.delta || 0) * 100 / speedsCalc.delta.min, 0)}%`,
        `${item.id === targetJob?.id ? '[THIS JOB]' : ''}`,
      ].filter((v) => !!v).join('\n'),
      getRounded((item.speed || 0) * 100 / speedsCalc.sensed.averageSpeed, 0),
      `color: ${item.isSensed ? 'rgb(51, 102, 204)' : '#e5e4e2'}`,
      (item.delta || 0) * 100 / speedsCalc.delta.min,
      `color: ${item.id === targetJob?.id
        ? '#e63946'
        : 'lightgray'
      }`,
    ]),
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          border: '1px solid lightgray',
          minHeight: '320px',
        }}
      >
        <Chart
          // chartType='LineChart'
          chartType='BarChart'
          data={chartData}
          options={{
            title: `Deviation between speeds (sensibility: ${getRounded(speedsCalc.delta.min * sensibility, 2)}= ~${getRounded(speedsCalc.delta.min, 2)} [Δ min] x${sensibility} [correction coeff])`,
            curveType: 'function',
            hAxis: {
              title: 'Deviation between sorted speeds, %',
            },
            // vAxis: {
            //   title: '%',
            // },
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
      {/* <pre className={baseClasses.preNormalized}>
        {JSON.stringify(speedsCalc, null, 2)}
      </pre> */}
    </div>
  )
}
