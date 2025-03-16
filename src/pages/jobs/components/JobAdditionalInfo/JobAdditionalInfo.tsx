import { memo } from 'react'
import { TJob, TopLevelContext } from '~/shared/xstate'
import baseClasses from '~/App.module.scss'
import { ResponsiveBlock } from '~/shared/components'
import dayjs from 'dayjs'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import { getModifiedJobLogText } from '~/pages/jobs/[id]/utils/getModifiedJobLogText'

type TPros = {
  job: TJob;
}

export const JobAdditionalInfo = memo(({ job }: TPros) => {
  const { logs, ...withoutLogs } = job
  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const users = TopLevelContext.useSelector((s) => s.context.users)

  return (
    <ResponsiveBlock>
      <pre
        className={baseClasses.preNormalized}
        style={{ borderRadius: 0, }}
      >{JSON.stringify(withoutLogs, null, 2)}</pre>
      {
        logs.items.length > 0 && (
          <ResponsiveBlock
            style={{
              padding: '16px 16px 0px 16px',
            }}
          >
            <h3 style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
              <span>[ Logs: {job.logs.isEnabled ? 'detailed' : 'minimal'}</span>
              {job.logs.isEnabled ? <ToggleOnIcon /> : <ToggleOffIcon />}
              <span>]</span>
            </h3>
            
            <ResponsiveBlock
              className={baseClasses.stack1}
            >
              {
                job.logs.isEnabled ? (
                  <em style={{ fontSize: 'small' }}>Detailed logs with your comments</em>
                ) : (
                  <em style={{ fontSize: 'small' }}>Minimal logs</em>
                )
              }
              <ul className={baseClasses.compactList}>
                {logs.items.map(({ ts, text }) => (
                  <li key={ts}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '8px',
                      }}
                    >
                      <div>{getModifiedJobLogText({ text, jobs, users: users.items })}</div>
                      <em
                        style={{
                          color: 'gray',
                          whiteSpace: 'pre-wrap',
                          fontSize: 'x-small',
                          paddingTop: '3px',
                          textAlign: 'right',
                        }}
                      >{dayjs(ts).format('YYYY.MM.DD HH:mm').split(' ').join('\n')}</em>
                    </div>
                  </li>
                ))}
              </ul>
            </ResponsiveBlock>
          </ResponsiveBlock>
        )
      }
    </ResponsiveBlock>
  )
})
