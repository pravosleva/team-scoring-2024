/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useRef, useMemo } from 'react'
import { getDoneTimeDiff } from '~/shared/components/Job/utils/getDoneTimeDiff'
import { TJob } from '~/shared/xstate'
import baseClasses from '~/App.module.scss'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
} from 'recharts'
import { useElementSizes } from '~/shared/hooks'
import { EDayEnumValues } from '~/pages/business-time/utils/types'
import { getCapitalizedFirstLetter } from '~/shared/utils/string-ops'
import { getBusinessTimeConfig } from '~/shared/components/Job/utils/getBusinessTimeConfig'
import { getColorsRamp } from '~/shared/utils/colors-ops'
// import { ContentType } from 'recharts/types/component/Tooltip'

type TDataItem = {
  name: string;
  productive: number;
  total: number;
  absolute: number;
  fill?: string;
}

const commonDiagramNames = ['common']
// const weekDiagramDiagramNames = ['weekDay']
const radialBarChartDiagramNames = ['SimpleRadialBarChart']
const noWeekdayDiagramNames = ['no-weekday']

// const CustomTooltip = ({ active, payload, label }: any) => {
//   const isVisible = active && payload && payload.length;
//   return (
//     <div
//       style={{
//         visibility: isVisible ? 'visible' : 'hidden',
//         display: 'flex',
//         flexDirection: 'column',
//         gap: '8px',
//       }}
//     >
//       {isVisible && (
//         <>
//           <div className="label">{`${label} : ${payload[0].value}`}</div>
//           {/* <div className="intro">{getIntroOfPage(label)}</div> */}
//           {/* <div className="desc">Anything you want can be displayed here.</div> */}
//         </>
//       )}
//     </div>
//   );
// };

