import { memo, useCallback } from 'react'
import baseClasses from '~/App.module.scss'
import { ResponsiveBlock } from '~/shared/components'
import dayjs from 'dayjs'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import { getModifiedJobLogText } from '~/pages/jobs/[id]/utils/getModifiedJobLogText'
// import { DialogAsButton } from '~/shared/components/Dialog'
import { TopLevelContext, TJob } from '~/shared/xstate'

type TPros = {
  job: TJob;
}

export const JobAdditionalInfo = memo(({ job }: TPros) => {
  const { logs, ...withoutLogs } = job
  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const users = TopLevelContext.useSelector((s) => s.context.users)

  const jobsActorRef = TopLevelContext.useActorRef()
  const handleDeleteLog = useCallback(({ logTs, text }: { logTs: number; text: string }) => () => {
    const isConfirmed = window.confirm(`⛔ Удалить лог от ${dayjs(logTs).format('YYYY.MM.DD HH:mm')}?\n\n${text}`)
    if (!isConfirmed)
      return

    jobsActorRef.send({
      type: 'todo.deleteLog',
      value: {
        jobId: job.id,
        logTs,
      },
    })
  }, [job.id])
  const handleEditLog = useCallback(({ text, logTs }: { text: string; logTs: number }) => {
    jobsActorRef.send({
      type: 'todo.editLog',
      value: {
        jobId: job.id,
        logTs,
        text,
      },
    })
  }, [job.id])
  const handleOpenLogEditor = useCallback(({ logTs, text }: { logTs: number, text: string }) => () => {
    const isConfirmed = window.confirm(`✒️ Редактировать лог от ${dayjs(logTs).format('YYYY.MM.DD HH:mm')}?\n\n${text}`)
    if (!isConfirmed)
      return

    const newText = window.prompt('New text', text)
    if (!newText) return
    else {
      handleEditLog({ logTs, text: newText })
    }
  }, [handleEditLog])
  
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
            <h3 id='logBoxHeader' style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
              <span>[ Logs: {job.logs.isEnabled ? 'detailed' : 'minimal'}</span>
              {job.logs.isEnabled ? <ToggleOnIcon /> : <ToggleOffIcon />}
              <span>]</span>
            </h3>
            
            <ResponsiveBlock
              className={baseClasses.stack1}
            >
              <div>
                {
                  job.logs.isEnabled ? (
                    <em style={{ fontSize: 'small' }}>Detailed logs with your comments</em>
                  ) : (
                    <em style={{ fontSize: 'small' }}>Minimal logs</em>
                  )
                }
              </div>
              <ul className={baseClasses.compactList}>
                {logs.items.map(({ ts, text }) => (
                  <li key={ts}>
                    <em
                      style={{
                        color: 'gray',
                        // whiteSpace: 'pre-wrap',
                        fontSize: 'x-small',
                        paddingTop: '3px',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{dayjs(ts).format('YYYY.MM.DD HH:mm')}</span>
                      <span
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          gap: '8px',
                          justifyContent: 'flex-start',
                        }}
                      >
                        <a style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer' }} onClick={handleOpenLogEditor({ logTs: ts, text })}>EDIT</a>
                        <a style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer' }} onClick={handleDeleteLog({ logTs: ts, text })}>DELETE</a></span>
                    </em>
                    <div style={{ fontWeight: 'bold' }}>{getModifiedJobLogText({ text, jobs, users: users.items })}</div>
                    
                    {/* {
                      <DialogAsButton
                        modal={{
                          title: 'Edit log',
                        }}
                        btn={{
                          label: 'Edit',
                          // startIcon: <AddIcon />,
                        }}
                        targetAction={{
                          label: 'Save',
                          isEnabled: true,
                          onClick: ({ form }) => {
                            console.log(form)
                            if (typeof form.text === 'string' && !!form.displayName) {
                              // topLevelActorRef.send({ type: 'user.commit', value: { displayName: form.displayName } })
                              handleEditLog({ text: form.text, logTs: ts })
                              return Promise.resolve({ ok: true })
                            }
                            return Promise.reject({ ok: false, message: 'Err' })
                          },
                        }}
                        scheme={{
                          text: {
                            initValue: text,
                            label: 'Text',
                            type: 'string',
                            gridSize: 12,
                            isRequired: true,
                            validator: ({ value }) => {
                              const limit = 500
                              const res: { ok: boolean; message?: string } = { ok: true }
                              switch (true) {
                                case typeof value !== 'string':
                                case value.length === 0:
                                  res.ok = false
                                  res.message = `Expected not empty string (received ${typeof value}: "${String(value)}")`
                                  break
                                case value.length >= limit:
                                  res.ok = false
                                  res.message = `Limit ${limit} reached (${value.length})`
                                  break
                                default:
                                  break
                              }
                              return res
                            },
                          },
                        }}
                      />
                    } */}
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
