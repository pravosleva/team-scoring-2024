import { memo, useCallback } from 'react'
import baseClasses from '~/App.module.scss'
import { ResponsiveBlock, SimpleCheckList } from '~/shared/components'
import dayjs from 'dayjs'
// import ToggleOnIcon from '@mui/icons-material/ToggleOn'
// import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart'
import SettingsIcon from '@mui/icons-material/Settings'
import { getModifiedJobLogText } from '~/pages/jobs/[job_id]/utils/getModifiedJobLogText'
import { TopLevelContext, TJob } from '~/shared/xstate'
import { Link } from 'react-router-dom'
import { CopyToClipboardWrapper } from '~/shared/components'
import { FixedNavControlsSpace } from '../ActiveJobContent/components'
import { useInView } from 'react-hook-inview'
import { scrollToIdFactory } from '~/shared/utils/web-api-ops'
import { getUniqueKey, idbInstance } from '~/shared/utils/indexed-db-ops'

type TPros = {
  job: TJob;
  // jobTsUpdate: TJob['ts']['update'];
}

const specialScroll = scrollToIdFactory({
  timeout: 200,
  offsetTop: 100,
  elementHeightCritery: 550,
})

export const JobAdditionalInfo = memo(({ job }: TPros) => {
  const {
    logs,
    // ...withoutLogs,
  } = job
  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const users = TopLevelContext.useSelector((s) => s.context.users)
  const __auxJoblistUpdateSensor = TopLevelContext.useSelector((s) => s.context.jobs.__auxJoblistUpdateSensor)

  const jobsActorRef = TopLevelContext.useActorRef()
  const handleDeleteLog = useCallback(({ logTs, text }: { logTs: number; text: string }) => () => {
    const isConfirmed = window.confirm(`⛔ Удалить лог от ${dayjs(logTs).format('DD.MM.YYYY HH:mm')}?\n\n${text}`)
    if (!isConfirmed)
      return

    idbInstance.removeImagesPack({
      // key: `job_id-${job.id}--log_ts-${logTs}`,
      key: getUniqueKey({ jobId: job.id, logTs }),
      cb: {
        onSuccess: ({ ok: _ok, message }) => {
          console.log(`☑️ OK: ${message || 'No message'}`)
          jobsActorRef.send({
            type: 'todo.deleteLog',
            value: {
              jobId: job.id,
              logTs,
            },
          })
        },
        onFuckup: ({ ok: _ok, message }) => {
          console.log(`⛔ ERR: ${message || 'No message'}`)
        }
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
  const _handleOpenLogEditor = useCallback(({ logTs, text }: { logTs: number, text: string }) => () => {
    const isConfirmed = window.confirm(`✒️ Редактировать лог от ${dayjs(logTs).format('DD.MM.YYYY HH:mm')}?\n\n${text}`)
    if (!isConfirmed)
      return

    const newText = window.prompt('New text', text)
    if (!newText) return
    else {
      handleEditLog({ logTs, text: newText })
    }
  }, [handleEditLog])

  // const goToLogPage = useCallback(({ ts }: { ts: number }) => () => {
  //   // /jobs/:job_id/logs/:log_ts
  // }, [job.id])

  const [logsTopRef, inViewLogsTop] = useInView()

  return (
    <>
      <FixedNavControlsSpace
        isRequired={!inViewLogsTop}
        onClick={() => specialScroll({ id: 'logBoxHeader' })}
        label='LOGS'
      />
      <ResponsiveBlock>
        {/* <pre
          className={baseClasses.preNormalized}
          style={{ borderRadius: 0, }}
        >{JSON.stringify(withoutLogs, null, 2)}</pre> */}
        {
          logs.items.length > 0 && (
            <ResponsiveBlock
              style={{
                // padding: '16px 16px 0px 16px',
                padding: '0px 16px 0px 16px',
              }}
            >
              <h3 ref={logsTopRef} id='logBoxHeader' style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                <span>[ Logs: {job.logs.isEnabled ? 'detailed' : 'minimal'}</span>
                {job.logs.isEnabled ? <SettingsIcon /> : <MonitorHeartIcon />}
                <span>]</span>
              </h3>

              <ResponsiveBlock
                className={baseClasses.stack1}
                key={__auxJoblistUpdateSensor}
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
                <ul className={baseClasses.compactList2}>
                  {logs.items.map(({ ts, text, links, checklist }) => (
                    <li key={`${__auxJoblistUpdateSensor}-${ts}`}>
                      <em
                        style={{
                          color: '#959eaa',
                          // whiteSpace: 'pre-wrap',
                          fontSize: 'x-small',
                          fontWeight: 'bold',
                          paddingTop: '3px',
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{dayjs(ts).format('DD.MM.YYYY HH:mm')}</span>
                        <span
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '8px',
                            justifyContent: 'flex-start',
                          }}
                        >
                          {/* <a style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={handleOpenLogEditor({ logTs: ts, text })}>EDIT</a> */}
                          <a style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={handleDeleteLog({ logTs: ts, text })}>DELETE</a>
                          {/* <a style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={goToLogPage({ ts })}>GO LOG PAGE ➡️</a> */}
                          <Link to={`/jobs/${job.id}/logs/${ts}`}>LOG PAGE ➡️</Link>
                        </span>
                      </em>

                      <div style={{ fontWeight: 'bold' }}>{getModifiedJobLogText({ text, jobs, users: users.items })}</div>

                      {
                        !!checklist && checklist?.length > 0 && (
                          <div>
                            <SimpleCheckList
                              isCopiable
                              // connectedOnThe={['top']}
                              isMiniVariant
                              items={checklist || []}
                              infoLabel='Checklist'
                              createBtnLabel='Create checklist'
                              isCreatable={false}
                              isDeletable={false}
                              isEditable={true}
                              // onDeleteChecklist={console.info}
                              onCreateNewChecklistItem={({ state }) => {
                                jobsActorRef.send({ type: 'todo.addChecklistItemInLog', value: { jobId: job.id, logTs: ts, state } })
                              }}
                              onEditChecklistItem={({ state, checklistItemId, cleanup }) => {
                                jobsActorRef.send({
                                  type: 'todo.editChecklistItemInLog',
                                  value: {
                                    jobId: job.id,
                                    logTs: ts,
                                    checklistItemId,
                                    state,
                                  },
                                })
                                cleanup()
                              }}
                            />
                          </div>
                        )
                      }

                      {
                        Array.isArray(links) && links.length > 0 && (
                          <span
                            className={baseClasses.truncate}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-end',
                              gap: '4px',
                            }}
                          >
                            {
                              links.map((link) => (
                                <span className={baseClasses.truncate} key={link.id}>
                                  {/* <a href={link.url} target='_blank'>{link.title}</a> */}
                                  <CopyToClipboardWrapper
                                    text={link.url}
                                    uiText={link.title}
                                    showNotifOnCopy
                                  />
                                </span>
                              ))
                            }
                          </span>
                        )
                      }

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
    </>
  )
})