export const ProductivityAnalysisGraph = memo(({ job }: { job: TJob }) => {
  const timing = getDoneTimeDiff({ job })
  const thisContentRef = useRef<HTMLDivElement>(null);
  const wrapperSizes = useElementSizes({ ref: thisContentRef.current });
  // const data = [
  //   {
  //     name: '5/2 by Default',
  //     absolute: 39,
  //     total: 39.98,
  //     productive: 39,
  //   },
  //   {
  //     name: 'MainsGroup',
  //     absolute: 39,
  //     total: 34.5,
  //     productive: 29,
  //   },
  // ]

  const businessTimeConfig = getBusinessTimeConfig()

  const radialBarChartData = useMemo(() => Object.keys(timing.commonBusinessAnalysis.all)
    .reduce((acc: { result: TDataItem[]; ok: boolean; counter: number }, key) => {
      // @ts-ignore
      const supportedDiagrams = businessTimeConfig[key]._diagrams || []
      if (radialBarChartDiagramNames.some((d) => supportedDiagrams?.includes(d))) {
        acc.ok = true
        acc.result.push({
          name: key,
          productive: Object.keys(timing.commonBusinessAnalysis.all[key]).reduce((acc: number, day) => {
            acc += timing.commonBusinessAnalysis.all[key][day as EDayEnumValues]?.productiveHours || 0
            return acc
          }, 0),
          fill: getColorsRamp('#ff7300', '#1976d2', acc.counter - 1)[acc.counter],
          total: Object.keys(timing.commonBusinessAnalysis.all[key]).reduce((acc: number, day) => {
            acc += timing.commonBusinessAnalysis.all[key][day as EDayEnumValues]?.totalHours || 0
            return acc
          }, 0),
          absolute: Object.keys(timing.commonBusinessAnalysis.all[key]).reduce((acc: number, day) => {
            acc += timing.commonBusinessAnalysis.all[key][day as EDayEnumValues]?.absoluteHours || 0
            return acc
          }, 0),
        })
        acc.counter += 1
      }
      return acc
    }, { result: [], ok: false, counter: 0 })
    , [timing.commonBusinessAnalysis.all])

  const commonData = useMemo(() => Object.keys(timing.commonBusinessAnalysis.all)
    .reduce((acc: { result: TDataItem[]; ok: boolean }, key) => {
      // @ts-ignore
      const supportedDiagrams = businessTimeConfig[key]._diagrams || []
      if (commonDiagramNames.some((d) => supportedDiagrams?.includes(d))) {
        acc.ok = true
        acc.result.push({
          name: key,
          productive: Object.keys(timing.commonBusinessAnalysis.all[key]).reduce((acc: number, day) => {
            acc += timing.commonBusinessAnalysis.all[key][day as EDayEnumValues]?.productiveHours || 0
            return acc
          }, 0),
          total: Object.keys(timing.commonBusinessAnalysis.all[key]).reduce((acc: number, day) => {
            acc += timing.commonBusinessAnalysis.all[key][day as EDayEnumValues]?.totalHours || 0
            return acc
          }, 0),
          absolute: Object.keys(timing.commonBusinessAnalysis.all[key]).reduce((acc: number, day) => {
            acc += timing.commonBusinessAnalysis.all[key][day as EDayEnumValues]?.absoluteHours || 0
            return acc
          }, 0),
        })
      }
      return acc
    }, { result: [], ok: false })
    , [timing.commonBusinessAnalysis.all])

  const weekData: { id: string; data: TDataItem[] }[] = useMemo(() => ([
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    // 'saturday',
    // 'sunday',
  ]).map((day) => ({
    id: getCapitalizedFirstLetter(day),
    data: Object.keys(timing.commonBusinessAnalysis.all)
      .reduce((acc: TDataItem[], key) => {
        // @ts-ignore
        const supportedDiagrams = businessTimeConfig[key]._diagrams || []
        if (
          !!timing.commonBusinessAnalysis.all[key][day as EDayEnumValues]
          && !noWeekdayDiagramNames.some((d) => supportedDiagrams?.includes(d))
        ) {
          // acc.ok = true
          acc.push({
            name: key,
            productive: timing.commonBusinessAnalysis.all[key][day as EDayEnumValues].productiveHours,
            total: timing.commonBusinessAnalysis.all[key][day as EDayEnumValues].totalHours,
            absolute: timing.commonBusinessAnalysis.all[key][day as EDayEnumValues].absoluteHours,
          })
        }
        return acc
      }, [])
  }))
    , [timing.commonBusinessAnalysis.all])
  const handlePreventClick = (e: any) => {
    e?.stopPropagation()
  }

  // const globalWeekRewiewData = useMemo(() => Object.keys(timing.commonBusinessAnalysis.all)
  //   .reduce((acc: { result: TDataItem[]; ok: boolean; counter: number }, key) => {
  //     // @ts-ignore
  //     const supportedDiagrams = businessTimeConfig[key]._diagrams || []
  //     if (radialBarChartDiagramNames.some((d) => supportedDiagrams?.includes(d))) {
  //       acc.ok = true
  //       acc.result.push({
  //         name: key,
  //         productive: Object.keys(timing.commonBusinessAnalysis.all[key]).reduce((acc: number, day) => {
  //           acc += timing.commonBusinessAnalysis.all[key][day as EDayEnumValues]?.productiveHours || 0
  //           return acc
  //         }, 0),
  //         fill: getColorsRamp('#ff7300', '#1976d2', acc.counter - 1)[acc.counter],
  //         total: Object.keys(timing.commonBusinessAnalysis.all[key]).reduce((acc: number, day) => {
  //           acc += timing.commonBusinessAnalysis.all[key][day as EDayEnumValues]?.totalHours || 0
  //           return acc
  //         }, 0),
  //         absolute: Object.keys(timing.commonBusinessAnalysis.all[key]).reduce((acc: number, day) => {
  //           acc += timing.commonBusinessAnalysis.all[key][day as EDayEnumValues]?.absoluteHours || 0
  //           return acc
  //         }, 0),
  //       })
  //       acc.counter += 1
  //     }
  //     return acc
  //   }, { result: [], ok: false, counter: 0 }),
  //   []
  // )
  const getGlobalInfo = ({ day, targetCritery }: {
    day: string;
    targetCritery: 'productiveHours' | 'totalHours' | 'absoluteHours';
  }) => {
    return Object.keys(timing.commonBusinessAnalysis.all)
      .reduce((acc: { ok: boolean; data: { [key: string]: number }; counter: number; keys: string[] }, key) => {
        // @ts-ignore
        const supportedDiagrams = businessTimeConfig[key]._diagrams || []
        if (
          !!timing.commonBusinessAnalysis.all[key][day as EDayEnumValues]
          && commonDiagramNames.some((d) => supportedDiagrams?.includes(d))
        ) {
          acc.ok = true
          acc.data[key] = timing.commonBusinessAnalysis.all[key][day as EDayEnumValues][targetCritery]
          // acc.data[key].color = getColorsRamp('#ff7300', '#1976d2', acc.counter - 1)[acc.counter]
          acc.keys.push(key)
          acc.counter += 1
        }
        return acc
      }, { ok: false, data: {}, counter: 0, keys: [] })
  }
  // const globalProductive = useMemo(() => getGlobalInfo({ day: 'monday', targetCritery: 'productiveHours' }), [])
  const globalProductiveMonday = useMemo(() => getGlobalInfo({ day: 'monday', targetCritery: 'productiveHours' }), [])
  const globalProductiveCalc = useMemo(() => ({
    monday: globalProductiveMonday.data,
    tuesday: getGlobalInfo({ day: 'tuesday', targetCritery: 'productiveHours' }).data,
    wednesday: getGlobalInfo({ day: 'wednesday', targetCritery: 'productiveHours' }).data,
    thursday: getGlobalInfo({ day: 'thursday', targetCritery: 'productiveHours' }).data,
    friday: getGlobalInfo({ day: 'friday', targetCritery: 'productiveHours' }).data,
    saturday: getGlobalInfo({ day: 'saturday', targetCritery: 'productiveHours' }).data,
    sunday: getGlobalInfo({ day: 'sunday', targetCritery: 'productiveHours' }).data,
    __counter: globalProductiveMonday.counter,
    __keys: globalProductiveMonday.keys,
  }), [globalProductiveMonday])
  const globalWeekRewiewData = useMemo(() => ([
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    // 'saturday',
    // 'sunday',
  ]).map((day) => ({
    name: getCapitalizedFirstLetter(day),
    // @ts-ignore
    ...globalProductiveCalc[day],
  })), [])

  return (
    <div
      ref={thisContentRef}
      className={baseClasses.stack2}
      onClick={handlePreventClick}
    >
      {
        radialBarChartData.ok && (
          <>
            <div
              style={{
                width: '100%',
                // height: 250,
              }}
              className={baseClasses.stack1}
            >
              <b>Common (productive only)</b>
              <ResponsiveContainer height={120}>
                <RadialBarChart
                  // style={{
                  //   border: '1px solid red',
                  // }}
                  cx={radialBarChartData.result.length > 2 ? '0%' : '25%'}
                  cy="50%"
                  innerRadius="10%"
                  outerRadius="80%"
                  barSize={18}
                  data={radialBarChartData.result.sort((e1, e2) => e2.productive - e1.productive).map((item) => ({ ...item, productive: Math.round(item.productive) }))}
                >
                  <RadialBar
                    // minAngle={15}
                    label={{
                      position: 'insideStart',
                      fill: '#fff',
                    }}
                    // background
                    // clockWise
                    dataKey="productive"
                  />
                  <Legend
                    iconSize={20}
                    layout="vertical"
                    verticalAlign="middle"
                    wrapperStyle={{
                      top: '50%',
                      // top: 0,
                      right: 0,
                      transform: 'translate(0, -50%)',
                      // lineHeight: '24px',
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div
              style={{ width: '100%', height: 250 }}
              className={baseClasses.stack1}
            >
              <b>Global week rewiew (productive only)</b>
              <ResponsiveContainer>
                <ComposedChart
                  width={wrapperSizes.width}
                  height={250}
                  data={globalWeekRewiewData}
                  margin={{
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                  }}
                >
                  <CartesianGrid stroke="#f5f5f5" />
                  <XAxis dataKey="name" scale='band' />
                  <YAxis />
                  <Tooltip
                    cursor={false}
                    formatter={(value, _name, _props) => `${Number(value).toFixed(1)}h`}
                    position={{ x: -32, y: -5 }}
                    wrapperStyle={{
                      zIndex: 1,
                    }}
                    itemStyle={{
                      padding: '0px'
                    }}
                    contentStyle={{
                      border: '2px solid lightgray',
                    }}
                    labelStyle={{
                      fontWeight: 'bold',
                    }}
                    wrapperClassName={baseClasses.stripedGrayLite}
                  />

                  {
                    globalProductiveCalc.__keys.map((key, i, arr) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        // stroke="#1976d2"
                        // stroke={getColorsRamp('#ff7300', '#1976d2', globalProductiveCalc.__counter > 0 ? globalProductiveCalc.__counter - 2 : 0)[i]}
                        stroke={getColorsRamp('#ff7300', '#1976d2', arr.length > 0 ? arr.length - 2 : 0)[i]}
                      />
                    ))
                  }
                  {/* <Area type="monotone" dataKey="mode1" fill="#92a9de" stroke="#92a9de" /> */}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        )
      }

      {
        commonData.ok && (
          <div
            style={{ width: '100%', height: 250 }}
            className={baseClasses.stack1}
          >
            <b>Common</b>
            <ResponsiveContainer>
              <ComposedChart
                width={wrapperSizes.width}
                height={250}
                data={commonData.result}
                margin={{
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                }}
              >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="name" scale='band' />
                <YAxis />
                <Tooltip
                  cursor={false}
                  formatter={(value, _name, _props) => `${Number(value).toFixed(1)}h`}
                  position={{ x: -32, y: -5 }}
                  wrapperStyle={{
                    zIndex: 1,
                  }}
                  itemStyle={{
                    padding: '0px'
                  }}
                  contentStyle={{
                    border: '2px solid lightgray',
                  }}
                  labelStyle={{
                    fontWeight: 'bold',
                  }}
                  wrapperClassName={baseClasses.stripedGrayLite}
                />
                <Legend verticalAlign="bottom" height={30} />
                {/*
                <Area type="monotone" dataKey="absolute" fill="#8884d8" stroke="#8884d8" />
                <Bar dataKey="total" barSize={20} fill="#413ea0" />
                <Line type="monotone" dataKey="productive" stroke="#ff7300" />

                #00a47d
                */}
                <Area type="monotone" dataKey="absolute" fill="#92a9de" stroke="#92a9de" />
                <Bar dataKey="total" barSize={30} fill="#1976d2" />
                <Line type="monotone" dataKey="productive" stroke="#ff7300" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )
      }
      {
        weekData.map(({ id, data }: { id: string; data: any }) => (
          <div
            key={id}
            style={{ width: '100%', height: 250 }}
            className={baseClasses.stack1}
          >
            <b>{id}</b>
            <ResponsiveContainer>
              <ComposedChart
                width={wrapperSizes.width}
                height={250}
                data={data}
                margin={{
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                }}
              >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="name" scale="band" />
                <YAxis />
                <Tooltip
                  cursor={false}
                  formatter={(value, _name, _props) => `${Number(value).toFixed(1)}h`}
                  // content={CustomTooltip}
                  position={{ x: -32, y: -5 }}
                  wrapperStyle={{
                    zIndex: 1,
                  }}
                  itemStyle={{
                    padding: '0px'
                  }}
                  contentStyle={{
                    border: '2px solid lightgray',
                  }}
                  labelStyle={{
                    fontWeight: 'bold',
                  }}
                  wrapperClassName={baseClasses.stripedGrayLite}
                // content={(value) => (
                //   <div
                //     style={{
                //       zIndex: 1,
                //       border: '2px solid lightgray',
                //       display: 'flex',
                //       flexDirection: 'column',
                //       gap: '4px',
                //       backgroundColor: '#FFF',
                //     }}
                //   >
                //     {/* <b>{value.label}</b> */}
                //     <span>{value.payload[0]?.name}</span>
                //   </div>
                // )}
                />
                <Legend verticalAlign="bottom" height={30} />
                <Area type="monotone" dataKey="absolute" fill="#92a9de" stroke="#92a9de" />
                <Bar dataKey="total" barSize={30} fill="#1976d2" />
                <Line type="monotone" dataKey="productive" stroke="#ff7300" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ))
      }
      {/*
      <pre className={baseClasses.preNormalized}>{JSON.stringify(businessTimeConfig, null, 2)}</pre>
      */}
    </div>
  )
})