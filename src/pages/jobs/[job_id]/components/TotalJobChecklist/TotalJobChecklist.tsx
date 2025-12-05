import { memo, useMemo } from 'react'
import { TJob, TLogChecklistItem, TopLevelContext } from '~/shared/xstate'
// import baseClasses from '~/App.module.scss'
import { SimpleCheckList } from '~/shared/components'
// import dayjs from 'dayjs'
// -- EXP
import __TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import ru from 'javascript-time-ago/locale/ru'
// --

__TimeAgo.addDefaultLocale(en)
__TimeAgo.addLocale(ru)

const timeAgo = new __TimeAgo('en-US')

type TProps = {
  job_id: number;
}

export const TotalJobChecklist = memo(({ job_id }: TProps) => {
  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const targetJob = useMemo<TJob | null>(() => jobs
    .filter((j) => j.id === job_id)?.[0] || null, [jobs, job_id])

  const targetJobTotalChecklistMaping = useMemo<{ [key: string]: { c: TLogChecklistItem[]; logTs: number; text: string; } }>(() =>
    !!targetJob && targetJob?.logs.items.length > 0
      ? targetJob?.logs.items
        .reduce((acc: { [key: string]: { c: TLogChecklistItem[]; logTs: number; text: string; } }, curLog) => {
          if (!!curLog.checklist && curLog.checklist.length > 0) {
            const uniqueKey = `job-${targetJob.id}-log-${curLog.ts}-checklist`
            acc[uniqueKey] = {
              c: curLog.checklist,
              logTs: curLog.ts,
              text: curLog.text,
            }
          }
          return acc
        }, {})
      : {},
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetJob, targetJob?.ts.update]
  )

  const jobsActorRef = TopLevelContext.useActorRef()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {
        (!targetJob || Object.keys(targetJobTotalChecklistMaping).length === 0) && (
          <em>No checklists</em>
        )
      }
      {
        !!targetJob && Object.keys(targetJobTotalChecklistMaping).map((checklistKey, i) => (
          <SimpleCheckList
            isCopiable
            addLogLinkBtns={[
              {
                label: 'Log',
                relativeUrl: [
                  `/jobs/${targetJob.id}/logs/${targetJobTotalChecklistMaping[checklistKey].logTs}`,
                  [
                    '?',
                    [
                      `from=${encodeURIComponent(`/jobs/${targetJob.id}`)}`,
                      `backActionUiText=${encodeURIComponent('Job page')}`,
                    ].join('&')
                  ].join('')
                ].join(''),
              }
            ]}
            checklistUniqueKey={checklistKey}
            key={`${checklistKey}-${i}-${targetJob?.ts.update || 'no_target_job'}`}
            // _additionalInfo={{ message: 'No helpful info' }}
            isMiniVariant
            items={targetJobTotalChecklistMaping[checklistKey].c}
            // -- NOTE: Exp
            // infoLabel={`Created ${dayjs(targetJobTotalChecklistMaping[checklistKey].logTs).format('DD.MM.YYYY HH:mm')}`}
            infoLabel={[
              // dayjs(targetJobTotalChecklistMaping[checklistKey].logTs).format('DD.MM.YYYY HH:mm'),
              timeAgo.format(targetJobTotalChecklistMaping[checklistKey].logTs),
              // targetJobTotalChecklistMaping[checklistKey].text,
            ].join('\n\n')}
            isInfoLabelClickable
            // --
            createBtnLabel='Create checklist'
            isCreatable={false}
            isDeletable={false}
            isEditable={true}
            // onDeleteChecklist={console.info}
            onCreateNewChecklistItem={({ state }) => {
              // console.log(state)
              jobsActorRef.send({
                type: 'todo.addChecklistItemInLog',
                value: {
                  jobId: targetJob.id,
                  logTs: targetJobTotalChecklistMaping[checklistKey].logTs,
                  state,
                },
              })
            }}
            onEditChecklistItem={({ state, checklistItemId, cleanup }) => {
              console.log(state)
              jobsActorRef.send({
                type: 'todo.editChecklistItemInLog',
                value: {
                  jobId: targetJob.id,
                  logTs: targetJobTotalChecklistMaping[checklistKey].logTs,
                  checklistItemId,
                  state,
                },
              })
              cleanup()
            }}
          />
        ))
      }
    </div>
  )
})
